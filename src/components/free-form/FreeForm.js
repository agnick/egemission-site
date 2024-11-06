import React, { useState } from "react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import "./free_form.css";

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
  const [checkboxError, setCheckboxError] = useState(""); // Checkbox error state

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
        ); // Set checkbox error
      }
      return;
    }

    setErrors({});
    setCheckboxError(""); // Clear checkbox error
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
                  setCheckboxError(""); // Clear checkbox error on change
                }}
              />
              <label htmlFor="policyCheck">
                Я принимаю условия политики обработки данных и даю согласие на
                обработку персональных данных.
              </label>
            </div>
            {checkboxError && <p className="error">{checkboxError}</p>}{" "}
            {/* Checkbox error message below */}
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
