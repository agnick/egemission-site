import React from "react";
import "./about_us.css";

const AboutUs = () => {
  return (
    <>
      <section id="about-us" className="about-us">
        <div className="about-us-container">
          {/* Вступление */}
          <div className="about-us-intro">
            <h2>О нас</h2>
            <p>
              Мы — команда выпускников, у каждого из нас было то самое жизненное
              испытание, которое вам только предстоит пройти. Каждый ученик
              может успешно сдать экзамен, однако лишь сдачи в современных
              реалиях недостаточно для поступления на бюджет в топовый ВУЗ.
            </p>
          </div>

          {/* Преимущества */}
          <div className="advantages">
            <div className="advantage1">
              <h3>Учим доступно и качественно</h3>
              <p>
                Наша цель — ваши баллы. Одним из принципов обучения является
                приоритет практики на протяжении всего курса. Ежегодно на ЕГЭ
                попадаются типичные задания прошлых лет, поэтому мы с
                уверенностью можем сказать, что практика — ключ к успеху.
              </p>
            </div>
            <div className="advantage2">
              <h3>Второй принцип</h3>
              <p>
                Гарантия высокого результата. Мы готовы передать эстафетную
                палочку и подготовить 100-балльников следующего года.
                Присоединяйся к нам и будь готов продолжить эстафету!
              </p>
            </div>
            <div className="advantage3">
              <h3>Вишенка на торте - наша методика преподавания</h3>
              <p>
                Мы против зубрёжки нудного материала, поэтому на каждую тему у
                нас есть свой козырь в рукаве. Жизненные истории, запоминающиеся
                картинки, яркое оформление — всё это избавит вас от скучного и
                бессмысленного заучивания правил.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="section-divider"></div>
    </>
  );
};

export default AboutUs;
