// components/SummaryTable/SummaryTable.jsx
import React, { useEffect, useState, useMemo } from "react";
import { buildSummary } from "../../utils/buildSummary.js";

const SummaryTable = () => {
  const [dailyData, setDailyData] = useState([]);
  const [startDate, setStartDate] = useState(
    localStorage.getItem("summaryStartDate") || "",
  );
  const [endDate, setEndDate] = useState(
    localStorage.getItem("summaryEndDate") || "",
  );
  console.log("STATE dailyData:", dailyData);
  // Завантажуємо дані з localStorage та нормалізуємо під buildSummary
  useEffect(() => {
    const rawData = JSON.parse(localStorage.getItem("dailyData")) || [];
    const normalizedData = rawData.map((row) => ({
      2: row.col2, // дата
      3: row.col3, // ПІБ
      4: row.col4, // вік
      5: row.col5, // первинний/вторинний
      7: row.col7, // село/місто
      "9-1": row.col9_1, // діагноз 1
      "9-2": row.col9_2, // діагноз 2
      "10-1": row.col10_1, // процедура 1
      "10-2": row.col10_2, // процедура 2
      "10-3": row.col10_3, // процедура 3
      11: row.col11, // анестезія
      14: row.col14, // УОП
    }));
    setDailyData(normalizedData);
  }, []);

  // Викликаємо buildSummary для групування по датах
  const { groupedData, monthTotal } = useMemo(() => {
    return buildSummary(dailyData, startDate, endDate);
  }, [dailyData, startDate, endDate]);

  // допоміжна функція для суми
  const sum = (...values) =>
    values.reduce((acc, val) => acc + (Number(val) || 0), 0);

  return (
    <div>
      <table>
        <tbody>
          {groupedData.map((day) => (
            <tr key={day.date}>
              <td>{day.date}</td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td>{day.visits}</td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td>
                {day.primaryTotal}/${day.primaryRural}
              </td>
              {/*--1--*/}
              <td></td> {/*--1--*/}
              <td>{day.emergency}</td> {/*--1--*/}
              <td>{day.groupSum}</td> {/*--8 колонка: сума 9,11,12,14,16,17--*/}
              <td>{day.cariesPermanent}</td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td>{day.pulpitisPermanent}</td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td>{day.periodontitisPermanent}</td> {/*--1--*/}
              <td></td> {/*--15--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td>{day.PlC}</td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td>{day.PlLC}</td> {/*--1--*/}
              <td>
                {day.anesthesiaLocal}/${day.anesthesiaGeneral}
              </td>
              {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td>{day.naplast}</td> {/*--1--*/}
              <td>{day.naplast}</td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--1--*/}
              <td></td> {/*--36--*/}
            </tr>
          ))}
          <tr style={{ fontWeight: "bold" }}>
            <td>Всього</td> {/*--1: дата--*/}
            <td></td> {/*--1--*/}
            <td>{monthTotal.visits}</td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td>
              {monthTotal.primaryTotal}/{monthTotal.primaryRural}
            </td>{" "}
            {/*--1--*/}
            <td></td> {/*--1--*/}
            <td>{monthTotal.emergency}</td> {/*--1--*/}
            <td>{monthTotal.groupSum}</td> {/*--1--*/}
            <td>{monthTotal.cariesPermanent}</td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td>{monthTotal.pulpitisPermanent}</td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td>{monthTotal.periodontitisPermanent}</td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td>{monthTotal.PlC}</td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td>{monthTotal.PlLC}</td> {/*--1--*/}
            <td>
              {monthTotal.anesthesiaLocal}/${monthTotal.anesthesiaGeneral}
            </td>
            {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td>{monthTotal.naplast}</td> {/*--1--*/}
            <td>{monthTotal.naplast}</td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
          </tr>
        </tbody>
      </table>

      <table>
        <tbody>
          {groupedData.map((day) => {
            const col37Sum = sum(
              day.ToothExtractionCaries,
              day.ExtractionParodont,
              day.ExtractionOrthodonticChildren,
              day.ExtractionphysiologyChildren,
            );
            return (
              <tr key={day.date + "_2"}>
                <td>{col37Sum}</td> {/*--37--*/}
                <td>{day.ToothExtractionCaries}</td> {/*--1--*/}
                <td>{day.ExtractionParodont}</td> {/*--1--*/}
                <td>{day.ToothExtractionCariesChildren}</td> {/*--1--*/}
                <td>{day.ExtractionOrthodonticChildren}</td> {/*--1--*/}
                <td></td> {/*--1--*/}
                <td>{day.ExtractionphysiologyChildren}</td> {/*--1--*/}
                <td></td> {/*--1--*/}
                <td>{day.OperatioInflammatoryProcesses}</td> {/*--1--*/}
                <td>{day.OperatioTumors}</td> {/*--1--*/}
                <td>{day.OperatioImplants}</td> {/*--1--*/}
                <td>{day.OperatioOthers}</td> {/*--1--*/}
                <td>{day.sanatio}</td> {/*--1--*/}
                <td></td> {/*--1--*/}
                <td></td> {/*--1--*/}
                <td></td> {/*--1--*/}
                <td></td> {/*--1--*/}
                <td></td> {/*--1--*/}
                <td></td> {/*--1--*/}
                <td></td> {/*--1--*/}
                <td>{day.HygieneEducation}</td> {/*--1--*/}
                <td>{day.OralCare}</td> {/*--1--*/}
                <td>{day.ProfessionalOralHygiene}</td> {/*--1--*/}
                <td>{day.RemineralizationTherapy}</td> {/*--1--*/}
                <td>{day.PitAndFissureSealing}</td> {/*--1--*/}
                <td>{(day.uop || 0).toFixed(1)}</td> {/*--1--*/}
              </tr>
            );
          })}
          <tr style={{ fontWeight: "bold" }}>
            <td>
              {sum(
                monthTotal.ToothExtractionCaries,
                monthTotal.ExtractionParodont,
                monthTotal.ExtractionOrthodonticChildren,
                monthTotal.ExtractionphysiologyChildren,
              )}
            </td>{" "}
            {/*--37--*/}
            <td>{monthTotal.ToothExtractionCaries}</td> {/*--1--*/}
            <td>{monthTotal.ExtractionParodont}</td> {/*--1--*/}
            <td>{monthTotal.ToothExtractionCariesChildren}</td> {/*--1--*/}
            <td>{monthTotal.ExtractionOrthodonticChildren}</td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td>{monthTotal.ExtractionphysiologyChildren}</td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td>{monthTotal.OperatioInflammatoryProcesses}</td> {/*--1--*/}
            <td>{monthTotal.OperatioTumors}</td> {/*--1--*/}
            <td>{monthTotal.OperatioImplants}</td> {/*--1--*/}
            <td>{monthTotal.OperatioOthers}</td> {/*--1--*/}
            <td>{monthTotal.sanatio}</td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td></td> {/*--1--*/}
            <td>{monthTotal.HygieneEducation}</td> {/*--1--*/}
            <td>{monthTotal.OralCare}</td> {/*--1--*/}
            <td>{monthTotal.ProfessionalOralHygiene}</td> {/*--1--*/}
            <td>{monthTotal.RemineralizationTherapy}</td> {/*--1--*/}
            <td>{monthTotal.PitAndFissureSealing}</td> {/*--1--*/}
            <td>{(monthTotal.uop || 0).toFixed(1)}</td> {/*--1--*/}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;
