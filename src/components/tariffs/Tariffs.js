import React from "react";
import "./tariffs.css";
import { FaCheckCircle, FaBolt } from "react-icons/fa";
import scrollToSection from "../../helpers/scrollToSection";

const Tariffs = () => {
  return (
    <>
      <section id="tariffs" className="tariffs">
        <h2>Наши тарифы</h2>

        <div className="tariff-cards">
          {/* Карточка тарифа "Я сам" */}
          <div className="tariff-card">
            <h3>Я САМ</h3>
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
                Месяц - <strong>2 990 ₽</strong>{" "}
                <span className="old-price">3 490 ₽</span>
              </p>
              <p>
                Целиком - <strong>17 990 ₽</strong>{" "}
                <span className="old-price">19 990 ₽</span>
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

          {/* Карточка тарифа "Хочу с вами" */}
          <div className="tariff-card premium premium-highlight">
            <h3>ХОЧУ С ВАМИ</h3>
            <div className="bonus-box">
              <FaBolt className="icon" /> Все, что есть в тарифе "Я САМ" +
              бонусы
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
                Месяц - <strong>3 990 ₽</strong>{" "}
                <span className="old-price">4 490 ₽</span>
              </p>
              <p>
                Целиком - <strong>23 990 ₽</strong>{" "}
                <span className="old-price">26 490 ₽</span>
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
      </section>
      <div className="section-divider"></div>
    </>
  );
};

export default Tariffs;
