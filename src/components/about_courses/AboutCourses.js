import React from "react";
import "./about_courses.css";

const AboutCourse = () => {
  return (
    <>
      <section id="about-course" className="about-course">
        <div className="about-course-container">
          {/* Длительность курса */}
          <h2>О курсе</h2>
          <p className="course-duration">
            Курс проходит с момента запуска и до самого экзамена. Мы будем с
            вами на протяжении всего пути подготовки.
          </p>

          {/* Что входит в курс */}
          <div className="course-details">
            <h3>Что входит в курс?</h3>
            <ul>
              <li>Полный разбор тестовой части и сочинения</li>
              <li>2-3 занятия в неделю, каждое длится по 1.5 часа</li>
              <li>Возможность посмотреть вебинары в записи</li>
              <li>Обратная связь с преподавателями после каждого занятия</li>
              <li>
                <strong>Секретная фишка</strong> даст вам +20 баллов к вашему
                ЕГЭ
              </li>
            </ul>
          </div>
        </div>
      </section>
      <div className="section-divider"></div>
    </>
  );
};

export default AboutCourse;
