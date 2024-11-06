import React from "react";
import "./contacts.css";

const Contacts = () => {
  return (
    <footer className="contacts">
      <div className="contacts-container">
        <h2>Контакты</h2>
        <ul>
          <li>
            <strong>Telegram Manager:</strong>{" "}
            <a
              href="https://t.me/manager"
              target="_blank"
              rel="noopener noreferrer"
            >
              @egemission
            </a>
          </li>
          <li>
            <strong>Телефон:</strong>{" "}
            <a href="tel:+71234567890">+7 922 654 46 08</a>
          </li>
          <li>
            <strong>Почта:</strong>{" "}
            <a href="mailto:info@example.com">egemission@yandex.ru</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Contacts;
