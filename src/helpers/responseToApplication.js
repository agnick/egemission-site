const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

// Настройки Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.yandex.ru",
  port: 465, // Используйте 587 для TLS
  secure: true, // true для SSL, false для TLS
  auth: {
    user: process.env.EMAIL_NAME, // Ваш email
    pass: process.env.EMAIL_PASSWORD, // Ваш пароль
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

app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});
