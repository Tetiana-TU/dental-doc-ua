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
  onEscape,
  onClear,
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
      // Працюємо тільки якщо фокус всередині дерева
      if (!treeRef.current?.contains(document.activeElement)) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();

        setActiveIndex((prev) => Math.min(prev + 1, flatNodes.length - 1));

        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();

        setActiveIndex((prev) => Math.max(prev - 1, -1));

        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();

        // activeIndex === -1 = рисочка
        if (activeIndex === -1) {
          onClear();
          return;
        }

        const node = flatNodes[activeIndex];

        if (!node) return;

        // Вузол має дочірні елементи
        if (node.children) {
          toggleNode(node.code);

          setTimeout(() => {
            setActiveIndex((prev) => prev + 1);
          }, 50);

          return;
        }

        // Звичайний діагноз
        onSelect(node);

        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();

        onEscape();

        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();

        const node = flatNodes[activeIndex];

        if (node?.children && !openNodes[node.code]) {
          toggleNode(node.code);
        }

        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();

        const node = flatNodes[activeIndex];

        if (node?.children && openNodes[node.code]) {
          toggleNode(node.code);
        }

        return;
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [
    activeIndex,
    flatNodes,
    openNodes,
    onClear,
    onEscape,
    onSelect,
    setActiveIndex,
    toggleNode,
    treeRef,
  ]);

  useLayoutEffect(() => {
    treeRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];

    if (el) {
      el.scrollIntoView({
        block: "nearest",
        behavior: "instant",
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
      {/* РИСОЧКА */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: 20,
          paddingTop: 5,
          paddingBottom: 5,
          background: activeIndex === -1 ? "#cce5ff" : "transparent",
          color: activeIndex === -1 ? "#000" : "#fff",
          cursor: "pointer",
        }}
        onClick={() => {
          onClear();
        }}
      >
        —
      </div>

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
                type="button"
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
function ProcedureTree({
  data,
  onSelect,
  onEscape,
  selectedValue,
  activeIndex,
  setActiveIndex,
  treeRef,
}) {
  const itemRefs = useRef([]);

  // Тут flatNodes — це список тільки реальних процедур,
  // без заголовків "ТЕРАПІЯ" / "ХІРУРГІЯ"
  const flatNodes = React.useMemo(() => {
    return data.filter((item) => !item.disabled);
  }, [data]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!treeRef.current?.contains(document.activeElement)) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();

        setActiveIndex((prev) => {
          if (prev === -1) return 0;

          return Math.min(prev + 1, flatNodes.length - 1);
        });

        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();

        setActiveIndex((prev) => {
          if (prev === 0) return -1;

          return Math.max(prev - 1, -1);
        });

        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();

        const option = flatNodes[activeIndex];

        if (!option) return;

        onSelect(option);

        return;
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [activeIndex, flatNodes, onSelect, onEscape, setActiveIndex, treeRef]);

  useLayoutEffect(() => {
    treeRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];

    if (el) {
      el.scrollIntoView({
        block: "nearest",
        behavior: "instant",
      });
    }
  }, [activeIndex]);

  return (
    <div ref={treeRef} tabIndex={0} className={css.procedureTree}>
      {data.map((option, index) => {
        // Заголовки груп
        if (option.disabled) {
          return (
            <div key={`group-${index}`} className={css.procedureGroup}>
              {option.label}
            </div>
          );
        }

        const activeNodeIndex = flatNodes.findIndex(
          (item) => item.value === option.value,
        );

        const isActive = activeNodeIndex === activeIndex;

        const isSelected = selectedValue === option.value;

        return (
          <div
            key={option.value}
            ref={(el) => {
              itemRefs.current[activeNodeIndex] = el;
            }}
            className={css.procedureOption}
            style={{
              background: isActive
                ? "#cce5ff"
                : isSelected
                  ? "#ffe08a"
                  : "transparent",

              color: "#000",
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "3px",
            }}
            onMouseEnter={() => {
              setActiveIndex(activeNodeIndex);
            }}
            onClick={() => {
              onSelect(option);
            }}
          >
            {option.label}
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
  const [procedureModal, setProcedureModal] = useState({
    open: false,
    rowId: null,
    field: null,
  });
  const [procedureActiveIndex, setProcedureActiveIndex] = useState(0);
  const procedureRef = useRef(null);
  const procedureTreeRef = useRef(null);

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
    if (!procedureModal.open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setProcedureModal({
          open: false,
          rowId: null,
          field: null,
        });
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [procedureModal.open]);

  useEffect(() => {
    if (!procedureModal.open) return;

    requestAnimationFrame(() => {
      procedureTreeRef.current?.focus();
    });
  }, [procedureModal.open]);

  useEffect(() => {
    if (!loaded || rows.length === 0) return;

    // Працюємо тільки для поточного місяця
    if (
      selectedMonth !== now.getMonth() + 1 ||
      selectedYear !== now.getFullYear()
    ) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (todayRef.current) {
          todayRef.current.scrollIntoView({
            behavior: "instant",
            block: "center",
          });
        }
      });
    });
  }, [rows, loaded, selectedMonth, selectedYear]);

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
      console.log("FORM037 DATA FROM SERVER:", data);

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
          colDate: r.date ? String(r.date).slice(0, 10) : "",
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
      console.table(
        normalized.map((r) => ({
          id: r.id,
          date: r.colDate,
          time: r.col2,
          patient: r.col3,
        })),
      );
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
    try {
      const token = localStorage.getItem("token");

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

      const data = await res.json();

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

  const confirmPatient = async (rowId) => {
    const currentRow = rows.find((r) => String(r.id) === String(rowId));

    if (!currentRow) return;

    const now = new Date();

    // Оновлюємо поточний рядок
    const updatedRow = {
      ...currentRow,
      isNew: false,
      col2:
        currentRow.isNew && currentRow.col3?.trim()
          ? `${String(now.getHours()).padStart(2, "0")}:${String(
              now.getMinutes(),
            ).padStart(2, "0")}`
          : currentRow.col2,
    };

    // Одразу показуємо поточний рядок як збережений
    setRows((prev) =>
      prev.map((r) => (String(r.id) === String(rowId) ? updatedRow : r)),
    );

    // Створюємо новий рядок ОДРАЗУ
    const [year, month, day] = currentRow.colDate.split("-").map(Number);

    const newRow = createEmptyRow({
      day,
      month,
      year,
      patientId: crypto.randomUUID(),
      isNew: true,
    });

    // Одразу додаємо новий рядок після поточного
    setRows((prev) => {
      const index = prev.findIndex((r) => String(r.id) === String(rowId));

      if (index === -1) return prev;

      const result = [...prev];

      // Захист від дублювання
      if (
        result[index + 1] &&
        result[index + 1].isNew &&
        result[index + 1].colDate === currentRow.colDate
      ) {
        return result;
      }

      result.splice(index + 1, 0, newRow);

      return result;
    });

    // Одразу ставимо курсор у ПІБ нового рядка
    requestAnimationFrame(() => {
      const input = document.querySelector(
        `input[data-row="${newRow.id}"][data-col="col3"]`,
      );

      input?.focus();
    });

    // А збереження робимо паралельно
    try {
      await saveRow(updatedRow);
    } catch (error) {
      console.error("Помилка збереження рядка:", error);
    }
  };
  const updateCell = (id, key, value) => {
    setRows((prev) => {
      const updated = prev.map((r) => {
        if (String(r.id) !== String(id)) return r;

        const newRow = {
          ...r,
          [key]: value,
        };

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

        return newRow;
      });

      const last = updated[updated.length - 1];

      return updated;
    });
  };

  const deleteRow = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_API_URL}/api/form037/${id}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

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
  const handleDiagnosisEscape = () => {
    const { rowId, field } = selectedDiagnosis;

    // Закриваємо вікно
    setModalState({
      open: false,
      rowId: null,
      field: null,
    });

    setSelectedDiagnosis({
      rowId: null,
      field: null,
      code: null,
    });

    if (!rowId || !field) return;

    // Після Escape з діагнозу переходимо на номер зуба
    if (field === "col9_1") {
      requestAnimationFrame(() => {
        const input = document.querySelector(
          `input[data-row="${rowId}"][data-col="col9_1_tooth"]`,
        );

        input?.focus();
      });

      return;
    }

    if (field === "col9_2") {
      requestAnimationFrame(() => {
        const input = document.querySelector(
          `input[data-row="${rowId}"][data-col="col9_2_tooth"]`,
        );

        input?.focus();
      });

      return;
    }
  };
  const clearDiagnosis = () => {
    const { rowId, field } = selectedDiagnosis;

    if (!rowId || !field) return;

    // Рисочка = порожнє значення в БД
    updateCell(rowId, field, "");

    // Закриваємо діагноз
    setModalState({
      open: false,
      rowId: null,
      field: null,
    });

    setSelectedDiagnosis({
      rowId: null,
      field: null,
      code: null,
    });

    // ДІАГНОЗ 1 → НОМЕР ЗУБА 1
    if (field === "col9_1") {
      requestAnimationFrame(() => {
        const toothInput = document.querySelector(
          `input[data-row="${rowId}"][data-col="col9_1_tooth"]`,
        );

        toothInput?.focus();
      });

      return;
    }

    // ДІАГНОЗ 2 → ОДРАЗУ ПРОЦЕДУРА 1
    if (field === "col9_2") {
      requestAnimationFrame(() => {
        const toothInput = document.querySelector(
          `input[data-row="${rowId}"][data-col="col9_2_tooth"]`,
        );

        toothInput?.focus();
      });

      return;
    }
  };
  const selectDiagnosis = (node) => {
    console.log("selectDiagnosis", node);

    const { rowId, field } = selectedDiagnosis;

    if (!rowId || !field) return;

    // Записуємо діагноз
    updateCell(rowId, field, node.code);

    // Закриваємо модальне вікно
    setModalState({
      open: false,
      rowId: null,
      field: null,
    });

    setSelectedDiagnosis({
      rowId: null,
      field: null,
      code: node.code,
    });

    // ДІАГНОЗ 1 → НОМЕР ЗУБА 1
    if (field === "col9_1") {
      requestAnimationFrame(() => {
        const toothInput = document.querySelector(
          `input[data-row="${rowId}"][data-col="col9_1_tooth"]`,
        );

        toothInput?.focus();
      });

      return;
    }

    // ДІАГНОЗ 2 → НОМЕР ЗУБА 2
    if (field === "col9_2") {
      requestAnimationFrame(() => {
        const toothInput = document.querySelector(
          `input[data-row="${rowId}"][data-col="col9_2_tooth"]`,
        );

        toothInput?.focus();
      });

      return;
    }
  };
  const openDiagnosisModal = (event, rowId, field) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const currentRow = rows.find((r) => String(r.id) === String(rowId));

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
      code: currentValue || null,
    });

    setModalState({
      open: true,
      rowId: currentRow.id,
      field,
    });

    setTreeActiveIndex(-1);

    setTimeout(() => {
      treeRef.current?.focus();
    }, 100);
  };
  const openProcedureModal = (event, rowId, field) => {
    const currentRow = rows.find((r) => String(r.id) === String(rowId));

    const currentValue = currentRow?.[field];

    const currentIndex = procedureOptions.findIndex(
      (opt) => !opt.disabled && opt.value === currentValue,
    );

    setProcedureActiveIndex(
      procedureOptions
        .filter((opt) => !opt.disabled)
        .findIndex((opt) => opt.value === currentValue),
    );
    setProcedureModal({
      open: true,
      rowId,
      field,
    });
  };
  const procedureFields = ["col10_1", "col10_2", "col10_3"];
  const goToNextProcedure = (rowId, currentField) => {
    const currentIndex = procedureFields.indexOf(currentField);

    // Є наступна процедура
    if (currentIndex >= 0 && currentIndex < procedureFields.length - 1) {
      const nextField = procedureFields[currentIndex + 1];

      const nextInput = document.querySelector(
        `[data-row="${rowId}"][data-col="${nextField}"]`,
      );

      if (!nextInput) return;

      nextInput.focus();

      requestAnimationFrame(() => {
        openProcedureModal(
          {
            currentTarget: nextInput,
          },
          rowId,
          nextField,
        );
      });

      return;
    }

    // Після третьої процедури → знеболювання
    // Після третьої процедури → відкрити селект 11
    const anesthesiaInput = document.querySelector(
      `select[data-row="${rowId}"][data-col="col11"]`,
    );

    if (!anesthesiaInput) return;

    anesthesiaInput.focus();

    requestAnimationFrame(() => {
      if (typeof anesthesiaInput.showPicker === "function") {
        try {
          anesthesiaInput.showPicker();
        } catch (err) {
          // браузер може заборонити програмне відкриття
        }
      }
    });
  };
  const closeProcedureModal = () => {
    setProcedureModal({
      open: false,
      rowId: null,
      field: null,
    });
  };

  const selectProcedure = (option) => {
    if (!option || option.disabled) return;

    const { rowId, field } = procedureModal;

    // Якщо вибрано "—", зберігаємо порожнє значення
    updateCell(rowId, field, option.value || "");

    setProcedureModal({
      open: false,
      rowId: null,
      field: null,
    });

    // Переходимо до наступного поля
    requestAnimationFrame(() => {
      goToNextProcedure(rowId, field);
    });
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
    if (e.key === "Enter") {
      console.log("TABLE", cellKey);
      e.preventDefault();
      if (cellKey === "col12") {
        e.preventDefault();
        e.stopPropagation();

        confirmPatient(rowId);

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
      if (cellKey === "col9_2_tooth") {
        e.preventDefault();
        e.stopPropagation();

        requestAnimationFrame(() => {
          const procedureInput = document.querySelector(
            `[data-row="${rowId}"][data-col="col10_1"]`,
          );

          if (!procedureInput) {
            console.log("Не знайдено col10_1");
            return;
          }

          procedureInput.focus();

          requestAnimationFrame(() => {
            openProcedureModal(
              {
                currentTarget: procedureInput,
              },
              rowId,
              "col10_1",
            );
          });
        });

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
  const handleTableKeyDownCapture = (e) => {
    if (e.key !== "Enter") return;

    const target = e.target;

    if (!(target instanceof HTMLInputElement)) return;

    if (target.dataset.col !== "col9_2_tooth") return;

    const rowId = target.dataset.row;

    if (!rowId) return;

    e.preventDefault();
    e.stopPropagation();

    const procedureInput = document.querySelector(
      `[data-row="${rowId}"][data-col="col10_1"]`,
    );

    if (!procedureInput) return;

    procedureInput.focus();

    requestAnimationFrame(() => {
      openProcedureModal(
        {
          currentTarget: procedureInput,
        },
        rowId,
        "col10_1",
      );

      requestAnimationFrame(() => {
        procedureTreeRef.current?.focus();
      });
    });
  };
  return (
    <>
      <PeriodRow
        month={selectedMonth}
        year={selectedYear}
        setMonth={setSelectedMonth}
        setYear={setSelectedYear}
      />
      <div
        className={css.tableWrapper}
        onKeyDownCapture={handleTableKeyDownCapture}
      >
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
                        openProcedureModal={openProcedureModal}
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
                onClear={clearDiagnosis}
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

      {procedureModal.open && (
        <div className={css.overlay} onMouseDown={closeProcedureModal}>
          <div
            ref={procedureRef}
            className={css.modal}
            tabIndex={0}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ outline: "none" }}
          >
            <div className={css.modalContent}>
              <div className={css.procedureModalHeader}>
                <span>Вибір процедури</span>

                <button type="button" onClick={closeProcedureModal}>
                  ×
                </button>
              </div>

              <div className={css.procedureModalContent}>
                <ProcedureTree
                  data={procedureOptions}
                  onSelect={selectProcedure}
                  selectedValue={
                    rows.find(
                      (r) => String(r.id) === String(procedureModal.rowId),
                    )?.[procedureModal.field]
                  }
                  activeIndex={procedureActiveIndex}
                  setActiveIndex={setProcedureActiveIndex}
                  treeRef={procedureTreeRef}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
