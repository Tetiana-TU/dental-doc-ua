import css from "./HomePage.module.css";
import { NavLink } from "react-router-dom";
export default function Home() {
  return (
    <section className={css.hero}>
      <div className={css.heroContent}>
        <h1>Форми обліку</h1>
        <NavLink className={css.link} to="/forma-037/0">
          Форма №037/0 "Листок щоденного обліку роботи лікаря-стоматолога"
        </NavLink>
      </div>
    </section>
  );
}
