import React from "react";
import css from "./MedTable.module.css";

export default function TableRow({
  row,
  index,
  updateCell,
  deleteRow,
  diagnosisOptions,
  procedureOptions,
}) {
  return (
    <tr className={css.inputRow}>
      <td className={css.col1}>
        <input
          value={row.col1}
          onChange={(e) => updateCell(index, "col1", e.target.value)}
        />
      </td>

      <td className={css.col2}>
        <input
          value={row.col2}
          onChange={(e) => updateCell(index, "col2", e.target.value)}
        />
      </td>

      <td className={css.col3}>
        <input
          value={row.col3}
          onChange={(e) => updateCell(index, "col3", e.target.value)}
        />
      </td>

      <td className={css.col4}>
        <input
          value={row.col4}
          onChange={(e) => updateCell(index, "col4", e.target.value)}
        />
      </td>

      <td className={css.col5}>
        <select
          className={css.myList}
          value={row.col5}
          onChange={(e) => updateCell(index, "col5", e.target.value)}
        >
          <option value="1">I</option>
          <option value="2">II</option>
        </select>
      </td>

      <td className={css.col6}>
        <input
          value={row.col6}
          onChange={(e) => updateCell(index, "col6", e.target.value)}
        />
      </td>

      <td className={css.col7}>
        <select
          className={css.myList}
          value={row.col7}
          onChange={(e) => updateCell(index, "col7", e.target.value)}
        >
          <option value="місто">м</option>
          <option value="село">с</option>
        </select>
      </td>

      <td className={css.col8}>
        <input
          value={row.col8}
          onChange={(e) => updateCell(index, "col8", e.target.value)}
        />
      </td>

      {/* ДІАГНОЗ 1 */}
      <td className={css.col91}>
        <div className={css.diagWrap}>
          <select
            className={css.myList}
            value={row.col9_1}
            onChange={(e) => updateCell(index, "col9_1", e.target.value)}
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
            onChange={(e) => updateCell(index, "col9_1_tooth", e.target.value)}
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
            onChange={(e) => updateCell(index, "col9_2", e.target.value)}
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
            onChange={(e) => updateCell(index, "col9_2_tooth", e.target.value)}
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
            onChange={(e) => updateCell(index, `col10_${num}`, e.target.value)}
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
          onChange={(e) => updateCell(index, "col11", e.target.value)}
        >
          <option value="value1">Без знеболювання</option>
          <option value="value2">Місцеве</option>
          <option value="value3">Загальне</option>
        </select>
      </td>

      <td className={css.col12}>
        <select
          className={css.myList}
          value={row.col12}
          onChange={(e) => updateCell(index, "col12", e.target.value)}
        >
          <option value="">—</option>
          <option value="San">Сан</option>
        </select>
      </td>

      <td className={css.col13}>
        <input
          value={row.col13}
          onChange={(e) => updateCell(index, "col13", e.target.value)}
        />
      </td>

      <td className={css.col14}>{row.col14}</td>
    </tr>
  );
}
