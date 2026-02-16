import React, { useState } from "react";
import css from "./PeriodRow.module.css";

export default function PeriodRow() {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [doctor, setDoctor] = useState("");

  const months = [
    "січень",
    "лютий",
    "березень",
    "квітень",
    "травень",
    "червень",
    "липень",
    "серпень",
    "вересень",
    "жовтень",
    "листопад",
    "грудень",
  ];

  const years = Array.from(
    { length: 21 },
    (_, i) => now.getFullYear() - 10 + i,
  );

  return (
    <div className={css.periodRow}>
      <div className={css.periodLeft}>
        за{" "}
        <select
          className={css.select}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {months.map((m, index) => (
            <option key={index} value={index + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          className={css.select}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>{" "}
        р.
      </div>

      <div className={css.periodRight}>
        <input
          type="text"
          className={css.input}
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          placeholder="Прізвище, ім'я, по-батькові лікаря"
        />
      </div>
    </div>
  );
}
