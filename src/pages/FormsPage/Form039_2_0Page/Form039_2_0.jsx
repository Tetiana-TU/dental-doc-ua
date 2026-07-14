import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import css from "./Form039_2_0.module.css";

import SummaryControls from "../../../components/SummaryControls/SummaryControls";
import { buildSummary } from "../../../../server/utils/buildSummary";

function formatDateUI(date) {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d.getTime())) return date; // 🔥 важливо

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${dd}.${mm}.${yyyy}`;
}

function objectToRow1(obj) {
  return [
    formatDateUI(obj.date), // Дата
    obj.workedHours, // Фактично відпрацьовано годин
    obj.visits, // Кількість відвідувань
    obj.rural, // З них сільських 4 кол
    `${obj.primaryTotal || 0}/${obj.primaryRural || 0}`, // Кількість первинних, село 5 кол.
    obj.primaryChildren, // З них дітей 6 кол
    obj.emergency, // Отримали невідкладну допомогу 7
    obj.groupSum, // Запломбовано зубів (сума) 8
    obj.cariesPermanent, // карієс постійні  9
    obj.cariesPermanentChildren, // 10
    obj.cariesTemporary, // карієс тимчасові 11
    obj.pulpitisPermanent, // пульпіт постійні 12
    obj.pulpitisPermanentChildren, // пульпіт тимчасові
    obj.periodontitisPermanent, // періодонтит постійні 14
    obj.periodontitisPermanentChildren, //15
    obj.pulpitisTemporary, //16
    obj.periodontitisTemporary, //17
    obj.P_vitalTotal, //18
    obj.P_vitalChildren, // 19
    obj.PtTotal, // 20
    obj.PtChildren, // 21
    obj.depulped, // 22
    obj.PlC, //23
    obj.PlAm, //24
    obj.PlCC, //25
    obj.PlLC, //26
    `${obj.anesthesiaLocal || 0}/${obj.anesthesiaGeneral || 0}`,
    obj.parodontTotal, //28
    obj.parodontChildren, //29
    obj.naplast, //30
    obj.medlikCourseCount, //31
    obj.kuretazh, //32
    obj.klapteva, //33
    obj.shinuvanya, //34
    obj.mucosaFullCourse, //35
    obj.mucosaFullCourseChildren, //36
  ];
}

// --- функція для перетворення об'єкта у рядок таблиці 2 ---
function objectToRow2(obj) {
  const totalExtractions =
    obj.ToothExtractionCaries +
    obj.ExtractionParodont +
    obj.ToothExtractionCariesChildren +
    obj.ExtractionOrthodonticChildren +
    obj.ToothExtractionCaries42 +
    obj.ExtractionphysiologyChildren;

  return [
    totalExtractions,
    obj.ToothExtractionCaries, //38
    obj.ExtractionParodont, //39
    obj.ToothExtractionCariesChildren, //40
    obj.ExtractionOrthodonticChildren, //41
    obj.ToothExtractionCaries42, //42
    obj.ExtractionphysiologyChildren, //43
    obj.OperatioTotal,
    obj.OperatioInflammatoryProcesses, //45
    obj.OperatioTumors, //46
    obj.OperatioImplants, //47
    obj.OperatioOthers, //48
    obj.sanatio, //49
    obj.sanatioChildren, //50
    obj.examinedAdults, //51
    obj.needSanationAdults, //52
    obj.sanatedAdults, //53
    obj.examinedChildren, //54
    obj.needSanationChildren, //55
    obj.sanatedChildren, //56
    obj.HygieneEducation,
    obj.OralCare,
    obj.ProfessionalOralHygiene,
    obj.RemineralizationTherapy,
    obj.PitAndFissureSealing,
    (obj.uop || 0).toFixed(1),
  ];
}
export default function Form039_2_0Page() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ table1: [], table2: [] });
  const [startDate, setStartDate] = useState(
    localStorage.getItem("summaryStartDate") || "",
  );
  const [endDate, setEndDate] = useState(
    localStorage.getItem("summaryEndDate") || "",
  );
  const handleBuildSummary = useCallback(async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/form039?start=${startDate}&end=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log("status:", res.status);
    console.log("content-type:", res.headers.get("content-type"));
    console.log("url:", res.url);
    const data = await res.json();
    console.log("API FIRST ROW:", data[0]);
    console.log("API FIRST ROW JSON:", JSON.stringify(data[0], null, 2));
    const normalizedData = data.map((row) => {
      const procedures = row.procedures
        ? Array.isArray(row.procedures)
          ? row.procedures
          : JSON.parse(row.procedures)
        : [];

      return {
        id: row.id,
        date: row.date,
        time: row.visit_time?.slice(0, 5) || "",
        name: row.patient_name || "",
        patient_id: row.patient_id,
        age: row.age,
        visit_type: row.visit_type,
        medCard: row.medical_card,
        residence: row.residence,
        is_child: row.is_child,
        diagnosis1: row.diagnosis_1,
        tooth1: row.diagnosis_1_tooth,
        diagnosis2: row.diagnosis_2,
        tooth2: row.diagnosis_2_tooth,

        procedures,

        anesthesia: row.anesthesia,
        sanation: row.sanation,
        sanation_plan: row.sanation_plan,
        uop: Number(row.uop) || 0,
      };
    });
    console.log(
      "NAMES:",
      normalizedData.map((r) => r.name),
    );
    console.log("RAW normalizedData:", normalizedData);
    const uniqueKey = (r) =>
      `${r.date || "no-date"}_${r.time || "no-time"}_${(r.name || "no-name")
        .toString()
        .trim()}`;

    const deduplicatedData = Array.from(
      new Map(normalizedData.map((row) => [uniqueKey(row), row])).values(),
    );
    const validRows = deduplicatedData.filter(
      (row) => row.name && row.name.trim() !== "",
    );
    const { groupedData, monthTotal } = buildSummary(
      validRows,
      startDate,
      endDate,
    );
    function cleanRow(row) {
      return row.map((cell) =>
        cell === null || cell === undefined || cell === 0 ? "" : cell,
      );
    }
    const table1 = groupedData.map((obj) => cleanRow(objectToRow1(obj)));
    const table2 = groupedData.map((obj) => cleanRow(objectToRow2(obj)));

    table1.push(cleanRow(objectToRow1(monthTotal)));
    table2.push(cleanRow(objectToRow2(monthTotal)));

    setSummary({ table1, table2 });
  }, [startDate, endDate]);

  useEffect(() => {
    document.title = "Форма №039-2/0";
  }, []);

  useEffect(() => {
    handleBuildSummary(startDate, endDate);
  }, [startDate, endDate, handleBuildSummary]);
  useEffect(() => {
    localStorage.setItem("summaryStartDate", startDate);
  }, [startDate]);

  useEffect(() => {
    localStorage.setItem("summaryEndDate", endDate);
  }, [endDate]);
  return (
    <div className={css.formPage}>
      <button
        className={`${css.homeButton} ${css.noPrint}`}
        onClick={() => navigate("/")}
      >
        Головна
      </button>
      <h3 className={`${css.titleForm39} ${css.noPrint}`}>
        Зведений щоденний облік роботи лікаря
      </h3>
      <SummaryControls
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />

      {/* ====== ПЕРША ТАБЛИЦЯ ====== */}
      <table className={`${css.summaryTable} ${css.part1}`}>
        <colgroup>
          <col />
          {Array.from({ length: 35 }).map((_, i) => (
            <col key={i} style={{ width: "30px" }} />
          ))}
        </colgroup>

        <thead>
          {/*-- 1 рівень --*/}
          <tr>
            <th rowSpan="4" className={css.vertical}>
              <span>Дата</span>
            </th>
            <th rowSpan="4" className={css.vertical}>
              <span>Фактично відпрацьовано годин</span>
            </th>
            <th rowSpan="4" className={css.vertical}>
              <span>Кількість відвідувань, усього</span>
            </th>
            <th rowSpan="4" className={css.vertical}>
              <span>З них сільських жителів</span>
            </th>
            <th colSpan="2">Кількість первинних відвідувань (із графи 3)</th>
            <th rowSpan="4" className={css.vertical}>
              <span>Отримали невідкладну допомогу</span>
            </th>
            <th colSpan="15">Запломбовано зубів</th>
            <th colSpan="4">Зроблено пломб з:</th>
            <th rowSpan="4" className={css.vertical}>
              <span>Кількість знеболювань (місцеве/загальне)</span>
            </th>
            <th colSpan="9">Проведено курс лікування захворювань</th>
          </tr>
          {/*-- 2 рівень --*/}

          <tr>
            <th rowSpan="3" className={css.vertical}>
              <span>усього/у тому числі сільських жителів</span>
            </th>
            <th rowSpan="3" className={css.vertical}>
              <span>з них дітей до 17 років включно</span>
            </th>
            <th rowSpan="3" className={css.vertical}>
              <span>усього</span>
            </th>
            <th colSpan="3">карієс</th>
            <th colSpan="11">ускладенний карієс</th>
            <th rowSpan="3" className={css.vertical}>
              <span>цементів</span>
            </th>
            <th rowSpan="3" className={css.vertical}>
              <span>амальгам</span>
            </th>
            <th rowSpan="3" className={css.vertical}>
              <span>хімічних композитів</span>
            </th>
            <th rowSpan="3" className={css.vertical}>
              <span>світлополімерів</span>
            </th>
            <th colSpan="7">пародонту</th>
            <th rowSpan="3" className={css.vertical}>
              <span>слизової оболонки порожнини рота, усього</span>
            </th>
            <th rowSpan="3" className={css.vertical}>
              <span>У тому числі у дітей до 17 років включно</span>
            </th>
          </tr>
          {/*-- 3 рівень --*/}
          <tr>
            <th rowSpan="2" className={css.vertical}>
              <span>постійні зуби, усього</span>
            </th>
            <th rowSpan="2" className={css.vertical}>
              <span>У тому числі у дітей до 17 років включно</span>
            </th>
            <th rowSpan="2" className={css.vertical}>
              <span>тимчасові зуби</span>
            </th>
            <th colSpan="4">постійні зуби</th>
            <th colSpan="2">тимчасові зуби</th>
            <th colSpan="5">у тому числі вилікувано</th>

            <th rowSpan="2" className={css.vertical}>
              <span>кількість хворих, усього</span>
            </th>
            <th rowSpan="2" className={css.vertical}>
              <span> У тому числі у дітей до 17 років включно</span>
            </th>
            <th rowSpan="2" className={css.vertical}>
              <span>повне зняття зубних напластувань</span>
            </th>
            <th rowSpan="2" className={css.vertical}>
              <span>медикаментозне лікування</span>
            </th>
            <th colSpan="2">хірургічне лікування</th>
            <th rowSpan="2" className={css.vertical}>
              <span>тимчасове шинування зубів</span>
            </th>
          </tr>
          {/*-- 4 рівень --*/}
          <tr>
            <th className={css.vertical}>
              <span>пульпіт, усього</span>
            </th>
            <th className={css.vertical}>
              <span>У тому числі у дітей до 17 років включно</span>
            </th>
            <th className={css.vertical}>
              <span>періодонтит, усього</span>
            </th>
            <th className={css.vertical}>
              <span>У тому числі у дітей до 17 років включно</span>
            </th>
            <th className={css.vertical}>
              <span>пульпіт</span>
            </th>
            <th className={css.vertical}>
              <span>періодонтит</span>
            </th>
            <th className={css.vertical}>
              <span>Р-вітально хірургічно за 1 відвідування, усього</span>
            </th>
            <th className={css.vertical}>
              <span>У тому числі у дітей до 17 років включно</span>
            </th>
            <th className={css.vertical}>
              <span>Pt за 1 відвідування, усього</span>
            </th>
            <th className={css.vertical}>
              <span>У тому числі у дітей до 17 років включно</span>
            </th>
            <th className={css.vertical}>
              <span>депульповано зубів без ураження карієсом</span>
            </th>
            <th className={css.vertical}>
              <span>кюретаж</span>
            </th>
            <th className={css.vertical}>
              <span>клаптева та інші операції</span>
            </th>
          </tr>

          <tr className={css.colNumbers}>
            {Array.from({ length: 36 }).map((_, i) => (
              <th key={i}>({i + 1})</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {summary.table1.map((row, rowIndex) => {
            const isTotal = rowIndex === summary.table1.length - 1;

            return (
              <tr key={rowIndex} className={isTotal ? css.totalRow : ""}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ====== ДРУГА ТАБЛИЦЯ ====== */}
      <div className={css.newPage}>
        <table className={`${css.summaryTable} ${css.part2}`}>
          <colgroup>
            {Array.from({ length: 26 }).map((_, i) => (
              <col key={i} style={{ width: "30px" }} />
            ))}
          </colgroup>

          <thead>
            {/*--1 рівень --*/}
            <tr>
              <th colSpan="7">Видалено зубів</th>
              <th colSpan="5">Зроблено операцій</th>
              <th rowSpan="4" className={css.vertical}>
                <span>
                  Усього сановано в порядку планової роботи та за зверненням
                </span>
              </th>
              <th rowSpan="4" className={css.vertical}>
                <span>У тому числі у дітей до 17 років включно</span>
              </th>
              <th colSpan="6">Планова санація</th>
              <th colSpan="5">Профілактичні заходи</th>
              <th rowSpan="4" className={css.vertical}>
                <span>Відпрацьовано умовних одиниць працеємкості (УОП)</span>
              </th>
            </tr>

            {/*-- 2 рівень --*/}

            <tr>
              <th rowSpan="3" className={css.vertical}>
                <span>усього</span>
              </th>

              <th colSpan="2">постійних у дорослих з приводу</th>
              <th colSpan="4">у дітей до 17 років включно</th>
              <th rowSpan="3" className={css.vertical}>
                <span>усього</span>
              </th>
              <th rowSpan="3" className={css.vertical}>
                <span>гострі запальні процеси</span>
              </th>
              <th rowSpan="3" className={css.vertical}>
                <span>пухлини та пухлиноподібні утворення</span>
              </th>
              <th rowSpan="3" className={css.vertical}>
                <span>зубні імплантати</span>
              </th>
              <th rowSpan="3" className={css.vertical}>
                <span>інші</span>
              </th>
              <th colSpan="3">у дорослих</th>
              <th colSpan="3">у дітей до 17 років включно</th>
              <th rowSpan="3" className={css.vertical}>
                <span>
                  гігієнічне навчання та виховання, індивідуальний вибір засобів
                  профілактики
                </span>
              </th>
              <th rowSpan="3" className={css.vertical}>
                <span>
                  навчання догляду за порожниною рота, контроль та корекція
                  навичок
                </span>
              </th>
              <th rowSpan="3" className={css.vertical}>
                <span>професійна гігієна</span>
              </th>
              <th rowSpan="3" className={css.vertical}>
                <span>ремінералізуюча терапія</span>
              </th>
              <th rowSpan="3" className={css.vertical}>
                <span>герметизація фісур</span>
              </th>
            </tr>
            {/*-- 3 рівень --*/}
            <tr>
              <th rowSpan="2" className={css.vertical}>
                <span>ускладненого карієсу</span>
              </th>
              <th rowSpan="2" className={css.vertical}>
                <span>пародонтиту</span>
              </th>
              <th colSpan="2">постійних</th>
              <th colSpan="2">тимчасових</th>
              <th rowSpan="2" className={css.vertical}>
                <span>оглянуто в порядку планової санації</span>
              </th>
              <th rowSpan="2" className={css.vertical}>
                <span>потребували санації з тих, що оглянуті</span>
              </th>
              <th rowSpan="2" className={css.vertical}>
                <span>сановано, усього</span>
              </th>
              <th rowSpan="2" className={css.vertical}>
                <span>оглянуто в порядку планової санації</span>
              </th>
              <th rowSpan="2" className={css.vertical}>
                <span>потребували санації з тих, що оглянуті</span>
              </th>
              <th rowSpan="2" className={css.vertical}>
                <span>сановано, усього</span>
              </th>
            </tr>
            {/*-- 4 рівень --*/}
            <tr>
              <th className={css.vertical}>
                <span>з приводу ускладненого карієсу</span>
              </th>
              <th className={css.vertical}>
                <span>з ортодонтичною метою</span>
              </th>
              <th className={css.vertical}>
                <span>з приводу ускладненого карієсу</span>
              </th>
              <th className={css.vertical}>
                <span>у зв'язку з фізіологічною зміною</span>
              </th>
            </tr>

            <tr className={css.colNumbers}>
              {Array.from({ length: 26 }).map((_, i) => (
                <th key={i}>({i + 37})</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {summary.table2.map((row, rowIndex) => {
              const isTotal = rowIndex === summary.table2.length - 1;

              return (
                <tr key={rowIndex} className={isTotal ? css.totalRow : ""}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
