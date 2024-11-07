import React, { useState } from "react";
import "./tariffs.css";
import { FaCheckCircle, FaBolt } from "react-icons/fa";
import scrollToSection from "../../helpers/scrollToSection";

const Tariffs = () => {
  const [selectedSubject, setSelectedSubject] = useState("Русский");

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
  };

  const getTariffData = () => {
    if (selectedSubject === "Русский" || selectedSubject === "Математика") {
      return {
        basic: {
          title: "СДЕЛАЙ СЕБЯ САМ",
          month: "2 990 ₽",
          full: "17 990 ₽",
          oldMonth: "3 490 ₽",
          oldFull: "19 990 ₽",
          bonusText: `Все, что есть в тарифе "СДЕЛАЙ СЕБЯ САМ" + бонусы`,
          bonusColor: "#B94A70",
        },
        premium: {
          title: "СДЕЛАЙ СЕБЯ С НАМИ",
          month: "3 990 ₽",
          full: "23 990 ₽",
          oldMonth: "4 490 ₽",
          oldFull: "26 490 ₽",
          bonusText: `Все, что есть в тарифе "СДЕЛАЙ СЕБЯ САМ" + бонусы`,
          bonusColor: "#FFD700",
        },
      };
    } else {
      return {
        basic: {
          title: "СЫН МАМИНОЙ ПОДРУГИ",
          month: "5 390 ₽",
          full: "31 990 ₽",
          oldMonth: "6 390 ₽",
          oldFull: "35 990 ₽",
          bonusText: "Курс по двум предметам",
          bonusColor: "#B94A70",
        },
        premium: {
          title: "МАМИН «ТЕМЩИК»",
          month: "7 190 ₽",
          full: "42 990 ₽",
          oldMonth: "8 190 ₽",
          oldFull: "47 990 ₽",
          bonusText: "Курс по двум предметам",
          bonusColor: "#FFD700",
        },
      };
    }
  };

  const { basic, premium } = getTariffData();

  return (
    <>
      <section id="tariffs" className="tariffs">
        <h2>
          Наши тарифы по{" "}
          {selectedSubject === "Русский"
            ? "русскому языку"
            : selectedSubject === "Математика"
              ? "математике"
              : "русскому языку и математике"}
        </h2>

        <div className="subject-buttons">
          <button
            className={`subject-button ${
              selectedSubject === "Русский" ? "active" : ""
            }`}
            onClick={() => handleSubjectChange("Русский")}
          >
            Русский
          </button>
          <button
            className={`subject-button ${
              selectedSubject === "Математика" ? "active" : ""
            }`}
            onClick={() => handleSubjectChange("Математика")}
          >
            Математика
          </button>
          <button
            className={`subject-button ${
              selectedSubject === "1+1" ? "active" : ""
            }`}
            onClick={() => handleSubjectChange("1+1")}
          >
            1+1
          </button>
        </div>

        <div className="tariff-cards">
          {/* Basic Tariff Card */}
          <div className="tariff-card">
            <h3>{basic.title}</h3>
            {selectedSubject === "1+1" && (
              <div
                className="bonus-box"
                style={{ backgroundColor: basic.bonusColor }}
              >
                <FaBolt className="icon" /> {basic.bonusText}
              </div>
            )}
            <ul>
              <li>
                <FaCheckCircle className="check-icon red-check" /> Доступ к
                теоретическим вебинарам в записи
              </li>
              <li>
                <FaCheckCircle className="check-icon red-check" /> Проверка
                домашнего задания
              </li>
              <li>
                <FaCheckCircle className="check-icon red-check" /> Возможность
                задать вопросы после каждого ДЗ
              </li>
              <li>
                <FaCheckCircle className="check-icon red-check" /> Аналитика
                прогресса
              </li>
              <li>
                <FaCheckCircle className="check-icon red-check" />{" "}
                Индивидуальный план на 70+ баллов
              </li>
            </ul>
            <div className="price">
              <p>
                Месяц - <strong>{basic.month}</strong>{" "}
                <span className="old-price">{basic.oldMonth}</span>
              </p>
              <p>
                Целиком - <strong>{basic.full}</strong>{" "}
                <span className="old-price">{basic.oldFull}</span>
              </p>
            </div>
            <button className="pay-button">Оплатить курс за месяц</button>
            <button className="pay-button full">Оплатить курс целиком</button>
            <button
              className="details-button"
              onClick={() => scrollToSection("form")}
            >
              Узнать подробности
            </button>
          </div>

          {/* Premium Tariff Card */}
          <div className="tariff-card premium premium-highlight">
            <h3>{premium.title}</h3>
            <div
              className="bonus-box"
              style={{ backgroundColor: premium.bonusColor }}
            >
              <FaBolt className="icon" />{" "}
              {selectedSubject === "1+1"
                ? "Курс по двум предметам"
                : premium.bonusText}
            </div>
            <ul>
              <li>
                <FaCheckCircle className="check-icon yellow-check" /> Доступ ко
                всем теоретическим и практическим вебинарам онлайн
              </li>
              <li>
                <FaCheckCircle className="check-icon yellow-check" />{" "}
                Возможность задать вопросы 24/7
              </li>
              <li>
                <FaCheckCircle className="check-icon yellow-check" /> Аналитика
                прогресса и рекомендации
              </li>
              <li>
                <FaCheckCircle className="check-icon yellow-check" />{" "}
                Индивидуальный план на 80+ баллов
              </li>
              <li>
                <FaCheckCircle className="check-icon yellow-check" /> Система
                зачётов
              </li>
            </ul>
            <div className="price">
              <p>
                Месяц - <strong>{premium.month}</strong>{" "}
                <span className="old-price">{premium.oldMonth}</span>
              </p>
              <p>
                Целиком - <strong>{premium.full}</strong>{" "}
                <span className="old-price">{premium.oldFull}</span>
              </p>
            </div>
            <button className="pay-button">Оплатить курс за месяц</button>
            <button className="pay-button full premium-btn">
              Оплатить курс целиком
            </button>
            <button
              className="details-button"
              onClick={() => scrollToSection("form")}
            >
              Узнать подробности
            </button>
          </div>
        </div>

        {/* Centered "Договор-оферта" button */}
        <a
          href="/Договор_публичной_оферты_об_оказании_платных_образовательных_услуг.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="offer-button"
        >
          Публичная оферта
        </a>
      </section>
      <div className="section-divider"></div>
    </>
  );
};

export default Tariffs;
