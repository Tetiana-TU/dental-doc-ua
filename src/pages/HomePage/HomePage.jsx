import React, { useEffect } from "react";
import css from "./HomePage.module.css";

export default function Home() {
  useEffect(() => {
    document.title = "dental-doc-ua";
  }, []);
  return (
    <section className={css.hero}>
      <div className={css.heroContent}>
        <h1 className={css.homeTitle}>Форми обліку</h1>
        <a
          className={css.link}
          href="/forma-037/0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Форма №037/0 "Листок щоденного обліку роботи лікаря-стоматолога"
        </a>

        <a
          className={`${css.link} ${css.mt}`}
          href="/forma-039_2_0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Форма №039-2/0 "ЩОДЕННИК обліку роботи лікаря-стоматолога"
        </a>
      </div>
    </section>
  );
}
