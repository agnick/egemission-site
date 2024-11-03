import React from "react";
import "./navbar.css";
import logo from "../../img/logo.png";
import scrollToSection from "../../helpers/scrollToSection";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Логотип" />
      </div>
      <ul className="navbar-links">
        <li>
          <button onClick={() => scrollToSection("about")}>О нас</button>
        </li>
        <li>
          <button onClick={() => scrollToSection("course")}>О курсе</button>
        </li>
        <li>
          <button onClick={() => scrollToSection("pricing")}>Тарифы</button>
        </li>
        <li>
          <button onClick={() => scrollToSection("contacts")}>Контакты</button>
        </li>
      </ul>
      <div className="navbar-contact">
        <a
          href="https://t.me/egemission"
          target="_blank"
          rel="noopener noreferrer"
        >
          Связаться с нами в телеграмм @egemission
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
