import React, { useState, useEffect } from "react";
import AuthNav from "../../components/AuthNav/AuthNav";
import RegistrationForm from "../../components/RegistrationForm/RegistrationForm";
import ModalRegister from "../../components/ModalRegister/ModalRegister";
import LoginForm from "../../components/LoginForm/LoginForm";
import css from "./HomePage.module.css";

export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  useEffect(() => {
    document.title = "dental-doc-ua";
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
            <a
              className={css.card}
              href="/forma-037/0"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3>Форма №037/0</h3>
              <p>Щоденний облік пацієнтів та процедур</p>
            </a>

            <a
              className={`${css.card} ${css.mt}`}
              href="/forma-039_2_0"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3>Форма №039-2/0</h3>
              <p>Автоматичне формування щоденного звіту</p>
            </a>
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
