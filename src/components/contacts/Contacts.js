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
              href="https://t.me/egemission"
              target="_blank"
              rel="noopener noreferrer"
            >
              @egemission
            </a>
          </li>
          <li>
            <strong>Телефон:</strong>{" "}
            <a href="tel:+79956288144">+7 995 628 81 44</a>
          </li>
          <li>
            <strong>Почта:</strong>{" "}
            <a href="mailto:egemission@yandex.ru">egemission@yandex.ru</a>
          </li>
        </ul>
      </div>

      <div className="business-info">
        <p>ИП Шарипова М.А. ИНН 860228612201. ОГРН 324861700105811</p>
        <a href="#" target="_blank" className="privacy-policy">
          Политика конфиденциальности
        </a>
      </div>
    </footer>
  );
};

export default Contacts;
