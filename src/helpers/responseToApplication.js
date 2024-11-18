const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");
const crypto = require("crypto");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(morgan("combined"));

// Перехватчики для логирования запросов и ответов Axios
axios.interceptors.request.use((request) => {
  console.log("Axios Request:", {
    url: request.url,
    method: request.method,
    data: request.data,
    headers: request.headers,
  });
  return request;
});

axios.interceptors.response.use(
  (response) => {
    console.log("Axios Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("Axios Error Response:", {
        url: error.response.config.url,
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error("Axios Request Error:", error.message);
    }
    return Promise.reject(error);
  },
);

// Настройки Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.yandex.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_NAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post("/send-email", async (req, res) => {
  const { name, phone, email, contactMethod } = req.body;

  // Отправка email пользователю
  const mailOptions = {
    from: process.env.EMAIL_NAME,
    to: email,
    subject: "Доступ к занятиям",
    text: `Привет, ${name}! Вот ссылка на занятия: https://translate.google.com/?hl=ru&sl=auto&tl=ru&op=translate`,
  };

  try {
    // Отправляем email
    await transporter.sendMail(mailOptions);

    // Отправляем данные в Telegram менеджера
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_MANAGER_ID;
    const message = `Новая заявка на бесплатный разбор:\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nСпособ связи: ${contactMethod}`;

    await axios.post(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        chat_id: telegramChatId,
        text: message,
      },
    );

    res
      .status(200)
      .json({ message: "Email и сообщение в Telegram отправлены!" });
  } catch (error) {
    console.error("Ошибка при отправке:", error);
    res.status(500).json({ message: "Ошибка при отправке." });
  }
});

// Function to generate the Tinkoff Token
function generateToken(params) {
  const {
    TerminalKey,
    Amount,
    OrderId,
    Description,
    CustomerKey,
    Recurrent,
    Language,
  } = params;

  const password = process.env.TINKOFF_TEST_TERMINAL_PASSWORD;

  let tokenData = [
    { Amount: Amount.toString() },
    { Description: Description },
    { OrderId: OrderId },
    { Password: password },
    { CustomerKey: CustomerKey },
    { Recurrent: Recurrent },
    { TerminalKey: TerminalKey },
    { Language: Language },
  ];

  tokenData = tokenData.sort((a, b) =>
    Object.keys(a)[0].localeCompare(Object.keys(b)[0]),
  );

  const tokenString = tokenData.map((pair) => Object.values(pair)[0]).join("");

  return crypto.createHash("sha256").update(tokenString).digest("hex");
}

// Маршрут для инициализации платежей через Tinkoff
app.post("/initiate-payment", async (req, res) => {
  const { amount, description, customerKey, email, phone } = req.body;

  const receipt = {
    Email: email,
    Phone: phone,
    Taxation: "usn_income",
    Items: [
      {
        Name: description,
        Price: amount,
        Quantity: 1,
        Amount: amount,
        PaymentObject: "service",
        Tax: "none",
      },
    ],
  };

  const params = {
    TerminalKey: process.env.TINKOFF_TEST_TERMINAL_KEY,
    Amount: amount,
    OrderId: Date.now().toString(),
    Description: description,
    Language: "ru",
    CustomerKey: customerKey,
    Recurrent: "N",
    DATA: {
      Email: email,
      Phone: phone,
    },
    Receipt: receipt, // Attach the structured receipt
  };

  params.Token = generateToken(params);

  try {
    const response = await axios.post(
      "https://securepay.tinkoff.ru/v2/Init",
      params,
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Ошибка при инициализации платежа:", error);
    res.status(500).json({ message: "Ошибка при инициализации платежа." });
  }
});

// Маршрут для проверки статуса оплаты и отправки email
app.post("/payment-status", async (req, res) => {
  const { paymentId, email, name } = req.body;

  if (!paymentId || !email || !name) {
    return res
      .status(400)
      .json({ message: "Отсутствуют обязательные параметры." });
  }

  try {
    const response = await axios.post(
      "https://securepay.tinkoff.ru/v2/GetState",
      {
        TerminalKey: process.env.TINKOFF_TEST_TERMINAL_KEY,
        PaymentId: paymentId,
        Token: "...",
      },
    );

    if (response.data.Success && response.data.Status === "CONFIRMED") {
      const mailOptions = {
        from: process.env.EMAIL_NAME,
        to: email,
        subject: "Доступ к занятиям",
        text: `Привет, ${name}! Вот ссылка на наш Telegram-канал для занятий: https://t.me/joinchat/XXXXX`,
      };

      await transporter.sendMail(mailOptions);
      return res
        .status(200)
        .json({ message: "Оплата подтверждена и email отправлен!" });
    } else if (!response.data.Success) {
      return res
        .status(400)
        .json({ message: `Ошибка: ${response.data.Message}` });
    } else {
      return res.status(200).json({ message: "Оплата еще не подтверждена." });
    }
  } catch (error) {
    console.error("Ошибка при проверке статуса платежа:", error);
    res.status(500).json({ message: "Ошибка при проверке статуса платежа." });
  }
});

app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});
