import { NavLink } from "react-router-dom";
import css from "./AuthNav.module.css";

export default function AuthNav({ onRegisterClick, onLoginClick }) {
  const token = localStorage.getItem("token");
  const doctorName = localStorage.getItem("doctorName");
  return (
    <header className={css.header}>
      <nav className={css.nav}>
        <NavLink className={css.link} to="/">
          Головна
        </NavLink>
        <NavLink className={css.link} to="/about">
          Про сервіс
        </NavLink>
        {!token ? (
          <>
            <button className={css.link} onClick={onLoginClick}>
              Вхід
            </button>

            <button
              className={`${css.link} ${css.registerBtn}`}
              onClick={onRegisterClick}
            >
              Реєстрація
            </button>
          </>
        ) : (
          <>
            <span className={css.link}>Бажаємо гарного дня, {doctorName}!</span>

            <button
              className={css.link}
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("doctorName");
                window.location.href = "/";
              }}
            >
              Вийти
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
