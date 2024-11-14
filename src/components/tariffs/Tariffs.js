import React, { useState } from "react";
import "./tariffs.css";
import { FaCheckCircle, FaBolt } from "react-icons/fa";
import scrollToSection from "../../helpers/scrollToSection";
import CryptoJS from "crypto-js";

const Tariffs = () => {
  const [selectedSubject, setSelectedSubject] = useState("Русский");
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [checkboxError, setCheckboxError] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentType, setPaymentType] = useState("");
  const [tariffTitle, setTariffTitle] = useState("");

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 1) return `+7`;
    if (cleaned.startsWith("7")) {
      const formatted = cleaned.match(
        /^7(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/,
      );
      if (formatted) {
        return `+7${formatted[1] ? ` (${formatted[1]}` : ""}${formatted[1] && formatted[1].length === 3 ? ")" : ""}${formatted[2] ? ` ${formatted[2]}` : ""}${formatted[3] ? `-${formatted[3]}` : ""}${formatted[4] ? `-${formatted[4]}` : ""}`;
      }
    }
    return value;
  };

  const validate = () => {
    let errors = {};
    if (!formData.firstName.trim()) {
      errors.firstName = "Введите имя.";
    }
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(formData.phone)) {
      errors.phone = "Введите корректный номер телефона.";
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Введите корректный email.";
    }
    return errors;
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

  const openModal = (price, type, title) => {
    // Удаляем символы валюты и пробелы, конвертируем в число
    const parsedPrice = parseInt(price.replace(/[^\d]/g, ""), 10);
    setAmount(parsedPrice);
    setPaymentType(type);
    setTariffTitle(title);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setErrors({});
    setCheckboxError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData({ ...formData, [name]: formattedPhone });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  function generateToken(params) {
    const password = "UiJclu%oqfWQuqGz"; // Укажите ваш пароль

    // Соберите параметры для создания строки для хеширования
    let tokenData = {
      TerminalKey: params.terminalkey,
      Amount: params.amount,
      OrderId: params.order,
      Description: params.description,
      Language: params.language,
      Frame: params.frame,
    };

    // Добавьте пароль в параметры
    tokenData.Password = password;

    //
    // Сортируйте ключи и создайте строку
    const sortedKeys = Object.keys(tokenData).sort();
    const concatenatedString = sortedKeys.map((key) => tokenData[key]).join("");

    // Создайте хеш SHA-256
    return CryptoJS.SHA256(concatenatedString).toString(CryptoJS.enc.Hex);
  }

  const initiatePayment = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0 || !isChecked) {
      setErrors(validationErrors);
      if (!isChecked) {
        setCheckboxError(
          "Необходимо принять условия политики обработки данных.",
        );
      }
      return;
    }

    const { firstName, lastName, middleName, phone, email } = formData;

    // Prepare the Tinkoff payment data
    const paymentData = {
      terminalkey: "1730997717244DEMO",
      frame: true, // Opens payment in a new window
      language: "ru",
      amount: amount * 100, // Amount in kopecks, so multiply by 100
      order: Date.now().toString(), // Unique order ID
      description: `Оплата курса "${tariffTitle}" по предмету "${selectedSubject}" (${paymentType})`,
      name: `${lastName} ${firstName} ${middleName}`,
      email,
      phone,
    };

    paymentData.token = generateToken(paymentData);

    // Create a hidden form element to submit the data.
    const form = document.createElement("form");
    form.setAttribute("id", "payform-tbank");
    form.setAttribute("name", "payform-tbank");
    form.setAttribute("class", "payform-tbank");

    // Add each payment data field to the form as hidden inputs
    Object.keys(paymentData).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form); // Append the form to the body temporarily
    window.pay(form); // Call the Tinkoff pay function
    document.body.removeChild(form); // Remove the form after submission

    closeModal();
  };

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
            <button
              onClick={() => openModal(basic.month, "месяц", basic.title)}
              className="pay-button"
            >
              Оплатить курс за месяц
            </button>
            <button
              onClick={() => openModal(basic.full, "полный курс", basic.title)}
              className="pay-button full"
            >
              Оплатить курс целиком
            </button>
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
            <button
              onClick={() => openModal(premium.month, "месяц", premium.title)}
              className="pay-button"
            >
              Оплатить курс за месяц
            </button>
            <button
              onClick={() =>
                openModal(premium.full, "полный курс", premium.title)
              }
              className="pay-button full premium-btn"
            >
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

        {/* Модальное окно с формой */}
        {isModalOpen && (
          <div className="modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="close" onClick={closeModal}>
                &times;
              </span>
              <h2>
                Оплата курса "{tariffTitle}" по {selectedSubject}: {paymentType}
              </h2>
              <form onSubmit={initiatePayment}>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Фамилия"
                  onChange={handleChange}
                />
                {errors.lastName && <p className="error">{errors.lastName}</p>}

                <input
                  type="text"
                  name="firstName"
                  placeholder="Имя"
                  onChange={handleChange}
                />
                {errors.firstName && (
                  <p className="error">{errors.firstName}</p>
                )}

                <input
                  type="text"
                  name="middleName"
                  placeholder="Отчество"
                  onChange={handleChange}
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Телефон"
                  onChange={handleChange}
                />
                {errors.phone && <p className="error">{errors.phone}</p>}

                <input
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  onChange={handleChange}
                />
                {errors.email && <p className="error">{errors.email}</p>}

                <div className="policy-checkbox">
                  <div className="policy-container">
                    <input
                      type="checkbox"
                      id="policyCheck"
                      checked={isChecked}
                      onChange={() => {
                        setIsChecked(!isChecked);
                        setCheckboxError(""); // Clear checkbox error on change
                      }}
                    />
                    <label htmlFor="policyCheck">
                      Я принимаю условия{" "}
                      <a
                        href="/Политика конфиденциальности.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        политики обработки данных
                      </a>{" "}
                      и даю{" "}
                      <a
                        href="/Пользовательское соглашение .pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        согласие на обработку персональных данных
                      </a>
                      .
                    </label>
                  </div>
                  {checkboxError && <p className="error">{checkboxError}</p>}{" "}
                  {/* Checkbox error message below */}
                </div>

                <button type="submit" className="pay-button">
                  Оплатить {amount}
                </button>
              </form>
            </div>
          </div>
        )}

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
