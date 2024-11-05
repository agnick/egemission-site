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
            <a href="tel:+71234567890">+7 123 456 78 90</a>
          </li>
          <li>
            <strong>Почта:</strong>{" "}
            <a href="mailto:info@example.com">info@example.com</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Contacts;
