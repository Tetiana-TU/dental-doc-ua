import React, { useState, useEffect, useRef } from "react";
import css from "./MedTable.module.css";

export default function TableRow({
  row,
  rowRef,
  updateCell,
  rowNumber,
  onKeyDownCustom,
  procedureOptions,
  openDiagnosisModal,
  openProcedureModal,

  onRowBlur,
}) {
  const handleKeyDown = (e, rowIdOrCellKey, maybeCellKey) => {
    if (!onKeyDownCustom) return;

    const cellKey = maybeCellKey ?? rowIdOrCellKey;

    onKeyDownCustom(e, row.id, cellKey);
  };
  const openSelect = (rowId, col) => {
    const select = document.querySelector(
      `select[data-row="${rowId}"][data-col="${col}"]`,
    );

    if (!select) return;

    select.focus();

    // Відкриваємо список
    if (typeof select.showPicker === "function") {
      try {
        select.showPicker();
      } catch (err) {
        // браузер може заборонити програмне відкриття
      }
    }
  };
  return (
    <tr ref={rowRef} className={css.inputRow}>
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
          type="text"
          value={row.col3 || ""}
          onChange={(e) => updateCell(row.id, "col3", e.target.value)}
          // onBlur={() => {
          //   onRowBlur(row.id);
          // }}
          onKeyDown={(e) => handleKeyDown(e, "col3")}
          data-row={row.id}
          data-col="col3"
        />
      </td>

      <td className={css.col4}>
        <input
          value={row.col4 ?? ""}
          onChange={(e) => updateCell(row.id, "col4", e.target.value)}
          // onBlur={() => onRowBlur(row.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              openSelect(row.id, "col5");

              return;
            }

            handleKeyDown(e, "col4");
          }}
          data-row={row.id}
          data-col="col4"
        />
      </td>

      <td className={css.col5}>
        <select
          className={css.myList}
          value={row.col5 || "1"}
          onChange={(e) => updateCell(row.id, "col5", e.target.value)}
          // onBlur={() => onRowBlur(row.id)}
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
          value={row.col6 || ""}
          onChange={(e) => updateCell(row.id, "col6", e.target.value)}
          // onBlur={() => onRowBlur(row.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              openSelect(row.id, "col7");

              return;
            }

            handleKeyDown(e, "col6");
          }}
          data-row={row.id}
          data-col="col6"
        />
      </td>

      <td className={css.col7}>
        <select
          className={css.myList}
          value={row.col7}
          onChange={(e) => updateCell(row.id, "col7", e.target.value)}
          // onBlur={() => onRowBlur(row.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              openSelect(row.id, "col8");

              return;
            }

            handleKeyDown(e, "col7");
          }}
          data-row={row.id}
          data-col="col7"
        >
          <option value="місто">м</option>
          <option value="село">с</option>
        </select>
      </td>

      <td className={css.col8}>
        <select
          className={css.myList}
          value={row.col8 || ""}
          onChange={(e) => updateCell(row.id, "col8", e.target.value)}
          // onBlur={() => onRowBlur(row.id)}
          onKeyDown={(e) => handleKeyDown(e, "col8")}
          data-row={row.id}
          data-col="col8"
        >
          <option value="">—</option>
          <option value="ДГ">ДГ</option>
          <option value="Ш">Ш</option>
          <option value="С">С</option>
          <option value="В">В</option>
          <option value="Р">Р</option>
          <option value="ДПК">ДПК</option>
          <option value="Д">Д</option>
        </select>
      </td>
      {/* ДІАГНОЗ 1 */}
      <td className={css.col91}>
        <div className={css.diagWrap}>
          <input
            className={css.myList}
            value={row.col9_1 || ""}
            readOnly
            placeholder="-"
            onBlur={() => onRowBlur(row.id)}
            data-row={row.id}
            data-col="col9_1"
            onClick={(e) => openDiagnosisModal(e, row.id, "col9_1")}
            onKeyDown={(e) => {
              handleKeyDown(e, "col9_1");
            }}
          />

          <input
            className={css.toothInput}
            value={row.col9_1_tooth || ""}
            onChange={(e) => {
              updateCell(row.id, "col9_1_tooth", e.target.value);
            }}
            onBlur={() => onRowBlur(row.id)}
            placeholder="№ зуба"
            onKeyDown={(e) => {
              handleKeyDown(e, "col9_1_tooth");
            }}
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
            placeholder="-"
            onBlur={() => onRowBlur(row.id)}
            data-row={row.id}
            data-col="col9_2"
            onClick={(e) => openDiagnosisModal(e, row.id, "col9_2")}
            onKeyDown={(e) => {
              handleKeyDown(e, "col9_2");
            }}
          />

          <input
            className={css.toothInput}
            value={row.col9_2_tooth || ""}
            onChange={(e) => {
              updateCell(row.id, "col9_2_tooth", e.target.value);
            }}
            placeholder="№ зуба"
            onBlur={() => onRowBlur(row.id)}
            onKeyDown={(e) => handleKeyDown(e, "col9_2_tooth")}
            data-row={row.id}
            data-col="col9_2_tooth"
          />
        </div>
      </td>
      {/* ПРОЦЕДУРИ */}
      {[1, 2, 3].map((num) => {
        const field = `col10_${num}`;

        const selectedOption = procedureOptions.find(
          (opt) => opt.value === row[field],
        );

        return (
          <td key={num} className={css[`col10${num}`]}>
            <div
              className={css.procedureSelect}
              tabIndex={0}
              data-row={row.id}
              data-col={field}
              onClick={(e) => {
                openProcedureModal(e, row.id, field);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();

                  openProcedureModal(e, row.id, field);
                  return;
                }

                handleKeyDown(e, field);
              }}
            >
              {selectedOption?.label || "—"}
            </div>
          </td>
        );
      })}

      <td className={css.col11}>
        <select
          className={css.myList}
          value={row.col11}
          onChange={(e) => updateCell(row.id, "col11", e.target.value)}
          onBlur={() => onRowBlur(row.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              const nextSelect = document.querySelector(
                `select[data-row="${row.id}"][data-col="col12"]`,
              );

              if (!nextSelect) return;

              nextSelect.focus();

              requestAnimationFrame(() => {
                if (typeof nextSelect.showPicker === "function") {
                  try {
                    nextSelect.showPicker();
                  } catch (err) {
                    // браузер може заборонити програмне відкриття
                  }
                }
              });

              return;
            }

            handleKeyDown(e, "col11");
          }}
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
          // onBlur={() => onRowBlur(row.id)}
          onKeyDown={(e) => handleKeyDown(e, "col12")}
          data-row={row.id}
          data-col="col12"
        >
          <option value="0">—</option>
          <option value="1">Сан</option>
        </select>
      </td>

      <td className={css.col13}>{row.col13}</td>
      <td className={css.col14}>{row.col14}</td>
    </tr>
  );
}
