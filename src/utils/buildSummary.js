import { COL } from "../constants";

function parsePrimaryColumn(value) {
  if (!value) return { total: 0, rural: 0 };
  const parts = value.split("/").map((v) => parseInt(v) || 0);
  return { total: parts[0] || 0, rural: parts[1] || 0 };
}

function isPrimary(value) {
  const { total } = parsePrimaryColumn(value);
  return total === 1;
}

function isInPeriod(dateStr, start, end) {
  if (!start || !end) return true;
  const [d, m, y] = dateStr.split(".");
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date >= start && date <= end;
}

export function buildSummary(dailyData, startStr, endStr) {
  let start = startStr ? new Date(startStr) : null;
  if (start) start.setHours(0, 0, 0, 0);

  let end = endStr ? new Date(endStr) : null;
  if (end) end.setHours(23, 59, 59, 999);

  const groupedByDate = {};

  dailyData.forEach((row) => {
    if (!row[3]?.trim()) return; // ПІБ відсутній

    const date = row[2];
    if (!date || !isInPeriod(date, start, end)) return;

    if (!groupedByDate[date]) {
      groupedByDate[date] = {
        date,
        visits: 0,
        rural: 0,
        primaryTotal: 0,
        primaryRural: 0,
        primaryChildren: 0,
        emergency: 0,
        groupSum: 0,
        caries: 0,
        cariesChildren: 0,
        cariesPermanent: 0,
        cariesPermanentChildren: 0,
        cariesTemporary: 0,
        pulpitis: 0,
        pulpitisChildren: 0,
        pulpitisPermanent: 0,
        pulpitisPermanentChildren: 0,
        pulpitisTemporary: 0,
        periodontitisPermanent: 0,
        periodontitisPermanentChildren: 0,
        periodontitisTemporary: 0,
        P_vitalTotal: 0,
        P_vitalChildren: 0,
        PtTotal: 0,
        PtChildren: 0,
        depulped: 0,
        naplast: 0,
        anesthesiaLocal: 0,
        anesthesiaGeneral: 0,
        periodontitis: 0,
        periodontitisChildren: 0,
        PlC: 0,
        PlAm: 0,
        PlCC: 0,
        PlLC: 0,
        medlikparodont: 0,
        kuretazh: 0,
        klapteva: 0,
        shinuvanya: 0,
        mucosaTreatment: 0,
        mucosaTreatmentChildren: 0,
        column28Sum: 0,
        column28ChildrenSum: 0,
        ToothExtractionCaries: 0,
        ToothExtractionCariesChildren: 0,
        ExtractionParodont: 0,
        ExtractionOrthodonticChildren: 0,
        ExtractionphysiologyChildren: 0,
        OperatioInflammatoryProcesses: 0,
        OperatioTumors: 0,
        OperatioImplants: 0,
        OperatioOthers: 0,
        sanatioPlanova: 0,
        sanatioPlanovaChildren: 0,
        HygieneEducation: 0,
        OralCare: 0,
        ProfessionalOralHygiene: 0,
        RemineralizationTherapy: 0,
        PitAndFissureSealing: 0,
        sanatio: 0,
        uop: 0,
      };
    }

    const day = groupedByDate[date];
    day.visits += 1;

    if (row[7] === "село") day.rural += 1;

    if (isPrimary(row[5])) {
      day.primaryTotal += 1;
      if (row[7] === "село") day.primaryRural += 1;
    }

    const diagnosis = [row["9-1"], row["9-2"]].filter(Boolean);
    diagnosis.forEach((diag) => {
      if (diag === "K02_Permanent") day.cariesPermanent += 1;
      if (diag === "K02_Temporary") day.cariesTemporary += 1;
      if (diag === "K04.0_Permanent") day.pulpitisPermanent += 1;
      if (diag === "K04.0_Temporary") day.pulpitisTemporary += 1;
      if (diag === "K04.4_Permanent") day.periodontitisPermanent += 1;
      if (diag === "K04.4_Temporary") day.periodontitisTemporary += 1;
    });

    const anesthesia = row[11];
    if (anesthesia === "value2") day.anesthesiaLocal += 1;
    if (anesthesia === "value3") day.anesthesiaGeneral += 1;

    const uop = parseFloat(row[14]);
    if (!isNaN(uop)) day.uop += uop;

    day.groupSum =
      day.cariesPermanent +
      day.cariesTemporary +
      day.pulpitisPermanent +
      day.pulpitisTemporary +
      day.periodontitisPermanent +
      day.periodontitisTemporary;
  });

  const groupedData = Object.values(groupedByDate);

  let monthTotal = {};
  if (groupedData.length > 0) {
    monthTotal = JSON.parse(JSON.stringify(groupedData[0]));
    Object.keys(monthTotal).forEach((key) => {
      if (typeof monthTotal[key] === "number") monthTotal[key] = 0;
    });

    groupedData.forEach((day) => {
      Object.keys(day).forEach((key) => {
        if (typeof day[key] === "number") monthTotal[key] += day[key];
      });
    });

    monthTotal.date = "Всього";
  }

  console.log("groupedData:", groupedData);
  console.log("monthTotal:", monthTotal);

  return { groupedData, monthTotal };
}
