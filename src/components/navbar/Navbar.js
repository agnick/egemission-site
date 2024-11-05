import React, { useState } from "react";
import "./navbar.css";
import { Link, NavLink } from "react-router-dom";
import logo from "../../img/logo.png";
import scrollToSection from "../../helpers/scrollToSection";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav>
      <img className="navbar-logo" src={logo} alt="Логотип" />
      <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : ""}>
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
        <li>
          <a
            className="navbar-contact"
            href="https://t.me/egemission"
            target="_blank"
            rel="noopener noreferrer"
          >
            Связаться с нами в телеграмм @egemission
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
