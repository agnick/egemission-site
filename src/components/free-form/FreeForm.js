import "./free_form.css";

import React, { useState } from "react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import formatPhoneNumber from "../../helpers/helpers";

const FreeForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    contactMethod: "Телефон",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [checkboxError, setCheckboxError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData({ ...formData, [name]: formattedPhone });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleContactSelection = (method) => {
    setFormData({ ...formData, contactMethod: method });
  };

  const validate = () => {
    let errors = {};
    if (!formData.name.trim()) {
      errors.name = "Введите имя.";
    }
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(formData.phone)) {
      errors.phone = "Введите корректный номер телефона.";
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Введите корректный email.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
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

    setErrors({});
    setCheckboxError("");
    setIsSubmitted(false);
    setErrorMessage("");

    try {
      const response = await fetch("/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setErrorMessage("Произошла ошибка при отправке данных.");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      setErrorMessage("Произошла ошибка при отправке данных.");
    }
  };

  return (
    <>
      <div className="tariff-form">
        <h3>Заполни заявку и получи разбор одной темы бесплатно!</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Имя"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="+7"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <p className="error">{errors.phone}</p>}
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="example@mail.ru"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <p className="contact-title">Связаться со мной через</p>
          <div className="contact-options">
            <button
              type="button"
              className={`contact-option ${
                formData.contactMethod === "Телефон" ? "selected" : ""
              }`}
              onClick={() => handleContactSelection("Телефон")}
            >
              <span className="icon">
                <FaPhoneAlt />
              </span>{" "}
              Телефон
            </button>
            <button
              type="button"
              className={`contact-option ${
                formData.contactMethod === "WhatsApp" ? "selected" : ""
              }`}
              onClick={() => handleContactSelection("WhatsApp")}
            >
              <span className="icon">
                <FaWhatsapp />
              </span>{" "}
              WhatsApp
            </button>
          </div>

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
                  href="/documents/Политика конфиденциальности.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  политики обработки данных
                </a>{" "}
                и даю{" "}
                <a
                  href="/documents/Пользовательское соглашение .pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  согласие на обработку персональных данных
                </a>
                .
              </label>
            </div>
            {checkboxError && <p className="error">{checkboxError}</p>}{" "}
          </div>

          <button type="submit">Отправить заявку</button>
        </form>

        {isSubmitted && (
          <p className="success-message">
            Заявка успешно отправлена! Если сообщение не пришло, то проверьте
            вкладку спам.
          </p>
        )}
      </div>
      <div className="section-divider"></div>
    </>
  );
};

export default FreeForm;
