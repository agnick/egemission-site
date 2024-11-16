import React, { useRef } from "react";
import "./payment_form.css";

const PaymentForm = () => {
  const formRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = formRef.current;

    // Проверка, что Email или Phone заполнены
    if (!form.email.value && !form.phone.value) {
      alert("Поле E-mail или Phone не должно быть пустым");
      return;
    }

    // Формирование чека
    form.receipt.value = JSON.stringify({
      EmailCompany: "egemission@yandex.ru",
      Taxation: "osn",
      FfdVersion: "1.2",
      Items: [
        {
          Name: form.description.value || "Оплата",
          Price: form.amount.value + "00",
          Quantity: 1.0,
          Amount: form.amount.value + "00",
          PaymentMethod: "full_prepayment",
          PaymentObject: "service",
          Tax: "none",
          MeasurementUnit: "pc",
        },
      ],
    });

    // Вызов функции pay() для отправки данных формы
    window.pay(form);
  };

  return (
    <div className="payment-form">
      <form
        className="payform-tbank"
        name="payform-tbank"
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <input
          className="payform-tbank-row"
          type="hidden"
          name="terminalkey"
          value="1730997717244DEMO"
        />
        <input
          className="payform-tbank-row"
          type="hidden"
          name="frame"
          value="true"
        />
        <input
          className="payform-tbank-row"
          type="hidden"
          name="language"
          value="ru"
        />
        <input
          className="payform-tbank-row"
          type="hidden"
          name="receipt"
          value=""
        />

        <input
          className="payform-tbank-row"
          type="text"
          placeholder="Сумма заказа"
          name="amount"
          required
        />
        <input className="payform-tbank-row" type="hidden" name="order" />
        <input
          className="payform-tbank-row"
          type="text"
          placeholder="Описание заказа"
          name="description"
        />
        <input
          className="payform-tbank-row"
          type="text"
          placeholder="ФИО плательщика"
          name="name"
        />
        <input
          className="payform-tbank-row"
          type="email"
          placeholder="E-mail"
          name="email"
        />
        <input
          className="payform-tbank-row"
          type="tel"
          placeholder="Контактный телефон"
          name="phone"
        />
        <input
          className="payform-tbank-row payform-tbank-btn"
          type="submit"
          value="Оплатить"
        />
      </form>
    </div>
  );
};

export default PaymentForm;
