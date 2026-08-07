import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  activeIndex,
  setActiveIndex,
  treeRef,
}) {
  const itemRefs = useRef([]);
  const flatNodes = React.useMemo(() => {
    const result = [];

    const flatten = (nodes) => {
      nodes.forEach((node) => {
        result.push(node);

        if (node.children && openNodes[node.code]) {
          flatten(node.children);
        }
      });
    };

    flatten(data);

    return result;
  }, [data, openNodes]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();

        setActiveIndex((prev) => Math.min(prev + 1, flatNodes.length - 1));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }

      if (e.key === "Enter") {
        e.preventDefault();

        const node = flatNodes[activeIndex];

        if (!node) return;

        if (node.children) {
          toggleNode(node.code);

          setTimeout(() => {
            setActiveIndex((prev) => prev + 1);
          }, 50);

          return;
        }

        onSelect(node);
      }

      if (e.key === "ArrowRight") {
        const node = flatNodes[activeIndex];

        if (node?.children) {
          toggleNode(node.code);
        }
      }

      if (e.key === "ArrowLeft") {
        const node = flatNodes[activeIndex];

        if (node?.children && openNodes[node.code]) {
          toggleNode(node.code);
        }
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [activeIndex, openNodes]);
  useLayoutEffect(() => {
    treeRef.current?.focus();
  }, []);
  useEffect(() => {
    const el = itemRefs.current[activeIndex];

    if (el) {
      el.scrollIntoView({
        block: "nearest",
        behavior: "instant", // або "smooth"
      });
    }
  }, [activeIndex]);
  return (
    <div
      ref={treeRef}
      tabIndex={0}
      style={{
        outline: "none",
        maxHeight: "500px",
        overflowY: "auto",
      }}
    >
      {flatNodes.map((node, index) => {
        const isActive = index === activeIndex;

        const isSelected = selectedCode === node.code;

        return (
          <div
            ref={(el) => (itemRefs.current[index] = el)}
            key={node.code ?? node.name}
            style={{
              display: "flex",
              alignItems: "center",
              paddingLeft: 20,
              background: isActive
                ? "#cce5ff"
                : isSelected
                  ? "#ffe08a"
                  : "transparent",
              color: isActive ? "#000" : "#fff",
              cursor: "pointer",
            }}
            onClick={() => {
              if (!node.children) {
                onSelect(node);
              }
            }}
          >
            {node.children && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.code);
                }}
              >
                {openNodes[node.code] ? "-" : "+"}
              </button>
            )}

            {node.code}
            {" - "}
            {node.name}
          </div>
        );
      })}
    </div>
  );
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
  { value: "PlAm", label: "PlAm" },
  { value: "PlCC", label: "PlCC" },
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

function createEmptyRow({ day, month, year, patientId, isNew = false }) {
  const now = new Date();

  return {
    id: crypto.randomUUID(),
    patient_id: patientId,
    isNew,
    colDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    col2: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    col3: "",
    col4: "",
    col5: "1",
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
    col12: "0",
    col13: "0",
    col14: 0,
  };
}

export default function MedTable() {
  const now = new Date();
  const today =
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, "0")}-` +
    `${String(now.getDate()).padStart(2, "0")}`;

  const todayRef = useRef(null);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [modalState, setModalState] = useState({
    open: false,
    rowId: null,
    field: null,
    top: 0,
    left: 0,
  });

  const [openNodes, setOpenNodes] = useState({});
  const [selectedDiagnosis, setSelectedDiagnosis] = useState({
    rowId: null,
    field: null,
    code: null,
  });
  const [treeActiveIndex, setTreeActiveIndex] = useState(0);
  const treeRef = useRef(null);
  const modalRef = useRef(null);
  useEffect(() => {
    if (!modalState.open) return;

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setModalState({
          open: false,
          rowId: null,
          field: null,
          top: 0,
          left: 0,
        });
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setModalState({
          open: false,
          rowId: null,
          field: null,
          top: 0,
          left: 0,
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [modalState.open]);
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    }
  }, [rows]);
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
        const proc = Array.isArray(r.procedures)
          ? r.procedures
          : r.procedures
            ? JSON.parse(r.procedures)
            : [];

        return {
          id: r.id ?? r._id ?? crypto.randomUUID(),
          isNew: false,
          patient_id: r.patient_id,
          colDate: r.date,
          col2: r.visit_time ? r.visit_time.slice(0, 5) : "",
          col3: r.patient_name || "",
          col4: r.age || "",
          col5: String(r.visit_type ?? ""),
          col6: r.medical_card || "",
          col7: r.residence || "місто",
          col8: r.population_group || "",
          col9_1: r.diagnosis_1 || "",
          col9_2: r.diagnosis_2 || "",
          col9_1_tooth: r.diagnosis_1_tooth || "",
          col9_2_tooth: r.diagnosis_2_tooth || "",
          col10_1: proc[0] || "",
          col10_2: proc[1] || "",
          col10_3: proc[2] || "",

          col11: r.anesthesia ?? "0",
          col12: String(r.sanation ?? 0),
          col13: String(r.sanation_plan ?? 0),
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
              isNew: true,
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
            isNew: true,
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
        visit_type: row.col5,
        medical_card: row.col6,
        residence: row.col7,
        population_group: row.col8,
        diagnosis_1: row.col9_1,
        diagnosis_1_tooth: toIntOrNull(row.col9_1_tooth),
        diagnosis_2: row.col9_2,
        diagnosis_2_tooth: toIntOrNull(row.col9_2_tooth),
        procedures: [row.col10_1, row.col10_2, row.col10_3]
          .map((p) => (typeof p === "object" ? p?.value : p))
          .filter(Boolean),
        anesthesia: row.col11,
        sanation: row.col12,
        sanation_plan: row.col13,
        uop: row.col14,
      };

      console.log("SAVE DIAG CHECK:", {
        id: row.id,
        col9_1: row.col9_1,
        col9_2: row.col9_2,
        tooth1: row.col9_1_tooth,
        tooth2: row.col9_2_tooth,
      });
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
      if (data.row) {
        setRows((prev) =>
          prev.map((r) =>
            r.patient_id === data.row.patient_id
              ? {
                  ...r,
                  id: data.row.id,
                }
              : r,
          ),
        );

        setSelectedDiagnosis((prev) => ({
          ...prev,
          rowId: data.row.id,
        }));

        setModalState((prev) => ({
          ...prev,
          rowId: data.row.id,
        }));
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };
  const handleRowBlur = (rowId) => {
    console.log("BLUR ROW ID:", rowId);

    setRows((prev) => {
      const row = prev.find((r) => String(r.id) === String(rowId));

      console.log("FOUND ROW:", row);

      if (row) {
        console.log("SAVING ROW:", row);
        saveRow(row);
      } else {
        console.log("ROW NOT FOUND");
      }

      return prev;
    });
  };

  const confirmPatient = (rowId) => {
    let rowToSave;

    setRows((prev) => {
      const row = prev.find((r) => r.id === rowId);

      if (!row) return prev;

      const newRow = {
        ...row,
        isNew: false,
      };

      if (row.isNew && row.col3?.trim()) {
        const now = new Date();

        newRow.col2 =
          `${String(now.getHours()).padStart(2, "0")}:` +
          `${String(now.getMinutes()).padStart(2, "0")}`;
      }

      // зберігаємо саме актуальний рядок
      saveRow(newRow);

      const updated = prev.map((r) => (r.id === rowId ? newRow : r));

      const last = updated[updated.length - 1];

      if (last.id === rowId && last.col3?.trim()) {
        updated.push(
          createEmptyRow({
            day: new Date().getDate(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            patientId: crypto.randomUUID(),
            isNew: true,
          }),
        );
      }
      console.log("UPDATED ROWS:", updated);
      return updated;
    });
  };
  const updateCell = (id, key, value) => {
    console.log("UPDATE:", { id, key, value });
    setRows((prev) => {
      const updated = prev.map((r) => {
        if (String(r.id) !== String(id)) return r;

        const newRow = {
          ...r,
          [key]: value,
        };
        console.log("ROW BEFORE:", r);
        if (key === "col3" && r.isNew && value.trim()) {
          const now = new Date();

          newRow.col2 =
            `${String(now.getHours()).padStart(2, "0")}:` +
            `${String(now.getMinutes()).padStart(2, "0")}`;

          newRow.isNew = false;
        }
        if (key === "col12") {
          newRow.col13 = value === "1" ? "1" : "0";
        }

        if (["col10_1", "col10_2", "col10_3", "col11"].includes(key)) {
          const sum =
            ["col10_1", "col10_2", "col10_3"].reduce(
              (acc, k) => acc + (procedurePoints[newRow[k]] || 0),
              0,
            ) + (anesthesiaPoints[newRow.col11] || 0);

          newRow.col14 = sum;
        }
        console.log("NEW ROW:", newRow);
        return newRow;
      });

      const last = updated[updated.length - 1];
      console.log("UPDATED ARRAY:", updated);
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
    console.log("selectDiagnosis", node);

    const rowId = selectedDiagnosis.rowId;
    const field = selectedDiagnosis.field;

    if (!rowId || !field) return;

    console.log("SELECT:", {
      rowId,
      field,
      code: node.code,
    });

    // оновлюємо клітинку
    updateCell(rowId, field, node.code);

    // переходимо на номер зуба
    if (field === "col9_1") {
      requestAnimationFrame(() => {
        const toothInput = document.querySelector(
          `input[data-row="${rowId}"][data-col="col9_1_tooth"]`,
        );

        toothInput?.focus();
      });
    }

    if (field === "col9_2") {
      requestAnimationFrame(() => {
        const toothInput = document.querySelector(
          `input[data-row="${rowId}"][data-col="col9_2_tooth"]`,
        );

        toothInput?.focus();
      });
    }

    setSelectedDiagnosis({
      rowId: null,
      field: null,
      code: null,
    });

    setModalState({
      open: false,
      rowId: null,
      field: null,
    });
  };
  const openDiagnosisModal = (event, rowId, field) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const currentRow = rows.find((r) => String(r.id) === String(rowId));

    console.log("OPEN MODAL:", {
      rowId,
      type: typeof rowId,
      field,
    });

    const currentValue = currentRow?.[field];

    let open = {};

    if (currentValue) {
      const path = findPathToCode(icdData, currentValue);
      if (path) open = buildOpenNodesFromPath(path);
    } else {
      open = buildOpenNodesToDepth(icdData, 2);
    }

    setOpenNodes(open);

    setSelectedDiagnosis({
      rowId: currentRow.id,
      field,
      code: null,
    });

    setModalState({
      open: true,
      rowId: currentRow.id,
      field,
    });

    setTreeActiveIndex(0);

    setTimeout(() => {
      treeRef.current?.focus();
    }, 100);
  };
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
    console.log("KEY CHECK:", {
      key: e.key,
      rowId,
      cellKey,
    });

    if (e.key === "Enter") {
      console.log("TABLE", cellKey);
      e.preventDefault();
      if (cellKey === "col12") {
        e.preventDefault();

        confirmPatient(rowId);

        setTimeout(() => {
          const inputs = document.querySelectorAll('input[data-col="col3"]');

          if (inputs.length > 0) {
            inputs[inputs.length - 1].focus();
          }
        }, 100);

        return;
      }
      if (cellKey === "col9_1_tooth") {
        e.preventDefault();

        const diagnosisInput = document.querySelector(
          `input[data-row="${rowId}"][data-col="col9_2"]`,
        );

        if (!diagnosisInput) return;

        // спочатку ставимо фокус на другий діагноз
        diagnosisInput.focus();

        // потім відкриваємо дерево
        setTimeout(() => {
          openDiagnosisModal(
            {
              currentTarget: diagnosisInput,
            },
            rowId,
            "col9_2",
          );

          setTimeout(() => {
            treeRef.current?.focus();
          }, 50);
        }, 50);

        return;
      }
      // Enter у колонці 8 відкриває перший діагноз
      if (cellKey === "col8") {
        setTimeout(() => {
          const diagnosisInput = document.querySelector(
            `input[data-row="${rowId}"][data-col="col9_1"]`,
          );

          if (diagnosisInput) {
            openDiagnosisModal(
              {
                currentTarget: diagnosisInput,
              },
              rowId,
              "col9_1",
            );

            setTimeout(() => {
              treeRef.current?.focus();
            }, 100);
          }
        }, 50);

        return;
      }

      // перехід вправо
      const rowIndex = rows.findIndex((r) => r.id === rowId);

      const colKeys = [
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
      ];

      const cellIndex = colKeys.indexOf(cellKey);
      if (cellIndex === -1) {
        console.warn("UNKNOWN CELL:", cellKey);
        return;
      }
      let nextRowIndex = rowIndex;
      let nextCellIndex = cellIndex + 1;

      // якщо Enter у останній колонці — перейти на першу клітинку нового рядка
      if (nextCellIndex >= colKeys.length) {
        // nextCellIndex = 0;
        nextRowIndex = Math.min(rowIndex + 1, rows.length - 1);
        nextCellIndex = colKeys.indexOf("col3");
      }

      const nextInput = document.querySelector(
        `input[data-row="${rows[nextRowIndex].id}"][data-col="${colKeys[nextCellIndex]}"],
     select[data-row="${rows[nextRowIndex].id}"][data-col="${colKeys[nextCellIndex]}"]`,
      );

      if (nextInput) {
        nextInput.focus();
      }

      return;
    }
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
      <div className={css.tableWrapper}>
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
                    <tr
                      key={`date-${date}`}
                      ref={date === today ? todayRef : null}
                    >
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
                    const isToday = row.colDate === today;
                    dailySum += Number(row.col14) || 0;

                    rowsWithDailyTotals.push(
                      <TableRow
                        key={row.id}
                        row={row}
                        rowNumber={index + 1}
                        updateCell={updateCell}
                        deleteRow={() => deleteRow(row.id)}
                        procedureOptions={procedureOptions}
                        openDiagnosisModal={openDiagnosisModal}
                        onRowBlur={handleRowBlur}
                        onKeyDownCustom={handleKeyDown}
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
      </div>
      {modalState.open && (
        <div className={css.overlay}>
          <div ref={modalRef} className={css.modal}>
            <div className={css.modalContent}>
              <DiagnosisTree
                data={icdData}
                onSelect={selectDiagnosis}
                openNodes={openNodes}
                toggleNode={toggleNode}
                selectedCode={selectedDiagnosis.code}
                activeIndex={treeActiveIndex}
                setActiveIndex={setTreeActiveIndex}
                treeRef={treeRef}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
