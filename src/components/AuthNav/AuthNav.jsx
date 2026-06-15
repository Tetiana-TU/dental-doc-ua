import { NavLink } from "react-router-dom";
import css from "./AuthNav.module.css";

export default function AuthNav({ onRegisterClick, onLoginClick }) {
  return (
    <header className={css.header}>
      <nav className={css.nav}>
        <NavLink className={css.link} to="/">
          Головна
        </NavLink>
        <NavLink className={css.link} to="/about">
          Про сервіс
        </NavLink>
        <button className={css.link} onClick={onLoginClick}>
          Вхід
        </button>
        <button
          className={`${css.link} ${css.registerBtn}`}
          onClick={onRegisterClick}
        >
          Реєстрація
        </button>
      </nav>
    </header>
  );
}
