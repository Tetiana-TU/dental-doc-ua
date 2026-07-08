import React, { useEffect, useState, useRef } from "react";
import css from "./MedTable.module.css";
import TableRow from "./TableRow";
import PeriodRow from "../PeriodRow/PeriodRow";
import icdData from "./../../data/icd11.json";
function formatDate(value) {
  if (!value) return null;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
}

function DiagnosisTree({
  data,
  onSelect,
  openNodes,
  toggleNode,
  selectedCode,
}) {
  return data.map((node) => {
    const isOpen = openNodes?.[node.code];
    const isSelected = Boolean(node.code) && selectedCode === node.code;

    return (
      <div key={node.code ?? node.name}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {node.children && (
            <button onClick={() => toggleNode(node.code)}>
              {isOpen ? "−" : "+"}
            </button>
          )}

          <div
            onClick={() => !node.children && onSelect(node)}
            style={{
              cursor: "pointer",
              paddingLeft: 6,
              fontWeight: isSelected ? "bold" : "normal",
              background: isSelected ? "#ffe08a" : "transparent",
              borderRadius: "4px",
              padding: "2px 6px",
              display: "inline-block",
            }}
          >
            {node.code ? `${node.code} - ${node.name}` : node.name}
          </div>
        </div>

        {node.children && isOpen && (
          <div style={{ marginLeft: 20 }}>
            <DiagnosisTree
              data={node.children}
              onSelect={onSelect}
              openNodes={openNodes}
              toggleNode={toggleNode}
              selectedCode={selectedCode}
            />
          </div>
        )}
      </div>
    );
  });
}
const buildOpenNodesToDepth = (data, maxDepth = 2, depth = 0, acc = {}) => {
  if (depth >= maxDepth) return acc;

  data.forEach((node) => {
    if (node.children) {
      acc[node.code] = true;
      buildOpenNodesToDepth(node.children, maxDepth, depth + 1, acc);
    }
  });

  return acc;
};
function findPathToCode(data, targetCode, path = []) {
  for (const node of data) {
    const newPath = [...path, node];

    if (node.code === targetCode) {
      return newPath;
    }

    if (node.children) {
      const result = findPathToCode(node.children, targetCode, newPath);
      if (result) return result;
    }
  }

  return null;
}

const procedureOptions = [
  { value: "", label: "—" },

  {
    value: "",
    label: "-------------------------ТЕРАПІЯ------------------------",
    disabled: true,
  },

  { value: "первинний_огляд", label: "Первинний огляд" },
  { value: "невідкладна_допомога", label: "Невідкладна допомога" },
  { value: "зняття_пломби", label: "Зняття пломби" },
  {
    value: "P_вітально_хірургічно",
    label: "Р-вітально хірургічно за 1 відвідування",
  },
  { value: "Pt", label: "Pt за 1 відвідування" },
  {
    value: "депульповано_зубів",
    label: "Депульповано зубів без ураження карієсом",
  },
  { value: "PlC", label: "PlC" },
  { value: "PlLC", label: "PlLC" },
  { value: "зняття_напластувань", label: "Повне зняття зубних напластувань" },
  {
    value: "медикаментозне_лікування_пародонту",
    label: "Медикаментозне лікування",
  },
  { value: "шинування_зубів", label: "Тимчасове шинування зубів" },
  {
    value: "лікування_слизової_рота",
    label: "Лікування слизової оболонки порожнини рота",
  },
  { value: "рентген", label: "Рентген" },
  { value: "планова_санація", label: "Оглянуто в порядку планової санації" },
  { value: "гігієна", label: "Гігієнічне навчання" },
  { value: "навчання_догляду", label: "Навчання догляду за порожниною рота" },
  { value: "професійна_гігієна", label: "Професійна гігієна" },
  { value: "ремінералізуюча_терапія", label: "Ремінералізуюча терапія" },
  { value: "герметизація_фісур", label: "Герметизація фісур" },
  { value: "пломб_корен_кан_1", label: "Пломб.корен.кан.(1)" },
  { value: "пломб_корен_кан_2", label: "Пломб.корен.кан.(2)" },
  { value: "пломб_корен_кан_3", label: "Пломб.корен.кан.(3)" },

  {
    value: "",
    label: "-------------------------ХІРУРГІЯ------------------------",
    disabled: true,
  },

  { value: "кюретаж", label: "Кюретаж" },
  { value: "клаптева_операція", label: "Клаптева та інші операції" },
  {
    value: "видалення_зуба_карієс",
    label: "Видалення зуба з приводу ускладеного карієсу",
  },
  {
    value: "видалення_зуба_пародонт",
    label: "Видалення зуба з приводу пародонтиту",
  },
  {
    value: "видалення_зуба_ортодонт",
    label: "Видалення зуба з ортодонтичною метою",
  },
  {
    value: "видалення_зуба_фізіол",
    label: "Видалення зуба у зв'язку з фізіологічною зміною",
  },
  {
    value: "операція_гострі_запальні_процеси",
    label: "Операція - гострі запальні процеси",
  },
  {
    value: "операція_пухлини",
    label: "Операція - пухлини та пухлиноподібні утворення",
  },
  { value: "операція_імплантати", label: "Операція - зубні імплантати" },
  { value: "операція_інші", label: "Операція - інші" },
];
const procedurePoints = {
  первинний_огляд: 0.5,
  невідкладна_допомога: 0.5,
  зняття_пломби: 1,
  P_вітально_хірургічно: 1,
  Pt: 1,
  депульповано_зубів: 1,
  PlC: 1,
  PlAm: 1,
  PlCC: 1,
  PlLC: 1,
  зняття_напластувань: 4,
  медикаментозне_лікування_пародонту: 1,
  кюретаж: 1,
  клаптева_операція: 1,
  шинування_зубів: 1,
  лікування_слизової_рота: 1,
  видалення_зуба_карієс: 0.75,
  видалення_зуба_ортодонт: 0.75,
  видалення_зуба_фізіол: 0.75,
  видалення_зуба_пародонт: 0.75,
  операція_гострі_запальні_процеси: 1.5,
  операція_пухлини: 4,
  операція_імплантати: 4,
  операція_інші: 3,
  рентген: 0.5,
  оглянуто_в_порядку_планової_санації: 1,
  планова_санація: 1,
  гігієна: 1,
  навчання_догляду: 1,
  професійна_гігієна: 1,
  ремінералізуюча_терапія: 1,
  герметизація_фісур: 0.5,
  пломб_корен_кан_1: 2,
  пломб_корен_кан_2: 3,
  пломб_корен_кан_3: 4,
};
const anesthesiaPoints = { 0: 0, 1: 0.5, 2: 1 };

function createEmptyRow({ day, month, year, patientId }) {
  const now = new Date();

  return {
    id: crypto.randomUUID(),
    patient_id: patientId,
    colDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    col2: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    col3: "",
    col4: "",
    // col5: "1",
    col6: "",
    col7: "місто",
    col8: "",
    col9_1: "",
    col9_1_tooth: "",
    col9_2: "",
    col9_2_tooth: "",
    col10_1: "",
    col10_2: "",
    col10_3: "",
    col11: "0",
    col12: "",
    col13: "",
    col14: 0,
  };
}

export default function MedTable() {
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [modalState, setModalState] = useState({
    open: false,
    rowId: null,
    field: null,
  });

  const [openNodes, setOpenNodes] = useState({});
  const [selectedDiagnosis, setSelectedDiagnosis] = useState({
    rowId: null,
    field: null,
    code: null,
  });

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/form037?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("API ERROR:", data);
        return;
      }

      const now = new Date();

      const normalized = data.map((r) => {
        const proc = r.procedures ? JSON.parse(r.procedures) : [];

        return {
          id: r.id ?? r._id ?? crypto.randomUUID(),
          patient_id: r.patient_id,
          colDate: r.date,
          col2: r.visit_time ? r.visit_time.slice(0, 5) : "",
          col3: r.patient_name || "",
          col4: r.age || "",
          col5: r.gender || "",
          col6: r.visit_type || "",
          col9_1: r.diagnosis_1 || "",
          col9_2: r.diagnosis_2 || "",
          col9_1_tooth: r.diagnosis_1_tooth || "",
          col9_2_tooth: r.diagnosis_2_tooth || "",
          col10_1: proc[0] || "",
          col10_2: proc[1] || "",
          col10_3: proc[2] || "",

          col11: r.anesthesia ?? "0",
          col12: r.sanation ?? "",
          col13: r.sanation_plan ?? "",
          col14: r.uop || 0,
        };
      });
      const day =
        selectedMonth === now.getMonth() + 1 &&
        selectedYear === now.getFullYear()
          ? now.getDate()
          : 1;

      const today =
        `${selectedYear}-` +
        `${String(selectedMonth).padStart(2, "0")}-` +
        `${String(now.getDate()).padStart(2, "0")}`;

      let resultRows = [...normalized].sort((a, b) => {
        const dateCompare = a.colDate.localeCompare(b.colDate);

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return (a.col2 || "").localeCompare(b.col2 || "");
      });

      // Якщо відкритий поточний місяць
      if (
        selectedMonth === now.getMonth() + 1 &&
        selectedYear === now.getFullYear()
      ) {
        const hasTodayEmptyRow = resultRows.some(
          (r) => r.colDate === today && !r.col3?.trim(),
        );

        // якщо немає порожнього рядка за сьогодні — додаємо
        if (!hasTodayEmptyRow) {
          resultRows.push(
            createEmptyRow({
              day: now.getDate(),
              month: selectedMonth,
              year: selectedYear,
              patientId: crypto.randomUUID(),
            }),
          );
        }
      }

      // якщо записів взагалі немає
      if (resultRows.length === 0) {
        resultRows.push(
          createEmptyRow({
            day,
            month: selectedMonth,
            year: selectedYear,
            patientId: crypto.randomUUID(),
          }),
        );
      }

      setRows(resultRows);
      console.log("RESULT ROWS:", resultRows);

      setLoaded(true);
    };

    load();
  }, [selectedMonth, selectedYear]);
  const toIntOrNull = (v) => {
    if (v === "" || v === null || v === undefined) return null;

    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };

  const saveRow = async (row) => {
    console.log("saveRow:", row);
    try {
      console.log("saveRow()");
      console.log("Saving row:", row);

      const token = localStorage.getItem("token");
      console.log({
        diagnosis_1: row.col9_1,
        diagnosis_1_tooth: toIntOrNull(row.col9_1_tooth),
        diagnosis_2: row.col9_2,
        diagnosis_2_tooth: toIntOrNull(row.col9_2_tooth),
      });
      const body = {
        patient_id: row.patient_id,
        date: row.colDate,
        visit_time: row.col2,
        patient_name: row.col3,
        age: row.col4,
        visit_type: row.col6,
        residence: row.col7,
        is_primary: row.col6 === "первинне",
        is_child: Number(row.col4) <= 17,
        diagnosis_1: row.col9_1,
        diagnosis_1_tooth: toIntOrNull(row.col9_1_tooth),
        diagnosis_2: row.col9_2,
        diagnosis_2_tooth: toIntOrNull(row.col9_2_tooth),
        procedures: [row.col10_1, row.col10_2, row.col10_3]
          .map((p) => (typeof p === "object" ? p?.value : p))
          .filter(Boolean),
        anesthesia: row.col11,
        sanation: row.col12?.trim() || null,
        sanation_plan: row.col13 === "" ? null : Number(row.col13),
        uop: row.col14,
      };

      console.log("BODY:", body);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/form037/row`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      console.log("STATUS:", res.status);

      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };
  const updateCell = (id, key, value) => {
    console.log("updateCell:", { id, key, value });
    setRows((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== id) return r;

        const newRow = {
          ...r,
          [key]: value,
        };
        console.log("newRow tooths:", {
          col9_1_tooth: newRow.col9_1_tooth,
          col9_2_tooth: newRow.col9_2_tooth,
        });

        if (["col10_1", "col10_2", "col10_3", "col11"].includes(key)) {
          const sum =
            ["col10_1", "col10_2", "col10_3"].reduce(
              (acc, k) => acc + (procedurePoints[newRow[k]] || 0),
              0,
            ) + (anesthesiaPoints[newRow.col11] || 0);

          newRow.col14 = sum;
        }

        saveRow(newRow);

        return newRow;
      });

      const last = updated[updated.length - 1];

      if (last?.col3?.trim()) {
        const hasEmpty = updated.some((r) => !r.col3?.trim());

        if (!hasEmpty) {
          const currentDate = new Date();

          updated.push(
            createEmptyRow({
              day: currentDate.getDate(),
              month: currentDate.getMonth() + 1,
              year: currentDate.getFullYear(),
              patientId: crypto.randomUUID(),
            }),
          );
        }
      }

      return updated;
    });
  };

  const deleteRow = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_API_URL}/api/form037/${id}`;

      console.log("DELETE URL:", url);

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      console.log("STATUS:", res.status);
      console.log("DATA:", data);

      if (!res.ok) {
        console.error("DELETE FAILED:", data);
        return;
      }

      setRows((prev) => {
        const filtered = prev.filter((r) => r.id !== id);

        return filtered.length
          ? filtered
          : [
              createEmptyRow({
                day: 1,
                month: selectedMonth,
                year: selectedYear,
                patientId: crypto.randomUUID(),
              }),
            ];
      });
    } catch (err) {
      console.error("Delete error:", err);
    }
  };
  const toggleNode = (code) => {
    setOpenNodes((p) => ({ ...p, [code]: !p[code] }));
  };

  const selectDiagnosis = (node) => {
    updateCell(modalState.rowId, modalState.field, node.code);

    setSelectedDiagnosis({
      rowId: null,
      field: null,
      code: null,
    });

    setModalState({ open: false, rowId: null, field: null });
  };

  const openDiagnosisModal = (rowId, field) => {
    const currentValue = rows.find((r) => r.id === rowId)?.[field];

    let open = {};

    if (currentValue) {
      const path = findPathToCode(icdData, currentValue);
      if (path) open = buildOpenNodesFromPath(path);
    } else {
      open = buildOpenNodesToDepth(icdData, 2);
    }

    setOpenNodes(open);

    setSelectedDiagnosis({
      rowId,
      field,
      code: currentValue,
    });

    setModalState({ open: true, rowId, field });
  };
  console.log(rows);
  const grouped = rows.reduce((acc, row) => {
    if (!row.colDate) return acc;

    const key = row.colDate;

    if (!acc[key]) acc[key] = [];
    acc[key].push(row);

    return acc;
  }, {});

  function buildOpenNodesFromPath(path) {
    const open = {};

    path.forEach((node) => {
      if (node.children) {
        open[node.code] = true;
      }
    });

    return open;
  }

  const handleKeyDown = (e, rowId, cellKey) => {
    const excludedCells = ["col9_1_tooth", "col9_2_tooth"];
    if (e.key === "Delete" && !excludedCells.includes(cellKey)) {
      if (window.confirm("Ви впевнені, що хочете видалити дані пацієнта?")) {
        deleteRow(rowId);
      }
      return;
    }

    const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (!arrowKeys.includes(e.key)) return;
    // Не перехоплюємо стрілку всередині тексту
    if (
      e.target instanceof HTMLInputElement &&
      (e.key === "ArrowLeft" || e.key === "ArrowRight")
    ) {
      if (
        (e.key === "ArrowLeft" && e.target.selectionStart > 0) ||
        (e.key === "ArrowRight" &&
          e.target.selectionStart < e.target.value.length)
      ) {
        return;
      }
    }
    e.preventDefault();

    const rowIndex = rows.findIndex((r) => r.id === rowId);
    const colKeys = [
      // "col1",
      "col2",
      "col3",
      "col4",
      "col5",
      "col6",
      "col7",
      "col8",
      "col9_1",
      "col9_1_tooth",
      "col9_2",
      "col9_2_tooth",
      "col10_1",
      "col10_2",
      "col10_3",
      "col11",
      "col12",
      "col13",
      // "col14",
    ];
    const cellIndex = colKeys.indexOf(cellKey);

    let nextRowIndex = rowIndex;
    let nextCellIndex = cellIndex;

    switch (e.key) {
      case "ArrowUp":
        nextRowIndex = Math.max(rowIndex - 1, 0);
        break;
      case "ArrowDown":
        nextRowIndex = Math.min(rowIndex + 1, rows.length - 1);
        break;
      case "ArrowLeft":
        nextCellIndex = Math.max(cellIndex - 1, 0);
        break;
      case "ArrowRight":
        nextCellIndex = Math.min(cellIndex + 1, colKeys.length - 1);
        break;
    }

    // Фокус на наступній клітинці
    const nextInput = document.querySelector(
      `input[data-row="${rows[nextRowIndex].id}"][data-col="${colKeys[nextCellIndex]}"], 
     select[data-row="${rows[nextRowIndex].id}"][data-col="${colKeys[nextCellIndex]}"]`,
    );

    if (nextInput) nextInput.focus();
  };
  return (
    <>
      <PeriodRow
        month={selectedMonth}
        year={selectedYear}
        setMonth={setSelectedMonth}
        setYear={setSelectedYear}
      />

      <table className={css.medTable}>
        <colgroup>
          {Array.from({ length: 17 }).map((_, index) => (
            <col key={index} />
          ))}
        </colgroup>
        <thead className={css.shapkaTable}>
          {/*ПЕРШИЙ РЯДОК ЗАГОЛОВКІВ*/}
          <tr>
            <th rowSpan="2">Номер п/п</th>
            <th rowSpan="2">Години прийому</th>
            <th rowSpan="2">
              Прізвище, ім’я, по батькові <br />
              пацієнта
            </th>
            <th rowSpan="2" className={css.vertical}>
              Кількість повних років
            </th>
            <th rowSpan="2" className={css.vertical}>
              Порядковий номер відвідування <br />
              (первинне, вторинне)
            </th>
            <th rowSpan="2" className={css.vertical}>
              Номер медичної карти
              <br />
              стоматологічного хворого, <br />
              номер наряду
            </th>
            <th rowSpan="2" className={css.vertical}>
              Місце проживання (жит.міста
              <br />
              (м), села (с))
            </th>
            <th rowSpan="2" className={css.vertical}>
              Група населення <br />
              (ДГ,Ш,С,В,Р,ДПК,Д)
            </th>
            <th colSpan="2">Діагноз</th>

            <th colSpan="3">
              Комплекс виконаного лікування <br />
              чи його етап, включаючи суміжні
              <br />
              спеціальності
            </th>

            <th rowSpan="2" className={css.vertical}>
              Вид знеболювання
            </th>
            <th rowSpan="2" className={css.vertical}>
              Сановано (всього)
            </th>
            <th rowSpan="2" className={css.vertical}>
              У тому числі планова санація
            </th>
            <th rowSpan="2" className={css.vertical}>
              Відпрацьовано умовних <br />
              одиниць праці (УОП)
            </th>
          </tr>

          {/*ДРУГИЙ РЯДОК ПІДКОЛОНОК */}
          <tr>
            <th>
              Діагноз <br />1
            </th>
            <th>
              Діагноз <br />2
            </th>
            <th>
              Процедура <br />1
            </th>
            <th>
              Процедура <br />2
            </th>
            <th>
              Процедура <br />3
            </th>
          </tr>
          {/*РЯДОК НУМЕРАЦІЇ ГРАФ */}
          <tr className={css.colNumbers}>
            <th>(1)</th>
            <th>(2)</th>
            <th>(3)</th>
            <th>(4)</th>
            <th>(5)</th>
            <th>(6)</th>
            <th>(7)</th>
            <th>(8)</th>
            <th colSpan="2">(9)</th>
            <th colSpan="3">(10)</th>
            <th>(11)</th>
            <th>(12)</th>
            <th>(13)</th>
            <th>(14)</th>
          </tr>
        </thead>

        <tbody id="tableBody" className={css.tableBody}>
          {(() => {
            const rowsWithDailyTotals = [];

            Object.entries(grouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .forEach(([date, dayRows]) => {
                let dailySum = 0;

                // заголовок дня
                rowsWithDailyTotals.push(
                  <tr key={`date-${date}`}>
                    <td
                      colSpan="17"
                      style={{ fontWeight: "bold", textAlign: "center" }}
                    >
                      {formatDate(date)}
                    </td>
                  </tr>,
                );

                // рядки пацієнтів
                dayRows.forEach((row, index) => {
                  dailySum += Number(row.col14) || 0;

                  rowsWithDailyTotals.push(
                    <TableRow
                      key={`${row.id}-${index}`}
                      row={row}
                      rowNumber={index + 1}
                      updateCell={updateCell}
                      deleteRow={() => deleteRow(row.id)}
                      procedureOptions={procedureOptions}
                      openDiagnosisModal={openDiagnosisModal}
                      onKeyDownCustom={(e, cellKey) =>
                        handleKeyDown(e, row.id, cellKey)
                      }
                    />,
                  );
                });

                // підсумок за день
                rowsWithDailyTotals.push(
                  <tr key={`total-${date}`} className={css.totalRow}>
                    {Array.from({ length: 16 }).map((_, idx) => (
                      <td key={idx}></td>
                    ))}
                    <td style={{ fontWeight: "bold", textAlign: "center" }}>
                      {dailySum.toFixed(2)}
                    </td>
                  </tr>,
                );
              });

            // місячний підсумок
            const monthTotal = rows.reduce(
              (sum, row) => sum + (Number(row.col14) || 0),
              0,
            );

            rowsWithDailyTotals.push(
              <tr key="month-total" className={css.monthTotalRow}>
                {Array.from({ length: 16 }).map((_, idx) => (
                  <td key={idx}></td>
                ))}
                <td style={{ fontWeight: "bold", textAlign: "center" }}>
                  {monthTotal}
                </td>
              </tr>,
            );

            return rowsWithDailyTotals;
          })()}
        </tbody>
      </table>
      {modalState.open && (
        <div className={css.modal}>
          <div className={css.modalContent}>
            <DiagnosisTree
              data={icdData}
              onSelect={selectDiagnosis}
              openNodes={openNodes}
              toggleNode={toggleNode}
              selectedCode={selectedDiagnosis.code}
            />
          </div>
        </div>
      )}
    </>
  );
}
