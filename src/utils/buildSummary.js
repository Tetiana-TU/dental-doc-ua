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
function calculateWorkedHours(rows) {
  const validTimes = rows
    .map((r) => r.time)
    .filter(Boolean)
    .map((time) => {
      const normalized = String(time).trim().replace(".", ":");
      const parts = normalized.split(":");

      const h = parseInt(parts[0], 10);
      const m = parts[1] ? parseInt(parts[1], 10) : 0;

      if (isNaN(h) || isNaN(m)) return null;

      return h * 60 + m;
    })
    .filter((v) => v !== null);

  if (validTimes.length === 0) return 0;
  if (validTimes.length === 1) return 0;

  const minTime = Math.min(...validTimes);
  const maxTime = Math.max(...validTimes);

  const diff = maxTime - minTime;

  if (diff < 15) return 0;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  // return hours + minutes / 60;
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}
function isInPeriod(dateStr, start, end) {
  if (!start || !end) return true;

  const parts = dateStr.includes(".") ? dateStr.split(".") : dateStr.split("-");

  let date;

  if (parts.length === 3) {
    if (dateStr.includes(".")) {
      const [d, m, y] = parts;
      date = new Date(y, m - 1, d);
    } else {
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
  console.log("RAW DATA SAMPLE:", dailyData.slice(0, 3));
  const start = startStr ? new Date(startStr) : null;
  if (start) start.setHours(0, 0, 0, 0);

  const end = endStr ? new Date(endStr) : null;
  if (end) end.setHours(23, 59, 59, 999);

  const groupedByDate = {};

  const examinedAdultsSet = new Set();
  const examinedChildrenSet = new Set();

  const needSanationAdultsSet = new Set();
  const needSanationChildrenSet = new Set();

  const sanatedAdultsSet = new Set();
  const sanatedChildrenSet = new Set();

  function classifyDiagnosis(code) {
    if (!code) return null;

    const normalized = code.trim().toUpperCase();

    // спочатку вузькі коди
    if (normalized.startsWith("DA09.7")) {
      return "periodontitis";
    }

    if (normalized.startsWith("DA0C")) {
      return "periodontitis";
    }

    // потім загальні
    if (normalized.startsWith("DA09")) {
      return "pulpitis";
    }

    if (normalized.startsWith("DA08")) {
      return "caries";
    }

    return null;
  }

  function getToothType(tooth) {
    const num = parseInt(tooth, 10);

    if (num >= 11 && num <= 48) return "permanent";
    if (num >= 51 && num <= 85) return "temporary";

    return null;
  }

  dailyData.forEach((row) => {
    console.log(dailyData);
    if (!row.date) return;
    const date = row.date;
    const patientId = row.id;
    if (!date || !isInPeriod(date, start, end)) return;

    if (!groupedByDate[date]) {
      groupedByDate[date] = {
        date,
        mucosaPatients: new Set(),
        parodontPatients: new Set(),
        mucosaPatientsChildren: new Set(),
        workedHours: 0,
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
        P_vitalChildren: 0, //19
        PtTotal: 0,
        PtChildren: 0,

        depulped: 0,
        medlikCourseCount: 0,
        parodontChildren: 0,
        naplast: 0,
        parodontTotal: 0,
        kuretazh: 0,
        klapteva: 0,
        shinuvanya: 0,

        mucosaTreatment: 0,
        mucosaTreatmentChildren: 0,

        mucosaFullCourse: 0,
        mucosaFullCourseChildren: 0,

        ToothExtractionCaries: 0,
        ToothExtractionCariesChildren: 0,
        ToothExtractionCaries42: 0,
        ExtractionParodont: 0,
        ExtractionOrthodonticChildren: 0,
        ExtractionphysiologyChildren: 0,

        OperatioInflammatoryProcesses: 0,
        OperatioTumors: 0,
        OperatioImplants: 0,
        OperatioOthers: 0,

        sanatio: 0,
        sanatioChildren: 0,
        examinedAdults: 0, // 51
        needSanationAdults: 0, // 52
        sanatedAdults: 0, // 53

        examinedChildren: 0, // 54
        needSanationChildren: 0, // 55
        sanatedChildren: 0, // 56
        HygieneEducation: 0,
        OralCare: 0,
        ProfessionalOralHygiene: 0,
        RemineralizationTherapy: 0,
        PitAndFissureSealing: 0,

        anesthesiaLocal: 0,
        anesthesiaGeneral: 0,

        PlC: 0,
        PlAm: 0,
        PlCC: 0,
        PlLC: 0,

        uop: 0,
        groupSum: 0,
      };
    }

    const day = groupedByDate[date];
    const age = row.age;
    const child = isChild(age);

    day.visits++;

    const primary = isPrimary(row.visitType);
    if (primary) {
      day.primaryTotal++;
      if (row.residence === "село") day.primaryRural++;
      if (child) day.primaryChildren++;
    }
    const treatments = (row.procedures || []).filter(Boolean);
    const isPreventiveExam = treatments.some(
      (t) => t === "оглянуто_в_порядку_планової_санації",
    );

    const cases = [
      { diagnosis: row.diagnosis1, tooth: row.tooth1 },
      { diagnosis: row.diagnosis2, tooth: row.tooth2 },
    ].filter((c) => c.diagnosis && c.tooth);

    const needsSanation = cases.length > 0;
    const isSanatedFromForm = row.sanation === "San";

    const hasTreatment = treatments.length > 0;
    const isSanated = treatments.includes("планова_санація");

    let hasParodontPatient = false;
    let hasNaplast = false;
    let medlikCount = 0;
    let kuretazhCount = 0;
    let hasKlapteva = false;
    let hasShinuvannya = false;
    let hasMucosaTreatment = false;
    let hasMucosaFullCourse = false;

    treatments.forEach((t) => {
      switch (t) {
        case "зняття_напластувань":
          hasParodontPatient = true;
          hasNaplast = true;
          break;
        case "медикаментозне_лікування_пародонту":
          hasParodontPatient = true;
          medlikCount++;
          break;
        case "кюретаж":
          hasParodontPatient = true;
          kuretazhCount++;
          break;
        case "клаптева_операція":
          hasParodontPatient = true;
          hasKlapteva = true;
          break;
        case "шинування_зубів":
          hasParodontPatient = true;
          hasShinuvannya = true;
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
        case "планова_санація":
          day.sanatio++;
          if (child) {
            day.sanatioChildren++; // 50
          }
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

        case "лікування_слизової_рота":
          day.mucosaPatients.add(patientId);

          if (child) {
            day.mucosaPatientsChildren.add(patientId);
          }

          break;
      }
    });
    day.naplast += hasNaplast ? 1 : 0;
    day.medlikCourseCount += medlikCount;
    day.kuretazh += kuretazhCount;
    day.klapteva += hasKlapteva ? 1 : 0;
    day.shinuvanya += hasShinuvannya ? 1 : 0;
    if (isPreventiveExam) {
      if (child) {
        examinedChildrenSet.add(patientId);
      } else {
        examinedAdultsSet.add(patientId);
      }
    }
    if (needsSanation) {
      if (child) needSanationChildrenSet.add(patientId);
      else needSanationAdultsSet.add(patientId);
    }

    if (isSanatedFromForm) {
      if (child) sanatedChildrenSet.add(patientId);
      else sanatedAdultsSet.add(patientId);
    }
    if (!child && needsSanation) {
      day.needSanationAdults++;
    }
    if (child && needsSanation) {
      day.needSanationChildren++;
    }
    if (!child && isSanated) {
      day.sanatedAdults++;
    }
    if (child && isSanated) {
      day.sanatedChildren++;
    }
    if (hasParodontPatient) {
      day.parodontPatients.add(patientId);

      if (child) {
        day.parodontChildren++;
      }
    }
    cases.forEach(({ diagnosis, tooth }) => {
      const type = classifyDiagnosis(diagnosis);
      const toothType = getToothType(tooth);
      if (!type || !toothType) return;

      const hasFilling = treatments.some((t) =>
        ["PlC", "PlLC", "PlAm", "PlCC"].includes(t),
      );

      if (type === "caries" && hasFilling) {
        if (toothType === "permanent") {
          day.cariesPermanent++;
          if (child) day.cariesPermanentChildren++;
        } else {
          day.cariesTemporary++;
        }
      }

      if (type === "pulpitis" && hasFilling) {
        if (toothType === "permanent") {
          day.pulpitisPermanent++;
          if (child) day.pulpitisPermanentChildren++;
        } else {
          day.pulpitisTemporary++;
        }
      }

      if (type === "periodontitis" && hasFilling) {
        if (toothType === "permanent") {
          day.periodontitisPermanent++;
          if (child) day.periodontitisPermanentChildren++;
        } else {
          day.periodontitisTemporary++;
        }
      }
    });

    const hasPt = treatments.includes("Pt");

    if (hasPt) {
      const periodontitisCases = cases.filter(
        ({ diagnosis }) => classifyDiagnosis(diagnosis) === "periodontitis",
      );

      day.PtTotal += periodontitisCases.length;

      if (child) {
        day.PtChildren += periodontitisCases.length;
      }
    }
    if (treatments.includes("лікування_слизової_рота")) {
      day.mucosaPatients.add(patientId);
    }

    const hasDepulp = treatments.includes("депульповано_зубів");
    const hasCaries = cases.some(
      (c) => classifyDiagnosis(c.diagnosis) === "caries",
    );

    if (hasDepulp && !hasCaries) {
      day.depulped++;
    }
    let isTemporaryTooth = false;
    let hasComplicatedCaries = false;

    cases.forEach(({ diagnosis, tooth }) => {
      const type = classifyDiagnosis(diagnosis);
      const toothType = getToothType(tooth);

      if (toothType === "temporary") {
        isTemporaryTooth = true;
      }

      if (type === "pulpitis" || type === "periodontitis") {
        hasComplicatedCaries = true;
      }
    });
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
        case "видалення_зуба_карієс":
          day.ToothExtractionCaries++;

          if (child) day.ToothExtractionCariesChildren++;

          // окремо графа 42 (тільки молочні + ускладнений карієс)
          if (child && isTemporaryTooth && hasComplicatedCaries) {
            day.ToothExtractionCaries42++;
          }
          break;
      }
    });
    const hasVitalMethod = treatments.includes("P_вітально_хірургічно");

    if (hasVitalMethod) {
      const pulpitisCases = cases.filter(
        ({ diagnosis }) => classifyDiagnosis(diagnosis) === "pulpitis",
      );

      day.P_vitalTotal += pulpitisCases.length;

      if (child) {
        day.P_vitalChildren += pulpitisCases.length;
      }
    }
    day.OperatioTotal =
      day.OperatioInflammatoryProcesses +
      day.OperatioTumors +
      day.OperatioImplants +
      day.OperatioOthers;

    const anesthesia = row.anesthesia;
    if (anesthesia === "value2") day.anesthesiaLocal++;
    if (anesthesia === "value3") day.anesthesiaGeneral++;

    const uop = parseFloat(row.uop);
    if (!isNaN(uop)) day.uop += uop;
  });
  // рахуємо години по кожному дню
  Object.keys(groupedByDate).forEach((date) => {
    const dayRows = dailyData.filter((r) => r.date === date && r.time);

    groupedByDate[date].workedHours = calculateWorkedHours(dayRows);
  });
  Object.values(groupedByDate).forEach((day) => {
    day.examinedAdults = examinedAdultsSet.size;
    day.examinedChildren = examinedChildrenSet.size;
    day.needSanationAdults = needSanationAdultsSet.size;
    day.needSanationChildren = needSanationChildrenSet.size;
    day.sanatedAdults = sanatedAdultsSet.size;
    day.sanatedChildren = sanatedChildrenSet.size;
    day.parodontTotal = day.parodontPatients.size;
    day.mucosaFullCourse = day.mucosaPatients.size;
    day.mucosaFullCourseChildren = day.mucosaPatientsChildren.size;
  });
  Object.values(groupedByDate).forEach((day) => {
    delete day.mucosaPatients;
  });
  const groupedData = Object.values(groupedByDate);

  let monthTotal = {};

  if (groupedData.length) {
    Object.keys(groupedData[0]).forEach((key) => {
      if (key === "date") {
        monthTotal[key] = "Всього";
      } else {
        monthTotal[key] = typeof groupedData[0][key] === "number" ? 0 : "";
      }
    });

    groupedData.forEach((day) => {
      Object.keys(day).forEach((key) => {
        if (typeof day[key] === "number") {
          monthTotal[key] += day[key];
        }
      });
    });
  }
  console.log(
    groupedData.map((d) => ({
      date: d.date,
      workedHours: d.workedHours,
    })),
  );

  return { groupedData, monthTotal };
}
