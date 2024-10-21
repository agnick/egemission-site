import "./header.css";
import scrollToSection from "../../helpers/scrollToSection";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Сдай ЕГЭ на 100 баллов с нами!</h1>
        <p className="header-slogan">Будущее начинается здесь! – EGEMISSION</p>
        <button
          className="header-button"
          onClick={() => scrollToSection("course")}
        >
          Узнать подробности
        </button>
      </div>
    </header>
  );
};

export default Header;
