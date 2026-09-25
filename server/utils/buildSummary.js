function isPrimary(value) {
  return Number(value) === 1;
}

function isChild(age) {
  const num = Number(age);
  return !Number.isNaN(num) && num <= 17;
}

function normalizePatientId(row) {
  return (
    row.patient_id ??
    `${row.patient_name || row.name || ""}_${row.age || ""}`
  );
}

function normalizeDate(date) {
  if (!date) return null;

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return null;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

function isInPeriod(dateStr, start, end) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return false;

  date.setHours(0, 0, 0, 0);

  if (start) {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);

    if (date < s) return false;
  }

  if (end) {
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);

    if (date > e) return false;
  }

  return true;
}

/**
 * Визначення типу зуба.
 *
 * 11–48  = постійні
 * 51–85  = тимчасові
 */
function getToothType(tooth) {
  const num = parseInt(tooth, 10);

  if (Number.isNaN(num)) return null;

  if (num >= 11 && num <= 48) {
    return "permanent";
  }

  if (num >= 51 && num <= 85) {
    return "temporary";
  }

  return null;
}

/**
 * Визначення діагнозу.
 *
 * ЗАЛИШАЄМО ТВОЮ ПОТОЧНУ СИСТЕМУ КОДІВ.
 */
function classifyDiagnosis(code) {
  if (!code) return null;

  const normalized = String(code).trim().toUpperCase();

  if (normalized.startsWith("DA09.7")) {
    return "periodontitis";
  }

  if (normalized.startsWith("DA0C")) {
    return "periodontitis";
  }

  if (normalized.startsWith("DA09")) {
    return "pulpitis";
  }

  if (normalized.startsWith("DA08")) {
    return "caries";
  }

  return null;
}

/**
 * Розбір часу.
 */
function timeToMinutes(time) {
  if (!time) return null;

  const normalized = String(time)
    .trim()
    .replace(".", ":");

  const parts = normalized.split(":");

  const h = parseInt(parts[0], 10);
  const m = parts[1] ? parseInt(parts[1], 10) : 0;

  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return null;
  }

  return h * 60 + m;
}

/**
 * Fallback для графи 2.
 *
 * УВАГА:
 * це НЕ нормативний спосіб визначення робочих годин.
 * Нормативно потрібно передавати графік роботи лікаря.
 */
function calculateWorkedHoursFromVisits(rows) {
  const times = rows
    .map((row) => timeToMinutes(row.time))
    .filter((value) => value !== null);

  if (times.length < 2) {
    return 0;
  }

  const min = Math.min(...times);
  const max = Math.max(...times);

  const diff = max - min;

  if (diff <= 0) {
    return 0;
  }

  return Number((diff / 60).toFixed(2));
}

/**
 * Граф 2.
 *
 * workSchedule:
 *
 * {
 *   "2026-09-01": 6.5,
 *   "2026-09-02": 6.5
 * }
 *
 * Якщо для конкретної дати години немає —
 * використовується fallback від першого до останнього пацієнта.
 */
function calculateWorkedHours(date, rows, workSchedule = {}) {
  if (
    workSchedule &&
    Object.prototype.hasOwnProperty.call(workSchedule, date)
  ) {
    const value = Number(workSchedule[date]);

    return Number.isFinite(value) ? value : 0;
  }

  return calculateWorkedHoursFromVisits(rows);
}

/**
 * Профілактичний огляд для граф 51 і 54.
 *
 * МОЗ вимагає:
 * - онкологічний профілактичний огляд
 * - огляд зубів
 * - огляд слизової
 * - огляд м'яких тканин
 * - оцінка прикусу
 * - складений план лікування
 *
 * Якщо у БД є готове поле prophylactic_exam = 1 —
 * використовуємо його.
 *
 * ВАЖЛИВО:
 * sanation_plan САМ ПО СОБІ не означає такий огляд.
 */
function isProphylacticExam(row) {
  if (Number(row.prophylactic_exam) === 1) {
    return true;
  }

  return (
    Number(row.oncological_exam) === 1 &&
    Number(row.teeth_exam) === 1 &&
    Number(row.mucosa_exam) === 1 &&
    Number(row.soft_tissue_exam) === 1 &&
    Number(row.occlusion_exam) === 1 &&
    Number(row.treatment_plan_created) === 1
  );
}

/**
 * Чи потрібна санація.
 *
 * Це твоя поточна бізнес-логіка.
 *
 * Її потрібно буде окремо узгодити з довідником
 * діагнозів/процедур, якщо ти хочеш 100% медичну
 * автоматизацію.
 */
function patientNeedsSanation(row) {
  const treatments = Array.isArray(row.procedures)
    ? row.procedures.filter(Boolean)
    : [];

  const cases = [
    {
      diagnosis: row.diagnosis1,
      tooth: row.tooth1,
    },
    {
      diagnosis: row.diagnosis2,
      tooth: row.tooth2,
    },
  ].filter((item) => item.diagnosis && item.tooth);

  const clinicalNeed = cases.some((item) =>
    [
      "caries",
      "pulpitis",
      "periodontitis",
    ].includes(classifyDiagnosis(item.diagnosis)),
  );

  const treatmentNeed = treatments.some((procedure) =>
    [
      "PlC",
      "PlLC",
      "PlAm",
      "PlCC",
      "депульповано_зубів",
      "видалення_зуба_карієс",
    ].includes(procedure),
  );

  return clinicalNeed || treatmentNeed;
}

/**
 * Отримання діагностичних випадків.
 */
function getCases(row) {
  return [
    {
      diagnosis: row.diagnosis1,
      tooth: row.tooth1,
    },
    {
      diagnosis: row.diagnosis2,
      tooth: row.tooth2,
    },
  ]
    .filter((item) => item.diagnosis && item.tooth)
    .map((item) => ({
      ...item,
      type: classifyDiagnosis(item.diagnosis),
      toothType: getToothType(item.tooth),
    }));
}

/**
 * Створення структури дня.
 */
function createDay(date) {
  return {
    date,

    // 1
    workedHours: 0,

    // 3
    visits: 0,

    // 4
    rural: 0,

    // 5
    primaryTotal: 0,
    primaryRural: 0,

    // 6
    primaryChildren: 0,

    // 7
    emergency: 0,

    // 8
    filledTeethTotal: 0,

    // 9–11
    cariesPermanent: 0,
    cariesPermanentChildren: 0,
    cariesTemporary: 0,

    // 12–13
    pulpitisPermanent: 0,
    pulpitisPermanentChildren: 0,

    // 14–15
    periodontitisPermanent: 0,
    periodontitisPermanentChildren: 0,

    // 16
    pulpitisTemporary: 0,

    // 17
    periodontitisTemporary: 0,

    // 18–19
    P_vitalTotal: 0,
    P_vitalChildren: 0,

    // 20–21
    PtTotal: 0,
    PtChildren: 0,

    // 22
    depulped: 0,

    // 23–26
    PlC: 0,
    PlAm: 0,
    PlCC: 0,
    PlLC: 0,

    // 27
    anesthesiaLocal: 0,
    anesthesiaGeneral: 0,

    // 28–34
    parodontTotal: 0,
    parodontChildren: 0,
    naplast: 0,
    medlikCourseCount: 0,
    kuretazh: 0,
    klapteva: 0,
    shinuvanya: 0,

    // 35–36
    mucosaFullCourse: 0,
    mucosaFullCourseChildren: 0,

    // 37
    ToothExtractionTotal: 0,

    // 38
    ToothExtractionCariesAdultsPermanent: 0,

    // 39
    ExtractionParodontAdultsPermanent: 0,

    // 40
    ToothExtractionCariesChildrenPermanent: 0,

    // 41
    ExtractionOrthodonticChildrenPermanent: 0,

    // 42
    ToothExtractionCariesChildrenTemporary: 0,

    // 43
    ExtractionphysiologyChildrenTemporary: 0,

    // 44–48
    OperatioTotal: 0,
    OperatioInflammatoryProcesses: 0,
    OperatioTumors: 0,
    OperatioImplants: 0,
    OperatioOthers: 0,

    // 49–50
    sanatio: 0,
    sanatioChildren: 0,

    // 51–53
    examinedAdults: 0,
    needSanationAdults: 0,
    sanatedAdults: 0,

    // 54–56
    examinedChildren: 0,
    needSanationChildren: 0,
    sanatedChildren: 0,

    // 57–61
    HygieneEducation: 0,
    OralCare: 0,
    ProfessionalOralHygiene: 0,
    RemineralizationTherapy: 0,
    PitAndFissureSealing: 0,

    // 62
    uop: 0,

    // службові Set-и
    _primaryPatients: new Set(),

    _sanatedPatients: new Set(),
    _sanatedChildren: new Set(),

    _examinedAdults: new Set(),
    _examinedChildren: new Set(),

    _needSanationAdults: new Set(),
    _needSanationChildren: new Set(),

    _parodontPatients: new Set(),
    _parodontChildren: new Set(),

    _mucosaPatients: new Set(),
    _mucosaChildren: new Set(),

    // для повного курсу
    _mucosaFullCoursePatients: new Set(),
    _mucosaFullCourseChildren: new Set(),
  };
}

/**
 * Фіксуємо повний курс лікування пародонту.
 *
 * Важливий момент:
 * графа 28 — пацієнти,
 * графа 31 — кількість пацієнтів, яким проведено
 * повний курс медикаментозного лікування.
 *
 * Кількість сеансів у графі 31 — за прикладом МОЗ.
 *
 * Тобто якщо один пацієнт має 5 процедур
 * медикаментозного лікування — +5.
 */
function processPeriodontal(day, row, treatments, child) {
  const patientId = normalizePatientId(row);

  let hasPeriodontal = false;

  let hasNaplast = false;
  let hasKlapteva = false;
  let hasShinuvannya = false;

  let medicationSessions = 0;
  let curettageSessions = 0;

  treatments.forEach((procedure) => {
    switch (procedure) {
      case "зняття_напластувань":
        hasPeriodontal = true;
        hasNaplast = true;
        break;

      case "медикаментозне_лікування_пародонту":
        hasPeriodontal = true;
        medicationSessions++;
        break;

      case "кюретаж":
        hasPeriodontal = true;
        curettageSessions++;
        break;

      case "клаптева_операція":
        hasPeriodontal = true;
        hasKlapteva = true;
        break;

      case "шинування_зубів":
        hasPeriodontal = true;
        hasShinuvannya = true;
        break;

      default:
        break;
    }
  });

  if (!hasPeriodontal) {
    return;
  }

  day._parodontPatients.add(patientId);

  if (child) {
    day._parodontChildren.add(patientId);
  }

  if (hasNaplast) {
    day.naplast++;
  }

  if (hasKlapteva) {
    day.klapteva++;
  }

  if (hasShinuvannya) {
    day.shinuvanya++;
  }

  day.medlikCourseCount += medicationSessions;
  day.kuretazh += curettageSessions;
}

/**
 * Обробка видалення.
 *
 * Тут принципово:
 *
 * 38 = дорослий + постійний + ускладнений карієс
 * 39 = дорослий + постійний + пародонтит
 * 40 = дитина + постійний + ускладнений карієс
 * 41 = дитина + постійний + ортодонтична мета
 * 42 = дитина + тимчасовий + ускладнений карієс
 * 43 = дитина + тимчасовий + фізіологічна зміна
 */
function processExtraction(
  day,
  row,
  cases,
  child,
  treatments,
) {
  const extractionProcedures = treatments.filter((procedure) =>
    [
      "видалення_зуба_карієс",
      "видалення_зуба_пародонт",
      "видалення_зуба_ортодонт",
      "видалення_зуба_фізіол",
    ].includes(procedure),
  );

  if (!extractionProcedures.length) {
    return;
  }

  const toothCases = cases.filter(
    (item) => item.toothType === "permanent" || item.toothType === "temporary",
  );

  /**
   * Якщо в одному записі є один зуб — класифікуємо його.
   *
   * Якщо в одному записі декілька зубів і декілька
   * процедур видалення — структура 037/о повинна
   * зберігати зв'язок процедура -> зуб.
   *
   * Поточна модель procedures не має такого зв'язку.
   */
  const targetCase = toothCases[0];

  // 37 — всі видалені зуби.
  day.ToothExtractionTotal += extractionProcedures.length;

  extractionProcedures.forEach((procedure) => {
    if (!targetCase) {
      return;
    }

    const permanent = targetCase.toothType === "permanent";
    const temporary = targetCase.toothType === "temporary";

    const complicatedCaries =
      targetCase.type === "pulpitis" ||
      targetCase.type === "periodontitis";

    switch (procedure) {
      case "видалення_зуба_карієс":
        if (complicatedCaries && !child && permanent) {
          day.ToothExtractionCariesAdultsPermanent++;
        }

        if (complicatedCaries && child && permanent) {
          day.ToothExtractionCariesChildrenPermanent++;
        }

        if (complicatedCaries && child && temporary) {
          day.ToothExtractionCariesChildrenTemporary++;
        }

        break;

      case "видалення_зуба_пародонт":
        if (!child && permanent) {
          day.ExtractionParodontAdultsPermanent++;
        }

        break;

      case "видалення_зуба_ортодонт":
        if (child && permanent) {
          day.ExtractionOrthodonticChildrenPermanent++;
        }

        break;

      case "видалення_зуба_фізіол":
        if (child && temporary) {
          day.ExtractionphysiologyChildrenTemporary++;
        }

        break;

      default:
        break;
    }
  });
}

/**
 * Обробка пломб.
 */
function processFillings(day, row, cases, child, treatments) {
  const fillingProcedures = treatments.filter((procedure) =>
    [
      "PlC",
      "PlAm",
      "PlCC",
      "PlLC",
    ].includes(procedure),
  );

  if (!fillingProcedures.length) {
    return;
  }

  /**
   * Графи 23–26.
   */
  fillingProcedures.forEach((procedure) => {
    switch (procedure) {
      // 23 цемент
      case "PlC":
        day.PlC++;
        break;

      // 24 амальгама
      case "PlAm":
        day.PlAm++;
        break;

      // 25 хімічний композит
      case "PlCC":
        day.PlCC++;
        break;

      // 26 світлополімер
      case "PlLC":
        day.PlLC++;
        break;

      default:
        break;
    }
  });

  /**
   * Графа 8:
   * всі запломбовані зуби.
   *
   * Кількість процедур пломбування = кількість
   * запломбованих зубів лише за умови,
   * що одна процедура відповідає одному зубу.
   *
   * Для твоєї поточної моделі це найближчий
   * достовірний варіант.
   */
  day.filledTeethTotal += fillingProcedures.length;

  /**
   * Для граф 9–17 нам потрібен зв'язок
   * пломба -> діагноз -> зуб.
   *
   * Якщо в рядку один клінічний випадок,
   * класифікуємо всі пломби за ним.
   *
   * Якщо випадків декілька — потрібен зв'язок
   * procedure з конкретним tooth у БД.
   */
  if (!cases.length) {
    return;
  }

  const relevantCases = cases.filter(
    (item) =>
      item.toothType &&
      [
        "caries",
        "pulpitis",
        "periodontitis",
      ].includes(item.type),
  );

  if (!relevantCases.length) {
    return;
  }

  /**
   * Якщо є один випадок — він однозначний.
   */
  if (relevantCases.length === 1) {
    const item = relevantCases[0];

    fillingProcedures.forEach(() => {
      if (item.type === "caries") {
        if (item.toothType === "permanent") {
          day.cariesPermanent++;

          if (child) {
            day.cariesPermanentChildren++;
          }
        }

        if (item.toothType === "temporary" && child) {
          day.cariesTemporary++;
        }
      }

      if (item.type === "pulpitis") {
        if (item.toothType === "permanent") {
          day.pulpitisPermanent++;

          if (child) {
            day.pulpitisPermanentChildren++;
          }
        }

        if (item.toothType === "temporary" && child) {
          day.pulpitisTemporary++;
        }
      }

      if (item.type === "periodontitis") {
        if (item.toothType === "permanent") {
          day.periodontitisPermanent++;

          if (child) {
            day.periodontitisPermanentChildren++;
          }
        }

        if (item.toothType === "temporary" && child) {
          day.periodontitisTemporary++;
        }
      }
    });

    return;
  }

  /**
   * Якщо випадків два — розподіляємо пломби
   * послідовно по випадках.
   *
   * Це тимчасова сумісність із поточною структурою.
   *
   * Для 100% точності краще зберігати:
   * {
   *   procedure: "PlLC",
   *   tooth: 36
   * }
   */
  fillingProcedures.forEach((_, index) => {
    const item = relevantCases[index];

    if (!item) return;

    if (item.type === "caries") {
      if (item.toothType === "permanent") {
        day.cariesPermanent++;

        if (child) {
          day.cariesPermanentChildren++;
        }
      }

      if (item.toothType === "temporary" && child) {
        day.cariesTemporary++;
      }
    }

    if (item.type === "pulpitis") {
      if (item.toothType === "permanent") {
        day.pulpitisPermanent++;

        if (child) {
          day.pulpitisPermanentChildren++;
        }
      }

      if (item.toothType === "temporary" && child) {
        day.pulpitisTemporary++;
      }
    }

    if (item.type === "periodontitis") {
      if (item.toothType === "permanent") {
        day.periodontitisPermanent++;

        if (child) {
          day.periodontitisPermanentChildren++;
        }
      }

      if (item.toothType === "temporary" && child) {
        day.periodontitisTemporary++;
      }
    }
  });
}

/**
 * Основна функція.
 *
 * dailyData  - дані поточного місяця/періоду
 *
 * startStr/endStr - період звіту
 *
 * annualData - всі записи за звітний рік.
 *
 * workSchedule - графік роботи лікаря.
 */
export function buildSummary(
  dailyData,
  startStr,
  endStr,
  annualData = dailyData,
  workSchedule = {},
) {
  const groupedByDate = {};

  const start = startStr
    ? new Date(startStr)
    : null;

  if (start) {
    start.setHours(0, 0, 0, 0);
  }

  const end = endStr
    ? new Date(endStr)
    : null;

  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  /**
   * --------------------------------------------------
   * 1. ПІДГОТОВКА РІЧНИХ ДАНИХ
   * --------------------------------------------------
   *
   * Це критично для граф 5, 51, 54.
   *
   * МОЗ:
   * первинний пацієнт — один раз за рік.
   *
   * Профілактично оглянутий —
   * один раз за рік.
   *
   * Санований —
   * один раз за рік для відповідних граф.
   */

  const annualRows = (annualData || [])
    .filter((row) => row.date)
    .map((row) => ({
      ...row,
      __date: normalizeDate(row.date),
      __patientId: normalizePatientId(row),
    }))
    .filter((row) => row.__date);

  /**
   * Перше первинне звернення пацієнта за рік.
   */
  const firstPrimaryByPatient = new Map();

  annualRows
    .filter((row) => isPrimary(row.visit_type))
    .sort((a, b) =>
      String(a.__date).localeCompare(String(b.__date)),
    )
    .forEach((row) => {
      if (!firstPrimaryByPatient.has(row.__patientId)) {
        firstPrimaryByPatient.set(
          row.__patientId,
          row,
        );
      }
    });

  /**
   * Перший профілактичний огляд за рік.
   */
  const firstProphylacticByPatient = new Map();

  annualRows
    .filter((row) => isProphylacticExam(row))
    .sort((a, b) =>
      String(a.__date).localeCompare(String(b.__date)),
    )
    .forEach((row) => {
      if (!firstProphylacticByPatient.has(row.__patientId)) {
        firstProphylacticByPatient.set(
          row.__patientId,
          row,
        );
      }
    });

  /**
   * Перше санування за рік.
   */
  const firstSanationByPatient = new Map();

  annualRows
    .filter(
      (row) =>
        Number(row.sanation) === 1 ||
        (
          Array.isArray(row.procedures) &&
          row.procedures.includes("планова_санація")
        ),
    )
    .sort((a, b) =>
      String(a.__date).localeCompare(String(b.__date)),
    )
    .forEach((row) => {
      if (!firstSanationByPatient.has(row.__patientId)) {
        firstSanationByPatient.set(
          row.__patientId,
          row,
        );
      }
    });

  /**
   * --------------------------------------------------
   * 2. ДЕННІ ДАНІ
   * --------------------------------------------------
   */

  dailyData.forEach((originalRow) => {
    if (!originalRow?.date) {
      return;
    }

    const date = normalizeDate(originalRow.date);

    if (!date) {
      return;
    }

    if (!isInPeriod(date, start, end)) {
      return;
    }

    const row = {
      ...originalRow,
      __date: date,
      __patientId: normalizePatientId(originalRow),
    };

    const patientId = row.__patientId;
    const child = isChild(row.age);

    const treatments = Array.isArray(row.procedures)
      ? row.procedures.filter(Boolean)
      : [];

    const cases = getCases(row);

    if (!groupedByDate[date]) {
      groupedByDate[date] = createDay(date);
    }

    const day = groupedByDate[date];

    /**
     * -----------------------------------------------
     * ГРАФА 3 — ВСІ ВІДВІДУВАННЯ
     * -----------------------------------------------
     */

    day.visits++;

    /**
     * -----------------------------------------------
     * ГРАФА 4 — СІЛЬСЬКІ ЖИТЕЛІ
     * -----------------------------------------------
     */

    if (
      String(row.residence || "")
        .trim()
        .toLowerCase() === "село"
    ) {
      day.rural++;
    }

    /**
     * -----------------------------------------------
     * ГРАФА 5 — ПЕРВИННІ
     * -----------------------------------------------
     *
     * Не "один раз на день".
     *
     * Не "один раз у місяць".
     *
     * Один раз на звітний рік.
     */

    if (isPrimary(row.visit_type)) {
      const firstPrimary = firstPrimaryByPatient.get(patientId);

      if (
        firstPrimary &&
        firstPrimary.__date === date &&
        !day._primaryPatients.has(patientId)
      ) {
        day._primaryPatients.add(patientId);

        day.primaryTotal++;

        if (
          String(firstPrimary.residence || "")
            .trim()
            .toLowerCase() === "село"
        ) {
          day.primaryRural++;
        }

        if (isChild(firstPrimary.age)) {
          day.primaryChildren++;
        }
      }
    }

    /**
     * -----------------------------------------------
     * ГРАФА 7 — НЕВІДКЛАДНА ДОПОМОГА
     * -----------------------------------------------
     */

    day.emergency += treatments.filter(
      (procedure) =>
        procedure === "невідкладна_допомога",
    ).length;

    /**
     * -----------------------------------------------
     * ГРАФИ 49–56
     * -----------------------------------------------
     */

    const prophylactic = isProphylacticExam(row);
    const needsSanation = patientNeedsSanation(row);

    /**
     * 51/54:
     * профілактично оглянутий.
     *
     * Беремо тільки перший такий огляд у році.
     */
    if (prophylactic) {
      const firstExam =
        firstProphylacticByPatient.get(patientId);

      if (
        firstExam &&
        firstExam.__date === date
      ) {
        if (child) {
          day._examinedChildren.add(patientId);
        } else {
          day._examinedAdults.add(patientId);
        }
      }
    }

    /**
     * 52/55:
     * потребував санації з числа
     * профілактично оглянутих.
     */
    if (
      prophylactic &&
      needsSanation
    ) {
      const firstExam =
        firstProphylacticByPatient.get(patientId);

      if (
        firstExam &&
        firstExam.__date === date
      ) {
        if (child) {
          day._needSanationChildren.add(patientId);
        } else {
          day._needSanationAdults.add(patientId);
        }
      }
    }

    /**
     * 49/50/53/56.
     *
     * Санований — один раз на рік.
     */
    const sanated =
      Number(row.sanation) === 1;

    if (sanated) {
      const firstSanation =
        firstSanationByPatient.get(patientId);

      if (
        firstSanation &&
        firstSanation.__date === date
      ) {
        day._sanatedPatients.add(patientId);

        if (child) {
          day._sanatedChildren.add(patientId);
        }
      }
    }

    /**
     * -----------------------------------------------
     * ГРАФИ 8–26
     * -----------------------------------------------
     */

    processFillings(
      day,
      row,
      cases,
      child,
      treatments,
    );

    /**
     * -----------------------------------------------
     * ГРАФИ 18–21
     * -----------------------------------------------
     */

    const vitalCount =
      treatments.filter(
        (procedure) =>
          procedure === "P_вітально_хірургічно",
      ).length;

    if (vitalCount > 0) {
      const pulpitisCases = cases.filter(
        (item) =>
          item.type === "pulpitis",
      );

      const count = Math.min(
        vitalCount,
        pulpitisCases.length,
      );

      day.P_vitalTotal += count;

      if (child) {
        day.P_vitalChildren += count;
      }
    }

    const ptCount =
      treatments.filter(
        (procedure) =>
          procedure === "Pt",
      ).length;

    if (ptCount > 0) {
      const periodontitisCases = cases.filter(
        (item) =>
          item.type === "periodontitis",
      );

      const count = Math.min(
        ptCount,
        periodontitisCases.length,
      );

      day.PtTotal += count;

      if (child) {
        day.PtChildren += count;
      }
    }

    /**
     * -----------------------------------------------
     * ГРАФА 22
     * -----------------------------------------------
     */

    const depulpCount =
      treatments.filter(
        (procedure) =>
          procedure === "депульповано_зубів",
      ).length;

    if (depulpCount > 0) {
      const hasCaries =
        cases.some(
          (item) =>
            item.type === "caries",
        );

      if (!hasCaries) {
        day.depulped += depulpCount;
      }
    }

    /**
     * -----------------------------------------------
     * ГРАФИ 28–34
     * -----------------------------------------------
     */

    processPeriodontal(
      day,
      row,
      treatments,
      child,
    );

    /**
     * -----------------------------------------------
     * ГРАФИ 35–36
     * -----------------------------------------------
     *
     * Тут спеціально НЕ рахуємо просто
     * факт "лікування слизової".
     *
     * Потрібно поле:
     *
     * mucosa_full_course = 1
     *
     * після завершення повного курсу.
     */

    if (
      Number(row.mucosa_full_course) === 1
    ) {
      day._mucosaFullCoursePatients.add(
        patientId,
      );

      if (child) {
        day._mucosaFullCourseChildren.add(
          patientId,
        );
      }
    }

    /**
     * -----------------------------------------------
     * ГРАФИ 37–43
     * -----------------------------------------------
     */

    processExtraction(
      day,
      row,
      cases,
      child,
      treatments,
    );

    /**
     * -----------------------------------------------
     * ГРАФИ 44–48
     * -----------------------------------------------
     */

    treatments.forEach((procedure) => {
      switch (procedure) {
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

        default:
          break;
      }
    });

    /**
     * -----------------------------------------------
     * ГРАФИ 57–61
     * -----------------------------------------------
     */

    treatments.forEach((procedure) => {
      switch (procedure) {
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

        default:
          break;
      }
    });

    /**
     * -----------------------------------------------
     * ГРАФА 27 — ЗНЕБОЛЕННЯ
     * -----------------------------------------------
     */

    const anesthesia = Number(row.anesthesia);

    if (anesthesia === 1) {
      day.anesthesiaLocal++;
    }

    if (anesthesia === 2) {
      day.anesthesiaGeneral++;
    }

    /**
     * -----------------------------------------------
     * ГРАФА 62 — УОП
     * -----------------------------------------------
     */

    const uop = Number.parseFloat(row.uop);

    if (Number.isFinite(uop)) {
      day.uop += uop;
    }
  });

  /**
   * --------------------------------------------------
   * 3. ЗАВЕРШЕННЯ ДЕННИХ РОЗРАХУНКІВ
   * --------------------------------------------------
   */

  Object.values(groupedByDate).forEach((day) => {
    const rowsForDay = dailyData.filter(
      (row) =>
        normalizeDate(row.date) === day.date &&
        row.time,
    );

    /**
     * ГРАФА 2.
     */
    day.workedHours =
      calculateWorkedHours(
        day.date,
        rowsForDay,
        workSchedule,
      );

    /**
     * 28–29
     */
    day.parodontTotal =
      day._parodontPatients.size;

    day.parodontChildren =
      day._parodontChildren.size;

    /**
     * 35–36
     */
    day.mucosaFullCourse =
      day._mucosaFullCoursePatients.size;

    day.mucosaFullCourseChildren =
      day._mucosaFullCourseChildren.size;

    /**
     * 49–50
     */
    day.sanatio =
      day._sanatedPatients.size;

    day.sanatioChildren =
      day._sanatedChildren.size;

    /**
     * 51–53
     */
    day.examinedAdults =
      day._examinedAdults.size;

    day.needSanationAdults =
      day._needSanationAdults.size;

    day.sanatedAdults =
      [...day._sanatedPatients].filter(
        (patientId) => {
          const row = annualRows.find(
            (item) =>
              item.__patientId === patientId &&
              item.__date === day.date,
          );

          return row && !isChild(row.age);
        },
      ).length;

    /**
     * 54–56
     */
    day.examinedChildren =
      day._examinedChildren.size;

    day.needSanationChildren =
      day._needSanationChildren.size;

    day.sanatedChildren =
      day._sanatedChildren.size;

    /**
     * 44
     */
    day.OperatioTotal =
      day.OperatioInflammatoryProcesses +
      day.OperatioTumors +
      day.OperatioImplants +
      day.OperatioOthers;

    /**
     * Графа 8 повинна включати
     * всі пломби, включно з некаріозними.
     *
     * Тому тут НЕ робимо:
     *
     * 9 + 12 + 14 + 16 + 17
     *
     * як джерело графи 8.
     *
     * Графа 8 уже накопичена безпосередньо
     * з процедур пломбування.
     */

    delete day._primaryPatients;

    delete day._sanatedPatients;
    delete day._sanatedChildren;

    delete day._examinedAdults;
    delete day._examinedChildren;

    delete day._needSanationAdults;
    delete day._needSanationChildren;

    delete day._parodontPatients;
    delete day._parodontChildren;

    delete day._mucosaPatients;
    delete day._mucosaChildren;

    delete day._mucosaFullCoursePatients;
    delete day._mucosaFullCourseChildren;
  });

  /**
   * --------------------------------------------------
   * 4. СОРТУВАННЯ ДНІВ
   * --------------------------------------------------
   */

  const groupedData = Object.values(
    groupedByDate,
  ).sort((a, b) =>
    String(a.date).localeCompare(
      String(b.date),
    ),
  );

  /**
   * --------------------------------------------------
   * 5. МІСЯЧНИЙ ПІДСУМОК
   * --------------------------------------------------
   */

  const monthTotal = {
    date: "Всього",
  };

  if (groupedData.length) {
    const keys = Object.keys(groupedData[0]);

    keys.forEach((key) => {
      if (key === "date") {
        return;
      }

      monthTotal[key] = groupedData.reduce(
        (sum, day) => {
          const value = day[key];

          if (
            typeof value === "number" &&
            Number.isFinite(value)
          ) {
            return sum + value;
          }

          return sum;
        },
        0,
      );
    });
  }

  /**
   * --------------------------------------------------
   * 6. ПЕРЕВІРКА ЛОГІЧНИХ ЗАЛЕЖНОСТЕЙ
   * --------------------------------------------------
   *
   * Тут НЕ змінюємо дані автоматично.
   *
   * Просто показуємо проблеми.
   */

  const validation = [];

  function checkLE(
    smaller,
    bigger,
    smallerGraph,
    biggerGraph,
  ) {
    if (
      Number(monthTotal[smaller] || 0) >
      Number(monthTotal[bigger] || 0)
    ) {
      validation.push(
        `Графа ${smallerGraph} (${monthTotal[smaller]}) ` +
        `не може бути більшою за графу ${biggerGraph} ` +
        `(${monthTotal[bigger]}).`,
      );
    }
  }

  checkLE(
    "cariesPermanentChildren",
    "cariesPermanent",
    10,
    9,
  );

  checkLE(
    "pulpitisPermanentChildren",
    "pulpitisPermanent",
    13,
    12,
  );

  checkLE(
    "periodontitisPermanentChildren",
    "periodontitisPermanent",
    15,
    14,
  );

  checkLE(
    "P_vitalChildren",
    "P_vitalTotal",
    19,
    18,
  );

  checkLE(
    "PtChildren",
    "PtTotal",
    21,
    20,
  );

  checkLE(
    "parodontChildren",
    "parodontTotal",
    29,
    28,
  );

  checkLE(
    "mucosaFullCourseChildren",
    "mucosaFullCourse",
    36,
    35,
  );

  checkLE(
    "ToothExtractionCariesAdultsPermanent",
    "ToothExtractionTotal",
    38,
    37,
  );

  checkLE(
    "ExtractionParodontAdultsPermanent",
    "ToothExtractionTotal",
    39,
    37,
  );

  checkLE(
    "ToothExtractionCariesChildrenPermanent",
    "ToothExtractionTotal",
    40,
    37,
  );

  checkLE(
    "ExtractionOrthodonticChildrenPermanent",
    "ToothExtractionTotal",
    41,
    37,
  );

  checkLE(
    "ToothExtractionCariesChildrenTemporary",
    "ToothExtractionTotal",
    42,
    37,
  );

  checkLE(
    "ExtractionphysiologyChildrenTemporary",
    "ToothExtractionTotal",
    43,
    37,
  );

  checkLE(
    "OperatioInflammatoryProcesses",
    "OperatioTotal",
    45,
    44,
  );

  checkLE(
    "OperatioTumors",
    "OperatioTotal",
    46,
    44,
  );

  checkLE(
    "OperatioImplants",
    "OperatioTotal",
    47,
    44,
  );

  checkLE(
    "OperatioOthers",
    "OperatioTotal",
    48,
    44,
  );

  checkLE(
    "sanatioChildren",
    "sanatio",
    50,
    49,
  );

  checkLE(
    "needSanationAdults",
    "examinedAdults",
    52,
    51,
  );

  checkLE(
    "sanatedAdults",
    "needSanationAdults",
    53,
    52,
  );

  checkLE(
    "examinedChildren",
    "primaryChildren",
    54,
    6,
  );

  checkLE(
    "needSanationChildren",
    "examinedChildren",
    55,
    54,
  );

  checkLE(
    "sanatedChildren",
    "needSanationChildren",
    56,
    55,
  );

  return {
    groupedData,
    monthTotal,
    validation,
  };
}