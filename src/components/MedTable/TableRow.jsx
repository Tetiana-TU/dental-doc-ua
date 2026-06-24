import React from "react";
import css from "./MedTable.module.css";

export default function TableRow({
  row,
  updateCell,
  rowNumber,
  onKeyDownCustom,
  procedureOptions,
  openDiagnosisModal,
}) {
  const handleKeyDown = (e, cellKey) => {
    if (onKeyDownCustom) {
      onKeyDownCustom(e, cellKey);
    }
  };
  return (
    <tr className={css.inputRow}>
      <td className={css.col1}>{rowNumber}</td>

      <td className={css.col2}>
        <input
          value={row.col2 || ""}
          onChange={(e) => updateCell(row.id, "col2", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "col2")}
          data-row={row.id}
          data-col="col2"
        />
      </td>

      <td className={css.col3}>
        <input
          value={row.col3 || ""}
          onChange={(e) => updateCell(row.id, "col3", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "col3")}
          data-row={row.id}
          data-col="col3"
        />
      </td>

      <td className={css.col4}>
        <input
          value={row.col4}
          onChange={(e) => updateCell(row.id, "col4", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "col4")}
          data-row={row.id}
          data-col="col4"
        />
      </td>

      <td className={css.col5}>
        <select
          className={css.myList}
          value={row.col5}
          onChange={(e) => updateCell(row.id, "col5", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "col5")}
          data-row={row.id}
          data-col="col5"
        >
          <option value="1">I</option>
          <option value="2">II</option>
        </select>
      </td>

      <td className={css.col6}>
        <input
          value={row.col6}
          onChange={(e) => updateCell(row.id, "col6", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "col6")}
          data-row={row.id}
          data-col="col6"
        />
      </td>

      <td className={css.col7}>
        <select
          className={css.myList}
          value={row.col7}
          onChange={(e) => updateCell(row.id, "col7", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "col7")}
          data-row={row.id}
          data-col="col7"
        >
          <option value="місто">м</option>
          <option value="село">с</option>
        </select>
      </td>

      <td className={css.col8}>
        <input
          value={row.col8}
          onChange={(e) => updateCell(row.id, "col8", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "col8")}
          data-row={row.id}
          data-col="col8"
        />
      </td>

      {/* ДІАГНОЗ 1 */}
      <td className={css.col91}>
        <div className={css.diagWrap}>
          <input
            className={css.myList}
            value={row.col9_1 || ""}
            readOnly
            placeholder="Оберіть діагноз"
            data-row={row.id}
            data-col="col9_1"
            onClick={() => openDiagnosisModal(row.id, "col9_1", row.col9_1)}
            onKeyDown={(e) => {
              handleKeyDown(e, "col9_1");
              if (e.key === "Delete" || e.key === "Backspace") {
                e.stopPropagation(); // щоб не видалився рядок
                updateCell(row.id, "col9_1", "");
              }
            }}
          />

          <input
            className={css.toothInput}
            value={row.col9_1_tooth}
            onChange={(e) => updateCell(row.id, "col9_1_tooth", e.target.value)}
            placeholder="№ зуба"
            onKeyDown={(e) => handleKeyDown(e, "col9_1_tooth")}
            data-row={row.id}
            data-col="col9_1_tooth"
          />
        </div>
      </td>

      {/* ДІАГНОЗ 2 */}
      <td className={css.col92}>
        <div className={css.diagWrap}>
          <input
            className={css.myList}
            value={row.col9_2 || ""}
            readOnly
            placeholder="Оберіть діагноз"
            data-row={row.id}
            data-col="col9_2"
            onClick={() => openDiagnosisModal(row.id, "col9_2", row.col9_2)}
            onKeyDown={(e) => {
              handleKeyDown(e, "col9_2");
              if (e.key === "Delete" || e.key === "Backspace") {
                e.stopPropagation(); // щоб не видалився рядок
                updateCell(row.id, "col9_2", "");
              }
            }}
          />

          <input
            className={css.toothInput}
            value={row.col9_2_tooth}
            onChange={(e) => updateCell(row.id, "col9_2_tooth", e.target.value)}
            placeholder="№ зуба"
            onKeyDown={(e) => handleKeyDown(e, "col9_2_tooth")}
            data-row={row.id}
            data-col="col9_2_tooth"
          />
        </div>
      </td>

      {/* ПРОЦЕДУРИ */}
      {[1, 2, 3].map((num) => (
        <td key={num} className={css[`col10${num}`]}>
          <select
            className={css.myList}
            value={row[`col10_${num}`]}
            onChange={(e) => updateCell(row.id, `col10_${num}`, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, `col10_${num}`)}
            data-row={row.id}
            data-col={`col10_${num}`}
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
          onChange={(e) => updateCell(row.id, "col11", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "col11")}
          data-row={row.id}
          data-col="col11"
        >
          <option value="0">Без</option>
          <option value="1">Місц</option>
          <option value="2">Заг</option>
        </select>
      </td>

      <td className={css.col12}>
        <select
          className={css.myList}
          value={row.col12}
          onChange={(e) => updateCell(row.id, "col12", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "col12")}
          data-row={row.id}
          data-col="col12"
        >
          <option value="">—</option>
          <option value="San">Сан</option>
        </select>
      </td>

      <td className={css.col13}>
        <input
          value={row.col13}
          onChange={(e) => updateCell(row.id, "col13", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "col13")}
          data-row={row.id}
          data-col="col13"
        />
      </td>

      <td className={css.col14}>{row.col14}</td>
    </tr>
  );
}
