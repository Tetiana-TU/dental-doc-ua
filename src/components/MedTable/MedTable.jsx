import React, { useEffect, useState, useMemo } from "react";
import css from "./MedTable.module.css";
import TableRow from "./TableRow";
import PeriodRow from "../PeriodRow/PeriodRow";
const diagnosisOptions = [
  { value: "", label: "—" },
  { value: "K02_Permanent", label: "K02 Карієс постійні зуби" },
  { value: "K02_Temporary", label: "K02 Карієс тимчасові зуби" },
  { value: "K04.0_Permanent", label: "K04.0 Пульпіт постійні зуби" },
  { value: "K04.0_Temporary", label: "K04.0 Пульпіт тимчасові зуби" },
  { value: "K04.4_Permanent", label: "K04.4 Періодонтит постійні зуби" },
  { value: "K04.4_Temporary", label: "K04.4 Періодонтит тимчасові зуби" },
  { value: "K05.0", label: "K05.0 Гінгівіт гострий" },
  { value: "K05.1", label: "K05.1 Гінгівіт хронічний" },
  { value: "Z01.2", label: "Профілактичний огляд" },
];

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
const anesthesiaPoints = { value1: 0, value2: 0.5, value3: 1 };

export default function MedTable() {
  const [city, setCity] = React.useState("місто");
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [rows, setRows] = useState(() => {
    try {
      const saved = localStorage.getItem("dailyData");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length ? parsed : [createEmptyRow()];
      }
    } catch (error) {
      console.error("Помилка читання localStorage:", error);
    }
    return [createEmptyRow()];
  });

  // Збереження у localStorage при зміні rows
  useEffect(() => {
    localStorage.setItem("dailyData", JSON.stringify(rows));
  }, [rows]);
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!row.col2) return true; // col2 - це дата дд.мм.рррр
      const parts = row.col2.split(".");
      const rowMonth = parseInt(parts[1], 10);
      const rowYear = parseInt(parts[2], 10);

      const monthMatch =
        !selectedMonth || rowMonth === parseInt(selectedMonth, 10);
      const yearMatch = !selectedYear || rowYear === parseInt(selectedYear, 10);

      return monthMatch && yearMatch;
    });
  }, [rows, selectedMonth, selectedYear]);

  // Рахуємо загальну суму УОП (col14)
  const totalUOP = useMemo(() => {
    return filteredRows.reduce(
      (sum, row) => sum + (parseFloat(row.col14) || 0),
      0,
    );
  }, [filteredRows]);
  function createEmptyRow() {
    return {
      id: crypto.randomUUID(),
      col1: "",
      col2: getCurrentDate(),
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
      col11: "value1",
      col12: "",
      col13: "",
      col14: "",
    };
  }

  function getCurrentDate() {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, "0")}.${(now.getMonth() + 1).toString().padStart(2, "0")}.${now.getFullYear()}`;
  }

  const updateCell = (id, key, value) => {
    setRows((prevRows) =>
      prevRows.map((r) => {
        if (r.id !== id) return r;
        const updatedRow = {
          ...r,
          [key]: value,
        };

        // якщо змінюються процедури або анестезія — перераховуємо col14
        if (["col10_1", "col10_2", "col10_3", "col11"].includes(key)) {
          const procSum = ["col10_1", "col10_2", "col10_3"].reduce(
            (acc, k) => acc + (procedurePoints[updatedRow[k]] || 0),
            0,
          );

          const anesth = anesthesiaPoints[updatedRow.col11] || 0;

          updatedRow.col14 = procSum + anesth;
        }

        return updatedRow;
      }),
    );
  };

  const deleteRow = (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити дані пацієнта?"))
      return;

    // 2. Оновлення стану
    setRows((prevRows) => {
      const updated = prevRows.filter((row) => row.id !== id);
      return updated.length > 0 ? updated : [createEmptyRow()];
    });
  };
  const handleGlobalKeyDown = (e, id) => {
    if (e.key === "Delete") {
      deleteRow(id);
    }
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
            <th rowSpan="2">Прізвище, ім’я, по батькові пацієнта</th>
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
            let currentDate = null;
            let dailySum = 0;
            let rowNumber = 1; // номер пацієнта

            filteredRows.forEach((row) => {
              // якщо дата змінилася або новий день
              if (row.col2 !== currentDate) {
                if (currentDate !== null) {
                  // Рядок підсумку за день
                  rowsWithDailyTotals.push(
                    <tr key={`total-${currentDate}`} className={css.totalRow}>
                      {Array.from({ length: 16 }).map((_, idx) => (
                        <td key={idx}></td>
                      ))}
                      <td style={{ fontWeight: "bold", textAlign: "center" }}>
                        {dailySum}
                      </td>
                    </tr>,
                  );
                }
                currentDate = row.col2;
                dailySum = 0;
                rowNumber = 1; // скидаємо нумерацію на новий день
              }

              // додаємо рядок пацієнта
              rowsWithDailyTotals.push(
                <TableRow
                  key={row.id}
                  row={row}
                  rowNumber={rowNumber++} // перерахунок порядкового номера
                  onKeyDownCustom={(e) => handleGlobalKeyDown(e, row.id)}
                  updateCell={(key, value) => {
                    updateCell(row.id, key, value);

                    // перевірка: чи останній рядок у всьому масиві rows
                    const lastRow = rows[rows.length - 1];
                    if (
                      row.id === lastRow.id &&
                      key === "col3" &&
                      value.trim() !== ""
                    ) {
                      setRows((prev) => [...prev, createEmptyRow()]);
                    }
                  }}
                  deleteRow={() => deleteRow(row.id)}
                  diagnosisOptions={diagnosisOptions}
                  procedureOptions={procedureOptions}
                />,
              );

              dailySum += parseFloat(row.col14) || 0;
            });

            // підсумок останнього дня
            if (currentDate) {
              rowsWithDailyTotals.push(
                <tr key={`total-${currentDate}`} className={css.totalRow}>
                  {Array.from({ length: 16 }).map((_, idx) => (
                    <td key={idx}></td>
                  ))}
                  <td style={{ fontWeight: "bold", textAlign: "center" }}>
                    {dailySum}
                  </td>
                </tr>,
              );
            }

            // підсумок за місяць
            const monthTotal = filteredRows.reduce(
              (sum, row) => sum + (parseFloat(row.col14) || 0),
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
    </>
  );
}
