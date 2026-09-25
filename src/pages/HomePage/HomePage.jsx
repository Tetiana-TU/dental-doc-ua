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

  // Нове вікно з повідомленням
  const [isAuthMessageOpen, setIsAuthMessageOpen] = useState(false);

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

  // Перевірка авторизації
  const handleProtectedNavigation = (path) => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Користувач не авторизований
      setIsAuthMessageOpen(true);
      return;
    }

    // Користувач авторизований
    navigate(path);
  };

  // Відкрити реєстрацію
  const handleRegister = () => {
    setIsAuthMessageOpen(false);
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  // Відкрити вхід
  const handleLogin = () => {
    setIsAuthMessageOpen(false);
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

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
            Електронний журнал лікаря-стоматолога
          </h1>

          <p className={css.subtitle}>
            Ведення форми 037/0 та автоматичне формування звітів 039-2/0
          </p>

          <div className={css.links}>
            {/* Форма 037 */}
            <button
              className={css.card}
              onClick={() => handleProtectedNavigation("/form037")}
            >
              <h3>Форма №037/0</h3>
              <p>Щоденний облік пацієнтів та процедур</p>
            </button>

            {/* Форма 039 */}
            <button
              className={`${css.card} ${css.mt}`}
              onClick={() => handleProtectedNavigation("/form039")}
            >
              <h3>Форма №039-2/0</h3>
              <p>Автоматичне формування щоденного звіту</p>
            </button>

            {/* Фінансовий звіт */}
            <button
              className={`${css.card} ${css.mt}`}
              onClick={() => handleProtectedNavigation("/report")}
            >
              <h3>Фінансовий звіт</h3>
              <p>Процедури, додаткові послуги та суми</p>
            </button>

            {/* Ціни */}
            <button
              className={`${css.card} ${css.mt}`}
              onClick={() => handleProtectedNavigation("/prices")}
            >
              <h3>Ціни / Послуги</h3>
              <p>Ціни процедур та додаткові послуги</p>
            </button>
          </div>
        </div>
      </section>

      {/* ================================= */}
      {/* Повідомлення про необхідність входу */}
      {/* ================================= */}

      <ModalRegister
        isOpen={isAuthMessageOpen}
        onClose={() => setIsAuthMessageOpen(false)}
      >
        <div className={css.authMessage}>
          <h2>🔒 Доступ обмежено</h2>

          <p>
            Щоб користуватися електронним журналом, спочатку потрібно
            зареєструватися або увійти в систему.
          </p>

          <div className={css.authMessageButtons}>
            <button className={css.registerButton} onClick={handleRegister}>
              Зареєструватися
            </button>

            <button className={css.loginButton} onClick={handleLogin}>
              Увійти
            </button>
          </div>
        </div>
      </ModalRegister>

      {/* ================================= */}
      {/* Вікно реєстрації */}
      {/* ================================= */}

      <ModalRegister
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      >
        <RegistrationForm
          onSuccess={() => {
            console.log("HOME SUCCESS");

            setIsRegisterOpen(false);
            setIsLoginOpen(true);
          }}
        />
      </ModalRegister>

      {/* ================================= */}
      {/* Вікно входу */}
      {/* ================================= */}

      <ModalRegister isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <LoginForm
          onSuccess={() => {
            setIsLoginOpen(false);
          }}
        />
      </ModalRegister>
    </div>
  );
}
