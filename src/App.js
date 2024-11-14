import "./styles/main.css";
import "./styles/responsive.css";
import "boxicons/css/boxicons.min.css";

import Navbar from "./components/navbar/Navbar";
import Header from "./components/header/Header";
import AboutUs from "./components/about_us/AboutUs";
import AboutCourse from "./components/about_courses/AboutCourses";
import Tariffs from "./components/tariffs/Tariffs";
import FreeForm from "./components/free-form/FreeForm";
import Contacts from "./components/contacts/Contacts";
import PaymentForm from "./components/payment_form/PaymentForm";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Header />
      <section id="about">
        <AboutUs />
      </section>
      <section id="course">
        <AboutCourse />
      </section>
      <section id="pricing">
        <Tariffs />
      </section>
      <section id="form">
        <FreeForm />
      </section>
      <section id="contacts">
        <Contacts />
      </section>
      <PaymentForm />
    </div>
  );
}

export default App;
