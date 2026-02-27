import React from "react";
import css from "./MedTable.module.css";

export default function TableRow({
  row,
  updateCell,
  rowNumber,
  onKeyDownCustom,
  diagnosisOptions,
  procedureOptions,
}) {
  const handleKeyDown = (e) => {
    if (onKeyDownCustom) {
      onKeyDownCustom(e);
    }
  };
  return (
    <tr className={css.inputRow}>
      <td className={css.col1}>{rowNumber}</td>

      <td className={css.col2}>
        <input
          value={row.col2 || ""}
          onChange={(e) => updateCell("col2", e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </td>

      <td className={css.col3 || ""}>
        <input
          value={row.col3}
          onChange={(e) => updateCell("col3", e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </td>

      <td className={css.col4}>
        <input
          value={row.col4}
          onChange={(e) => updateCell("col4", e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </td>

      <td className={css.col5}>
        <select
          className={css.myList}
          value={row.col5}
          onChange={(e) => updateCell("col5", e.target.value)}
          onKeyDown={handleKeyDown}
        >
          <option value="1">I</option>
          <option value="2">II</option>
        </select>
      </td>

      <td className={css.col6}>
        <input
          value={row.col6}
          onChange={(e) => updateCell("col6", e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </td>

      <td className={css.col7}>
        <select
          className={css.myList}
          value={row.col7}
          onChange={(e) => updateCell("col7", e.target.value)}
          onKeyDown={handleKeyDown}
        >
          <option value="місто">м</option>
          <option value="село">с</option>
        </select>
      </td>

      <td className={css.col8}>
        <input
          value={row.col8}
          onChange={(e) => updateCell("col8", e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </td>

      {/* ДІАГНОЗ 1 */}
      <td className={css.col91}>
        <div className={css.diagWrap}>
          <select
            className={css.myList}
            value={row.col9_1}
            onChange={(e) => updateCell("col9_1", e.target.value)}
            onKeyDown={handleKeyDown}
          >
            {diagnosisOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            className={css.toothInput}
            value={row.col9_1_tooth}
            onChange={(e) => updateCell("col9_1_tooth", e.target.value)}
            placeholder="№ зуба"
          />
        </div>
      </td>

      {/* ДІАГНОЗ 2 */}
      <td className={css.col92}>
        <div className={css.diagWrap}>
          <select
            className={css.myList}
            value={row.col9_2}
            onChange={(e) => updateCell("col9_2", e.target.value)}
            onKeyDown={handleKeyDown}
          >
            {diagnosisOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            className={css.toothInput}
            value={row.col9_2_tooth}
            onChange={(e) => updateCell("col9_2_tooth", e.target.value)}
            placeholder="№ зуба"
          />
        </div>
      </td>

      {/* ПРОЦЕДУРИ */}
      {[1, 2, 3].map((num) => (
        <td key={num} className={css[`col10${num}`]}>
          <select
            className={css.myList}
            value={row[`col10_${num}`]}
            onChange={(e) => updateCell(`col10_${num}`, e.target.value)}
            onKeyDown={handleKeyDown}
          >
            {procedureOptions.map((opt, i) => (
              <option key={i} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </td>
      ))}

      <td className={css.col11}>
        <select
          className={css.myList}
          value={row.col11}
          onChange={(e) => updateCell("col11", e.target.value)}
          onKeyDown={handleKeyDown}
        >
          <option value="value1">Без</option>
          <option value="value2">Місц</option>
          <option value="value3">Заг</option>
        </select>
      </td>

      <td className={css.col12}>
        <select
          className={css.myList}
          value={row.col12}
          onChange={(e) => updateCell("col12", e.target.value)}
          onKeyDown={handleKeyDown}
        >
          <option value="">—</option>
          <option value="San">Сан</option>
        </select>
      </td>

      <td className={css.col13}>
        <input
          value={row.col13}
          onChange={(e) => updateCell("col13", e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </td>

      <td className={css.col14}>{row.col14}</td>
    </tr>
  );
}
