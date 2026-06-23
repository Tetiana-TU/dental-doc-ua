// import { useDispatch } from "react-redux";
// import { register } from "../../redux/auth/operations";
import { Formik, Form, Field } from "formik";
import { MdPhone } from "react-icons/md";
import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import css from "./RegistrationForm.module.css";

export default function RegistrationForm({ onSuccess }) {
  console.log("onSuccess prop:", onSuccess);
  // const dispatch = useDispatch();

  // const handleSubmit = (values, actions) => {
  //   console.log(values);
  //   localStorage.setItem("doctorName", values.fullName);
  //   actions.resetForm();
  // };
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, actions) => {
    try {
      console.log(import.meta.env);
      console.log("API:", import.meta.env.VITE_API_URL);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/doctors/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );
      console.log("STATUS:", res.status);
      if (!res.ok) {
        throw new Error("Server error");
      }
      console.log("1");
      const data = await res.json();
      console.log("DATA:", data);
      console.log("2 saved doctor:", data);

      console.log("3 onSuccess:", onSuccess);

      if (onSuccess) {
        console.log("4 OPEN LOGIN");
        onSuccess();
      }
      console.log("5 end");
      actions.resetForm();
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <Formik
      initialValues={{
        fullName: "",
        phone: "",
        password: "",
      }}
      onSubmit={handleSubmit}
    >
      <Form className={css.wrapper} autoComplete="off">
        <h1 className={css.heading}>Реєстрація</h1>
        <div className={css.inputboxcontainer}>
          <Field
            className={css.inputbox}
            type="text"
            name="fullName"
            placeholder="Прізвище Ім'я По батькові"
            required
          />
          <FaUser className={css.icon} />
        </div>
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
        <button type="submit">Зареєструватися</button>
      </Form>
    </Formik>
  );
}
