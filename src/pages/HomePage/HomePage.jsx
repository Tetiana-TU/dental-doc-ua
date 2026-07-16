import React, { useState, useEffect } from "react";
import AuthNav from "../../components/AuthNav/AuthNav";
import RegistrationForm from "../../components/RegistrationForm/RegistrationForm";
import ModalRegister from "../../components/ModalRegister/ModalRegister";
import LoginForm from "../../components/LoginForm/LoginForm";
import css from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";
export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "dental-doc-ua";
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("doctorName");

    if (name) {
      setDoctorName(name);
    }
  }, []);

  useEffect(() => {
    console.log("Register:", isRegisterOpen);
    console.log("Login:", isLoginOpen);
  }, [isRegisterOpen, isLoginOpen]);

  return (
    <div>
      <AuthNav
        onRegisterClick={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onLoginClick={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <section className={css.hero}>
        <div className={css.heroContent}>
          <h1 className={css.homeTitle}>
            {" "}
            Електронний журнал лікаря-стоматолога
          </h1>
          <p className={css.subtitle}>
            Ведення форми 037/0 та автоматичне формування звітів 039-2/0
          </p>
          <div className={css.links}>
            <button className={css.card} onClick={() => navigate("/form037")}>
              <h3>Форма №037/0</h3>
              <p>Щоденний облік пацієнтів та процедур</p>
            </button>

            <button
              className={`${css.card} ${css.mt}`}
              onClick={() => navigate("/form039")}
            >
              <h3>Форма №039-2/0</h3>
              <p>Автоматичне формування щоденного звіту</p>
            </button>
          </div>
        </div>
      </section>

      <ModalRegister
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      >
        <RegistrationForm
          onSuccess={() => {
            console.log("HOME SUCCESS");
            setIsRegisterOpen(false); // закрити реєстрацію
            setIsLoginOpen(true); // відкрити вхід
          }}
        />
      </ModalRegister>

      <ModalRegister isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <LoginForm onSuccess={() => setIsLoginOpen(false)} />
      </ModalRegister>
    </div>
  );
}
