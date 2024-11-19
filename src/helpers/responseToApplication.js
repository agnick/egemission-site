const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");
const crypto = require("crypto");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(morgan("combined"));

const pendingPayments = [];

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
  const password = process.env.TINKOFF_TEST_TERMINAL_PASSWORD;

  let tokenData = [
    { Amount: params.Amount ? params.Amount.toString() : undefined },
    { Description: params.Description || undefined },
    { OrderId: params.OrderId || undefined },
    { PaymentId: params.PaymentId || undefined },
    { Password: password || undefined },
    { CustomerKey: params.CustomerKey || undefined },
    { Recurrent: params.Recurrent || undefined },
    { TerminalKey: params.TerminalKey || undefined },
    { Language: params.Language || undefined },
  ].filter((param) => Object.values(param)[0] !== undefined);

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

    if (response.data.Success) {
      // Добавляем задачу в очередь
      pendingPayments.push({
        paymentId: response.data.PaymentId,
        email,
        name: `${req.body.firstName} ${req.body.lastName}`,
        amount,
      });

      res.status(200).json(response.data);
    } else {
      res.status(400).json({ message: response.data.Message });
    }
  } catch (error) {
    console.error("Ошибка при инициализации платежа:", error);
    res.status(500).json({ message: "Ошибка при инициализации платежа." });
  }
});

// Проверка статуса платежей
const checkPaymentStatus = async () => {
  for (const payment of pendingPayments) {
    try {
      const params = {
        TerminalKey: process.env.TINKOFF_TEST_TERMINAL_KEY,
        PaymentId: payment.paymentId,
      };

      params.Token = generateToken(params);

      const response = await axios.post(
        "https://securepay.tinkoff.ru/v2/GetState",
        params,
      );

      const data = response.data;

      if (data.Success && data.Status === "CONFIRMED") {
        // Удаляем платеж из очереди
        const index = pendingPayments.findIndex(
          (p) => p.paymentId === payment.paymentId,
        );
        if (index !== -1) pendingPayments.splice(index, 1);

        // Отправляем email
        const mailOptions = {
          from: process.env.EMAIL_NAME,
          to: payment.email,
          subject: "Оплата подтверждена — доступ к занятиям",
          text: `Привет, ${payment.name}!\n\nВаша оплата прошла успешно. Спасибо, что выбрали нас!`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email отправлен для платежа: ${payment.paymentId}`);
      } else if (
        !data.Success ||
        data.Status === "CANCELED" ||
        data.Status === "REJECTED"
      ) {
        // Удаляем отклоненные или ошибочные платежи из очереди
        const index = pendingPayments.findIndex(
          (p) => p.paymentId === payment.paymentId,
        );
        if (index !== -1) pendingPayments.splice(index, 1);

        console.log(`Платеж отклонен: ${payment.paymentId}`);
      }
    } catch (error) {
      console.error(
        `Ошибка проверки статуса платежа ${payment.paymentId}:`,
        error,
      );
    }
  }
};

// Запускаем проверку каждые 10 секунд
setInterval(checkPaymentStatus, 10000);

app.listen(5000, () => {
  console.log("Сервер запущен на порту 5000");
});
