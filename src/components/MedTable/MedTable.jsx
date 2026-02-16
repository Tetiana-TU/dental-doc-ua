import React, { useEffect, useState } from "react";
import css from "./MedTable.module.css";
import TableRow from "./TableRow";

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
};
const anesthesiaPoints = { value1: 0, value2: 0.5, value3: 1 };

export default function MedTable() {
  const [city, setCity] = React.useState("місто");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("dailyData")) || [];
    setRows(saved.length ? saved : [createEmptyRow()]);
  }, []);

  // Збереження у localStorage при зміні rows
  useEffect(() => {
    localStorage.setItem("dailyData", JSON.stringify(rows));
  }, [rows]);

  function createEmptyRow() {
    return {
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

  const updateCell = (rowIndex, key, value) => {
    const newRows = [...rows];
    newRows[rowIndex][key] = value;

    if (["col10_1", "col10_2", "col10_3", "col11"].includes(key)) {
      const procSum = ["col10_1", "col10_2", "col10_3"].reduce(
        (acc, k) => acc + (procedurePoints[newRows[rowIndex][k]] || 0),
        0,
      );

      const anesth = anesthesiaPoints[newRows[rowIndex].col11] || 0;

      newRows[rowIndex].col14 = procSum + anesth;
    }

    setRows(newRows);
  };

  const deleteRow = (index) => {
    if (window.confirm("Ви впевнені, що хочете видалити дані пацієнта?")) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows.length ? newRows : [createEmptyRow()]);
    }
  };

  return (
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
        {rows.map((row, i) => (
          <TableRow
            key={i}
            row={{ ...row, col1: i + 1 }}
            index={i}
            updateCell={(index, key, value) => {
              updateCell(index, key, value);
              if (
                key === "col3" &&
                value.trim() !== "" &&
                index === rows.length - 1
              ) {
                setRows((prevRows) => [...prevRows, createEmptyRow()]);
              }
            }}
            deleteRow={deleteRow}
            diagnosisOptions={diagnosisOptions}
            procedureOptions={procedureOptions}
          />
        ))}
      </tbody>
    </table>
  );
}
