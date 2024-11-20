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

// Функция для создания временной ссылки
const createTemporaryInviteLink = async (chatId, paymentId) => {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/createChatInviteLink`,
      {
        chat_id: chatId,
        expire_date: Math.floor(Date.now() / 1000) + 86400, // Срок действия (24 часа)
        member_limit: 1, // Один пользователь
        start_param: paymentId, // Уникальный параметр
      },
    );

    if (response.data.ok) {
      return response.data.result.invite_link;
    } else {
      console.error("Ошибка при создании ссылки:", response.data.description);
      throw new Error(response.data.description);
    }
  } catch (error) {
    console.error("Ошибка при создании ссылки:", error.message);
    throw error;
  }
};

// Функция для выбора канала в зависимости от курса
const getChatIdForCourse = (description) => {
  if (
    description.includes("СДЕЛАЙ СЕБЯ САМ") &&
    description.includes("Математика")
  ) {
    return process.env.DO_IT_YOURSELF_MATH_CHAT_ID;
  } else if (
    description.includes("СДЕЛАЙ СЕБЯ С НАМИ") &&
    description.includes("Математика")
  ) {
    return process.env.MAKE_YOURSELF_WITH_US_MATH_CHAT_ID;
  } else if (
    description.includes("СДЕЛАЙ СЕБЯ САМ") &&
    description.includes("Русский")
  ) {
    return process.env.DO_IT_YOURSELF_RUSSIAN_CHAT_ID;
  } else if (
    description.includes("СДЕЛАЙ СЕБЯ С НАМИ") &&
    description.includes("Русский")
  ) {
    return process.env.MAKE_YOURSELF_WITH_US_RUSSIAN_CHAT_ID;
  }
  throw new Error("Неизвестный курс");
};

app.post("/send-email", async (req, res) => {
  const { name, phone, email, contactMethod } = req.body;

  const mailText = `
  <p>Спасибо за заявку! Мы свяжемся с Вами в ближайшее время.</p>
  <p><em>Ваш помощник в мире знаний, ЕГЭmission</em></p>
  `;

  // Отправка email пользователю
  const mailOptions = {
    from: process.env.EMAIL_NAME,
    to: email,
    subject: "Ваша заявка принята!",
    html: mailText,
  };

  try {
    // Отправляем email
    await transporter.sendMail(mailOptions);

    // Отправляем данные в Telegram менеджера
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_MANAGER_ID;
    const message = `Новая заявка на обратную связь:\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nСпособ связи: ${contactMethod}`;

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
  const password = process.env.TINKOFF_TERMINAL_PASSWORD;

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
    { SuccessURL: params.SuccessURL || undefined },
    { FailURL: params.FailURL || undefined },
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
    TerminalKey: process.env.TINKOFF_TERMINAL_KEY,
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
    SuccessURL: "https://egemission.ru/?paymentStatus=success",
    FailURL: "https://egemission.ru/?paymentStatus=failed",
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
        description,
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

        // Генерация ссылки для канала
        const chatId = getChatIdForCourse(payment.description);
        const inviteLink = await createTemporaryInviteLink(
          chatId,
          payment.paymentId,
        );
        const publicLink = "https://t.me/egemission";

        // Определяем дату начала курса
        let startDate = "";
        if (payment.description.includes("Математика")) {
          startDate = "25 ноября";
        } else if (payment.description.includes("Русский")) {
          startDate = "5 декабря";
        }

        const mailText = `
  <p>С радостью сообщаем вам, что ваша оплата за курс подготовки к ЕГЭ по <strong>${
    payment.description.includes("Математика") ? "математике" : "русскому языку"
  }</strong> успешно зарегистрирована! Спасибо, что выбрали нас. Ваш курс начнётся <strong>${startDate}</strong>. Ниже прикрепляем вам ссылки на каналы, где будет размещена вся необходимая информация.</p>
  <p>Общий канал с информацией: <a href="${publicLink}">${publicLink}</a></p>
  <p>Персональная ссылка на ваш курс: <a href="${inviteLink}">${inviteLink}</a></p>
  <p><strong>Обращаем ваше внимание</strong>, что ссылки действуют <strong>24 часа</strong>, также, по ссылке на канал можно перейти только <strong>ОДИН</strong> раз. Мы рады видеть вас в нашей команде, ведь вместе мы сила!</p>
  <p><em>Ваш помощник в мире знаний, ЕГЭmission</em></p>
`;

        // Отправляем email
        const mailOptions = {
          from: process.env.EMAIL_NAME,
          to: payment.email,
          subject: "Подтверждение оплаты курса подготовки к ЕГЭ",
          html: mailText,
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

// Обработка webhook для переходов по ссылке
app.post("/webhook/telegram", async (req, res) => {
  try {
    console.log("Incoming webhook data:", JSON.stringify(req.body, null, 2));

    const { message, my_chat_member } = req.body;

    if (message && message.chat && message.chat.id && message.text) {
      const telegramUserId = message.chat.id;
      const userMessage = message.text;

      const payment = pendingPayments.find((p) =>
        userMessage.includes(p.paymentId),
      );

      if (!payment) {
        console.error("Payment not found for the given message.");
        return res.status(404).send("Payment not found");
      }

      const connectionTime = new Date().toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      });

      const managerMessage = `
        Новый пользователь подключился к курсу:
        - ФИО: ${payment.name}
        - Номер телефона: ${payment.phone}
        - Email: ${payment.email}
        - Курс: ${payment.description}
        - Telegram ID: ${telegramUserId}
        - Дата подключения к курсу: ${connectionTime}
      `;

      await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: process.env.TELEGRAM_MANAGER_ID,
          text: managerMessage,
        },
      );

      return res.status(200).send("Webhook processed successfully");
    }

    if (
      my_chat_member &&
      my_chat_member.chat &&
      my_chat_member.new_chat_member
    ) {
      const chatId = my_chat_member.chat.id;
      const userId = my_chat_member.from.id;
      const status = my_chat_member.new_chat_member.status;

      console.log(
        `User ${userId} changed status in chat ${chatId} to ${status}`,
      );

      if (status === "member" || status === "administrator") {
        const connectionTime = new Date().toLocaleString("ru-RU", {
          timeZone: "Europe/Moscow",
        });

        const managerMessage = `
          Пользователь ${my_chat_member.from.first_name} (${my_chat_member.from.username || "Без имени"})
          только что присоединился к чату ${my_chat_member.chat.title}.

          ID чата: ${chatId}
          Дата подключения: ${connectionTime}
        `;

        await axios.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            chat_id: process.env.TELEGRAM_MANAGER_ID,
            text: managerMessage,
          },
        );

        return res.status(200).send("Member status processed successfully");
      }
    }

    res.status(400).send("Invalid webhook format");
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    res.status(500).send("Error processing webhook");
  }
});

// Запускаем проверку каждые 10 секунд
setInterval(checkPaymentStatus, 10000);

app.listen(5000, () => {
  console.log("Сервер запущен на порту 5000");
});
