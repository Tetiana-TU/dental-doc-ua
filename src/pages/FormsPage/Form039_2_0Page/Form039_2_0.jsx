import { useState, useEffect, useCallback } from "react";
import css from "./Form039_2_0.module.css";
import SummaryControls from "../../../components/SummaryControls/SummaryControls";
import { buildSummary } from "../../../utils/buildSummary";

function objectToRow1(obj) {
  return [
    obj.date, // Дата
    "", // Фактично відпрацьовано годин
    obj.visits, // Кількість відвідувань
    obj.primaryRural, // З них сільських
    `${obj.primaryTotal}/${obj.primaryRural}`, // Кількість первинних
    obj.primaryChildren, // З них дітей
    obj.emergency, // Отримали невідкладну допомогу 7
    obj.groupSum, // Запломбовано зубів (сума) 8
    obj.cariesPermanent, // карієс постійні  9
    obj.cariesPermanentChildren, // 10
    obj.cariesTemporary, // карієс тимчасові 11
    obj.pulpitisPermanent, // пульпіт постійні 12
    obj.pulpitisPermanentChildren, // пульпіт тимчасові
    obj.periodontitisPermanent, // періодонтит постійні 14
    obj.periodontitisPermanentChildren, //15
    obj.pulpitisTemporary,
    obj.periodontitisTemporary,
    "",
    "",
    "",
    "",
    "", // резервні колонки
    obj.PlC,
    "",
    "",
    obj.PlLC,
    `${obj.anesthesiaLocal}/${obj.anesthesiaGeneral}`,
    "",
    "",
    obj.naplast,
    obj.naplast,
    "",
    "",
    "",
    "",
    "",
  ];
}

// --- функція для перетворення об'єкта у рядок таблиці 2 ---
function objectToRow2(obj) {
  const totalExtractions =
    (obj.ToothExtractionCaries || 0) +
    (obj.ExtractionParodont || 0) +
    (obj.ExtractionOrthodonticChildren || 0) +
    (obj.ExtractionphysiologyChildren || 0);

  return [
    totalExtractions,
    obj.ToothExtractionCaries,
    obj.ExtractionParodont,
    obj.ToothExtractionCariesChildren,
    obj.ExtractionOrthodonticChildren,
    "",
    obj.ExtractionphysiologyChildren,
    "",
    obj.OperatioInflammatoryProcesses,
    obj.OperatioTumors,
    obj.OperatioImplants,
    obj.OperatioOthers,
    obj.sanatio,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    obj.HygieneEducation,
    obj.OralCare,
    obj.ProfessionalOralHygiene,
    obj.RemineralizationTherapy,
    obj.PitAndFissureSealing,
    (obj.uop || 0).toFixed(1),
  ];
}
export default function Form039_2_0Page() {
  const [summary, setSummary] = useState({ table1: [], table2: [] });
  const [startDate, setStartDate] = useState(
    localStorage.getItem("summaryStartDate") || "",
  );
  const [endDate, setEndDate] = useState(
    localStorage.getItem("summaryEndDate") || "",
  );
  const handleBuildSummary = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) {
      setSummary({ table1: [], table2: [] });
      return;
    }

    const rawDataMain = JSON.parse(localStorage.getItem("dailyData")) || [];
    const rawDataArchive =
      JSON.parse(localStorage.getItem("dailyDataArchive")) || "{}";
    const year = "2026";
    const month = "3";
    const rawDataForPeriod = rawDataArchive[year]?.[month] || [];
    const filteredArchive = rawDataForPeriod.filter(
      (row) => !rawDataMain.some((r) => r.date === row.date),
    );
    const rawData = [...rawDataMain, ...filteredArchive];

    if (!Array.isArray(rawData)) {
      setSummary({ table1: [], table2: [] });
      return;
    }

    const normalizedData = rawData.map((row) => ({
      2: row.col2,
      3: row.col3,
      4: row.col4,
      5: row.col5,
      7: row.col7,
      "9-1": row.col9_1,
      "9-1_tooth": row.col9_1_tooth,
      "9-2": row.col9_2,
      "9-2_tooth": row.col9_2_tooth,
      "10-1": row.col10_1,
      "10-2": row.col10_2,
      "10-3": row.col10_3,
      11: row.col11,
      14: row.col14,
    }));

    const { groupedData, monthTotal } = buildSummary(
      normalizedData,
      startDate,
      endDate,
    );
    function cleanRow(row) {
      return row.map((cell) => {
        if (cell === 0 || cell === null || cell === undefined) return "";
        return cell;
      });
    }
    const table1 = groupedData.map((obj) => cleanRow(objectToRow1(obj)));
    const table2 = groupedData.map((obj) => cleanRow(objectToRow2(obj)));

    table1.push(cleanRow(objectToRow1(monthTotal)));
    table2.push(cleanRow(objectToRow2(monthTotal)));

    setSummary({ table1, table2 });
  }, []);

  useEffect(() => {
    document.title = "Форма №039-2/0";
  }, []);

  useEffect(() => {
    handleBuildSummary(startDate, endDate);
  }, [startDate, endDate, handleBuildSummary]);

  return (
    <div className={css.formPage}>
      <h3 className={`${css.titleForm39} ${css.noPrint}`}>
        Зведений щоденний облік роботи лікаря
      </h3>
      <SummaryControls
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        buildSummary={handleBuildSummary}
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
