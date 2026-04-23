function parsePrimaryColumn(value) {
  if (!value) return { total: 0, rural: 0 };
  const [total, rural] = value.split("/").map((v) => parseInt(v) || 0);
  return { total, rural };
}

function isPrimary(value) {
  return parsePrimaryColumn(value).total === 1;
}

function isChild(age) {
  const num = Number(age);
  return !isNaN(num) && num <= 17;
}

// Універсальна перевірка дати
function isInPeriod(dateStr, start, end) {
  if (!start || !end) return true;
  const parts = dateStr.includes(".") ? dateStr.split(".") : dateStr.split("-");
  let date;
  if (parts.length === 3) {
    // DD.MM.YYYY
    if (dateStr.includes(".")) {
      const [d, m, y] = parts;
      date = new Date(y, m - 1, d);
    } else {
      // YYYY-MM-DD
      const [y, m, d] = parts;
      date = new Date(y, m - 1, d);
    }
  } else {
    return false;
  }
  date.setHours(0, 0, 0, 0);
  return date >= start && date <= end;
}

export function buildSummary(dailyData, startStr, endStr) {
  const start = startStr ? new Date(startStr) : null;
  if (start) start.setHours(0, 0, 0, 0);
  const end = endStr ? new Date(endStr) : null;
  if (end) end.setHours(23, 59, 59, 999);

  const groupedByDate = {};
  function classifyDiagnosis(code) {
    if (!code) return null;

    if (code.startsWith("DA08.0")) return "caries";
    if (code.startsWith("DA09.0")) return "pulpitis";
    if (code.startsWith("DA0C.0")) return "periodontitis";

    return null;
  }
  dailyData.forEach((row) => {
    if (!row[3] || !row[3].trim()) return; // ПІБ
    const date = row[2];
    if (!date || !isInPeriod(date, start, end)) return;
    function getToothType(tooth) {
      const num = parseInt(tooth, 10);

      if (num >= 11 && num <= 48) return "permanent";
      if (num >= 51 && num <= 85) return "temporary";

      return null;
    }
    if (!groupedByDate[date]) {
      groupedByDate[date] = {
        date,
        visits: 0,
        rural: 0,
        primaryTotal: 0,
        primaryRural: 0,
        primaryChildren: 0,
        emergency: 0,
        cariesPermanent: 0,
        cariesPermanentChildren: 0,
        cariesTemporary: 0,
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
        ToothExtractionCaries: 0,
        ToothExtractionCariesChildren: 0,
        ExtractionParodont: 0,
        ExtractionOrthodonticChildren: 0,
        ExtractionphysiologyChildren: 0,
        OperatioInflammatoryProcesses: 0,
        OperatioTumors: 0,
        OperatioImplants: 0,
        OperatioOthers: 0,
        sanatio: 0,
        sanatioPlanova: 0,
        sanatioPlanovaChildren: 0,
        HygieneEducation: 0,
        OralCare: 0,
        ProfessionalOralHygiene: 0,
        RemineralizationTherapy: 0,
        PitAndFissureSealing: 0,
        uop: 0,
        groupSum: 0,
      };
    }

    const day = groupedByDate[date];
    const age = row[4];

    day.visits++;

    const primary = isPrimary(row[5]);
    const child = isChild(age);

    if (primary) {
      day.primaryTotal++;
      if (row[7] === "село") day.primaryRural++;
      if (child) day.primaryChildren++;
    }

    const cases = [
      {
        diagnosis: row["9-1"],
        tooth: row["9-1_tooth"],
      },
      {
        diagnosis: row["9-2"],
        tooth: row["9-2_tooth"],
      },
    ].filter((c) => c.diagnosis && c.tooth);

    const treatments = [row["10-1"], row["10-2"], row["10-3"]].filter(Boolean);

    cases.forEach(({ diagnosis, tooth }) => {
      const type = classifyDiagnosis(diagnosis);
      const toothType = getToothType(tooth);

      if (!type || !toothType) return;

      const hasCariesFilling = treatments.some((t) =>
        ["PlC", "PlLC", "PlAm", "PlCC"].includes(t),
      );

      if (type === "caries" && hasCariesFilling) {
        if (toothType === "permanent") {
          day.cariesPermanent++;
          if (child) day.cariesPermanentChildren++;
        } else {
          day.cariesTemporary++;
        }
      }
      const hasFilling = treatments.some((t) =>
        ["PlC", "PlLC", "PlAm", "PlCC"].includes(t),
      );
      const treatedPulpitis =
        type === "pulpitis" &&
        treatments.some((t) => ["P_vital", "Pt"].includes(t));

      const vitalMethod = treatments.includes("P_vital");
      const isFilledCase = hasFilling;
      const isPulpitisPermanent =
        type === "pulpitis" && toothType === "permanent";

      if (isPulpitisPermanent && isFilledCase) {
        day.pulpitisPermanent++;
        if (child) day.pulpitisPermanentChildren++;
      }

      const isPulpitisTemporary =
        type === "pulpitis" && toothType === "temporary" && hasFilling;

      if (isPulpitisTemporary) {
        day.pulpitisTemporary++;
      }

      const isPeriodontitisPermanent =
        type === "periodontitis" && toothType === "permanent";

      if (isPeriodontitisPermanent && hasFilling) {
        day.periodontitisPermanent++;
        if (child) day.periodontitisPermanentChildren++;
      }
      const isPeriodontitisTemporary =
        type === "periodontitis" && toothType === "temporary" && hasFilling;

      if (isPeriodontitisTemporary) {
        day.periodontitisTemporary++;
      }
      treatments.forEach((proc) => {
        switch (proc) {
          case "PlC":
            day.PlC++;
            day.groupSum++;
            break;
          case "PlLC":
            day.PlLC++;
            day.groupSum++;
            break;
          case "PlAm":
            day.PlAm++;
            day.groupSum++;
            break;
          case "PlCC":
            day.PlCC++;
            day.groupSum++;
            break;
          case "невідкладна_допомога":
            day.emergency++;
            break;
          case "зняття_напластувань":
            day.naplast++;
            break;
          case "планова_санація":
            day.sanatio++;
            break;
          case "видалення_зуба_карієс":
            day.ToothExtractionCaries++;
            if (isChild(age)) day.ToothExtractionCariesChildren++;
            break;
          case "видалення_зуба_пародонт":
            day.ExtractionParodont++;
            break;
          case "видалення_зуба_ортодонт":
            day.ExtractionOrthodonticChildren++;
            break;
          case "видалення_зуба_фізіол":
            day.ExtractionphysiologyChildren++;
            break;
          case "операція_гострі_запальні_процеси":
            day.OperatioInflammatoryProcesses++;
            break;
          case "операція_пухлини":
            day.OperatioTumors++;
            break;
          case "операція_імплантати":
            day.OperatioImplants++;
            break;
          case "операція_інші":
            day.OperatioOthers++;
            break;
          case "гігієна":
            day.HygieneEducation++;
            break;
          case "навчання_догляду":
            day.OralCare++;
            break;
          case "професійна_гігієна":
            day.ProfessionalOralHygiene++;
            break;
          case "ремінералізуюча_терапія":
            day.RemineralizationTherapy++;
            break;
          case "герметизація_фісур":
            day.PitAndFissureSealing++;
            break;
          case "P_vital":
            day.P_vitalTotal++;
            if (child) day.P_vitalChildren++;
            break;

          case "Pt":
            day.PtTotal++;
            if (child) day.PtChildren++;
            break;

          case "depulp_no_caries":
            day.depulped++;
            break;
        }
      });

      if (row[11] === "місцева") day.anesthesiaLocal++;
      if (row[11] === "загальна") day.anesthesiaGeneral++;

      const uop = parseFloat(row[14]);
      if (!isNaN(uop)) day.uop += uop;
    });
  });

  const groupedData = Object.values(groupedByDate);

  let monthTotal = {};
  if (groupedData.length) {
    monthTotal = {};
    Object.keys(groupedData[0]).forEach((key) => {
      monthTotal[key] = typeof groupedData[0][key] === "number" ? 0 : "";
    });
    groupedData.forEach((day) => {
      Object.keys(day).forEach((key) => {
        if (typeof day[key] === "number") monthTotal[key] += day[key];
      });
    });
    monthTotal.date = "Всього";
  }

  return { groupedData, monthTotal };
}
