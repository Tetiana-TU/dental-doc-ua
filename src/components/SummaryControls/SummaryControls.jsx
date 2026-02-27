import { useState, useEffect } from "react";
import css from "./SummaryControls.module.css";

export default function SummaryControls({ buildSummary }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Завантаження з localStorage
  useEffect(() => {
    const savedStart = localStorage.getItem("summaryStartDate");
    const savedEnd = localStorage.getItem("summaryEndDate");

    if (savedStart) setStartDate(savedStart);
    if (savedEnd) setEndDate(savedEnd);

    if (savedStart && savedEnd) {
      buildSummary(savedStart, savedEnd);
    }
  }, []);

  // При зміні дат
  useEffect(() => {
    if (startDate) {
      localStorage.setItem("summaryStartDate", startDate);
    }
    if (endDate) {
      localStorage.setItem("summaryEndDate", endDate);
    }

    if (startDate && endDate) {
      buildSummary(startDate, endDate);
    }
  }, [startDate, endDate, buildSummary]);

  const handlePrint = () => {
    if (!startDate || !endDate) {
      alert("Виберіть обидві дати!");
      return;
    }

    buildSummary(startDate, endDate);
    window.print();
  };

  return (
    <div className={css.controls}>
      <label>Дата від:</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <label>Дата до:</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <button onClick={handlePrint}>Друк</button>
    </div>
  );
}
