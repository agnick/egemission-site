import "./tariffs.css";

import React, { useState } from "react";
import { FaCheckCircle, FaBolt } from "react-icons/fa";
import scrollToSection from "../../helpers/scrollToSection";
import formatPhoneNumber from "../../helpers/helpers";

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

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
  };

  const openModal = (price, type, title) => {
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

  const validate = () => {
    let errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "Введите имя.";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Введите фамилию.";
    }

    if (!formData.lastName.trim()) {
      errors.middleName = "Введите отчество.";
    }

    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(formData.phone)) {
      errors.phone = "Введите корректный номер телефона.";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Введите корректный email.";
    }

    return errors;
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

    try {
      const response = await fetch("/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount * 100,
          description: `Оплата курса "${tariffTitle}" по предмету "${selectedSubject}"`,
          customerKey: formData.email,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.PaymentId) {
        // Перенаправление на страницу оплаты
        window.location.href = data.PaymentURL;

        // После редиректа проверяем статус платежа через определенный интервал
        const checkStatusInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch("/payment-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: data.PaymentId,
                email: formData.email,
                name: `${formData.firstName} ${formData.lastName}`,
              }),
            });

            const statusData = await statusResponse.json();

            console.log(statusData);

            if (
              statusResponse.ok &&
              statusData.message.includes("Оплата подтверждена")
            ) {
              clearInterval(checkStatusInterval);
              alert(
                "Оплата подтверждена! На вашу почту отправлена ссылка с приглашением в приватный телеграмм канал. Если письмо не пришло, проверьте папку спам!",
              );
            } else if (
              statusData.message.includes("Оплата еще не подтверждена")
            ) {
              console.log("Платеж еще не подтвержден. Проверяем далее...");
            } else {
              clearInterval(checkStatusInterval);
              alert(`Ошибка: ${statusData.message}`);
            }
          } catch (error) {
            clearInterval(checkStatusInterval);
            console.error("Ошибка при проверке статуса платежа:", error);
            alert(
              "Ошибка при проверке статуса платежа. Повторите попытку позже.",
            );
          }
        }, 10000); // Проверяем каждые 10 секунд
      } else {
        alert(`Ошибка при инициализации платежа: ${data.message}`);
      }
    } catch (error) {
      console.error("Ошибка при инициализации платежа:", error);
      alert("Ошибка при инициализации платежа. Повторите попытку позже.");
    }

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
                {errors.middleName && (
                  <p className="error">{errors.middleName}</p>
                )}

                <input
                  type="text"
                  name="phone"
                  placeholder="+7"
                  value={formData.phone}
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
                        setCheckboxError("");
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
          href="/documents/Договор_публичной_оферты_об_оказании_платных_образовательных_услуг.pdf"
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
