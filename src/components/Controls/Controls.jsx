import React from "react";
import css from "./Controls.module.css";

export default function Controls({ onOpenSummary, onPrint }) {
  return (
    <div>
      <div className={css.controls}>
        <button onClick={onOpenSummary}>Відкрити зведений лист</button>
        <button onClick={onPrint}>Роздрукувати лист обліку</button>
      </div>
      <div className="controls no-print"></div>
    </div>
  );
}
