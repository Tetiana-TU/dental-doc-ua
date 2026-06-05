import React, { useEffect } from "react";
import css from "./HomePage.module.css";

export default function Home() {
  useEffect(() => {
    document.title = "dental-doc-ua";
  }, []);
  return (
    <div>
      <header className={css.header}>
        <nav className={css.nav}>
          <a href="/">Головна</a>
          <a href="/about">Про сервіс</a>
          <a href="/pricing">Тарифи</a>
          <a href="/login">Вхід</a>
          <a href="/register" className={css.registerBtn}>
            Реєстрація
          </a>
        </nav>
      </header>

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
    </div>
  );
}
