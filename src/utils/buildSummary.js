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

    if (code.startsWith("DA08.0")) return "caries";
    if (code.startsWith("DA09.0")) return "pulpitis";
    if (code.startsWith("DA0C.0")) return "periodontitis";

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
        medlikparodont: 0,
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
    let klaptevaCount = 0;
    let shinuvannyaCount = 0;

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
          klaptevaCount++;
          break;
        case "шинування_зубів":
          hasParodontPatient = true;
          shinuvannyaCount++;
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
      }
    });

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
      day.medlikparodont++;

      if (child) day.mucosaTreatmentChildren++;

      if (hasNaplast) day.naplast++;

      day.mucosaTreatment += medlikCount;
      day.kuretazh += kuretazhCount;
      day.klapteva += klaptevaCount;
      day.shinuvanya += shinuvannyaCount;

      if (
        medlikCount > 0 &&
        (hasNaplast || kuretazhCount || klaptevaCount || shinuvannyaCount)
      ) {
        day.mucosaFullCourse++;
        if (child) day.mucosaFullCourseChildren++;
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

    day.P_vitalTotal = day.pulpitisPermanent + day.pulpitisTemporary;
    day.P_vitalChildren = day.pulpitisPermanentChildren;

    day.PtTotal = day.periodontitisPermanent + day.periodontitisTemporary;
    day.PtChildren =
      day.periodontitisPermanentChildren + day.periodontitisTemporary;

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
  Object.values(groupedByDate).forEach((day) => {
    day.examinedAdults = examinedAdultsSet.size;
    day.examinedChildren = examinedChildrenSet.size;
    day.needSanationAdults = needSanationAdultsSet.size;
    day.needSanationChildren = needSanationChildrenSet.size;
    day.sanatedAdults = sanatedAdultsSet.size;
    day.sanatedChildren = sanatedChildrenSet.size;
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

  return { groupedData, monthTotal };
}
