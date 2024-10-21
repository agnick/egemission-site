const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth", // Плавная прокрутка
      block: "start", // Прокрутить до начала секции
    });
  }
};

export default scrollToSection;
