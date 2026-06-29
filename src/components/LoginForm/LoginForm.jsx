import { Formik, Form, Field } from "formik";
import { MdPhone } from "react-icons/md";
import { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import css from "./LoginForm.module.css";

export default function LoginForm({ onSuccess }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, actions) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/doctors/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      if (!res.ok) {
        throw new Error("Невірний телефон або пароль");
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.doctor?.full_name) {
        localStorage.setItem("doctorName", data.doctor.full_name);
      }
      window.location.href = "/";
      console.log("Logged in:", data);

      actions.resetForm();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
    }
  };

  return (
    <Formik
      initialValues={{
        phone: "",
        password: "",
      }}
      onSubmit={handleSubmit}
    >
      <Form className={css.wrapper} autoComplete="off">
        <h1 className={css.heading}>Вхід</h1>

        <div className={css.inputboxcontainer}>
          <Field
            className={css.inputbox}
            type="tel"
            name="phone"
            placeholder="Телефон"
            required
          />
          <MdPhone className={css.icon} />
        </div>

        <div className={css.inputboxcontainer}>
          <Field
            className={css.inputbox}
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Пароль"
            required
          />

          <span
            className={css.icon}
            onClick={() => setShowPassword((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        <button type="submit">Увійти</button>
      </Form>
    </Formik>
  );
}
