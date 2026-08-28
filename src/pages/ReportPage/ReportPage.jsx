import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import css from "./ReportPage.module.css";
import "./PrintReceipt.css";
function ReportPage() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [report, setReport] = useState([]);
  const [customServices, setCustomServices] = useState([]);
  const [openServices, setOpenServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  useEffect(() => {
    loadReport();
  }, [month, year]);
  useEffect(() => {
    if (!loading && report.length > 0) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [loading, report]);
  useEffect(() => {
    loadCustomServices();
  }, []);
  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/patients/report?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Помилка завантаження звіту");
      }
      console.log("REPORT PAGE DATA:", data);
      setReport(data);
    } catch (err) {
      console.error("REPORT LOAD ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const loadCustomServices = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/prices/custom`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Помилка завантаження додаткових послуг",
        );
      }

      setCustomServices(data);
      console.log("CUSTOM SERVICES:", data);
    } catch (err) {
      console.error("LOAD CUSTOM SERVICES ERROR:", err);
    }
  };
  const addCustomService = async (patient, service) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/patients/${patient.patient_id}/services`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            service_id: service.id,
            service_name: service.name,
            price: Number(service.price) || 0,
            date: patient.date,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Помилка додавання послуги");
      }

      console.log("SERVICE ADDED:", data);

      // Закриваємо меню
      setOpenServices(null);

      // Перезавантажуємо звіт,
      // щоб отримати нову суму та послугу
      loadReport();
    } catch (err) {
      console.error("ADD SERVICE ERROR:", err);
    }
  };
  const deleteCustomService = async (serviceId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/patients/services/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Помилка видалення послуги");
      }

      console.log("SERVICE DELETED:", data);

      // Оновлюємо звіт
      loadReport();
    } catch (err) {
      console.error("DELETE SERVICE ERROR:", err);
    }
  };
  const printPatientServices = (patient) => {
    const procedureRows = patient.procedures
      .map(
        (procedure) => `
        <tr>
          <td>${procedure.name}</td>
          <td>${Number(procedure.price).toFixed(2)} грн</td>
        </tr>
      `,
      )
      .join("");

    const serviceRows = patient.custom_services
      .map(
        (service) => `
        <tr>
          <td>${service.name}</td>
          <td>${Number(service.price).toFixed(2)} грн</td>
        </tr>
      `,
      )
      .join("");

    const printWindow = window.open("", "_blank", "width=500,height=700");

    if (!printWindow) {
      alert("Браузер заблокував вікно друку.");
      return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="uk">
      <head>
        <meta charset="UTF-8">

        <title>
          Чек — ${patient.patient_name}
        </title>

        
      </head>

      <body>

        <div class="printReceipt">

          <h2>
            СТОМАТОЛОГІЧНІ ПОСЛУГИ
          </h2>

          <div class="info">
            <strong>Пацієнт:</strong>
            ${patient.patient_name}

            <br>

            <strong>Дата:</strong>
            ${patient.date}
          </div>

          <table class="servicesTable">

            <thead>
              <tr>
                <th>Послуга</th>
                <th>Ціна</th>
              </tr>
            </thead>

            <tbody>
              ${procedureRows}
              ${serviceRows}
            </tbody>

          </table>

          <div class="total">
            РАЗОМ:
            ${Number(patient.total).toFixed(2)} грн
          </div>

          <button
            class="printButton"
            onclick="window.print()"
          >
            🖨 Друкувати
          </button>

        </div>

      </body>
    </html>
  `);

    printWindow.document.close();
  };
  const dailyTotals = report.reduce((acc, patient) => {
    const date = patient.date;

    if (!acc[date]) {
      acc[date] = 0;
    }

    acc[date] += Number(patient.total) || 0;

    return acc;
  }, {});

  const monthTotal = report.reduce(
    (sum, patient) => sum + (Number(patient.total) || 0),
    0,
  );
  return (
    <div className={css.page}>
      <button className={css.homeButton} onClick={() => navigate("/")}>
        Головна
      </button>

      <h1>Фінансовий звіт</h1>

      <div className={css.filters}>
        <label>
          Місяць:
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>

        <label>
          Рік:
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>
      </div>

      {loading && <p>Завантаження...</p>}

      {error && <p className={css.error}>Помилка: {error}</p>}

      {!loading && !error && (
        <table className={css.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>Пацієнт</th>
              <th>Процедури</th>
              <th>Додаткові послуги</th>
              <th>Загальна сума, грн</th>
              <th>Друк</th>
              <th>Надіслати</th>
            </tr>
          </thead>

          <tbody>
            {report.map((patient, index) => {
              const nextPatient = report[index + 1];

              const isLastPatientOfDay =
                !nextPatient || nextPatient.date !== patient.date;

              return (
                <React.Fragment
                  key={`${patient.date}-${patient.patient_id}-${index}`}
                >
                  <tr>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{patient.patient_name}</strong>
                      <div className={css.date}>{patient.date}</div>
                    </td>

                    <td>
                      {patient.procedures.length === 0 ? (
                        "—"
                      ) : (
                        <div>
                          {patient.procedures.map((procedure, i) => (
                            <div key={i}>
                              {procedure.name}
                              {" — "}
                              {procedure.price} грн
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td>
                      {patient.custom_services.length > 0 &&
                        patient.custom_services.map((service) => (
                          <div key={service.id} className={css.serviceItem}>
                            <span>
                              {service.name} — {service.price} грн
                            </span>

                            <button
                              type="button"
                              className={css.deleteServiceButton}
                              onClick={() => deleteCustomService(service.id)}
                              title="Видалити послугу"
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                      <button
                        type="button"
                        onClick={() =>
                          setOpenServices(
                            openServices === patient.patient_id
                              ? null
                              : patient.patient_id,
                          )
                        }
                      >
                        + Додаткові послуги
                      </button>

                      {openServices === patient.patient_id && (
                        <div className={css.servicesMenu}>
                          {customServices.length === 0 ? (
                            <div>Додаткових послуг немає</div>
                          ) : (
                            customServices.map((service) => (
                              <button
                                type="button"
                                key={service.id}
                                onClick={() =>
                                  addCustomService(patient, service)
                                }
                              >
                                {service.name} — {service.price} грн
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </td>

                    <td className={css.total}>
                      {Number(patient.total).toFixed(2)}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => printPatientServices(patient)}
                      >
                        🖨 Друк
                      </button>
                    </td>

                    <td>
                      <button disabled>📤 Надіслати</button>
                    </td>
                  </tr>

                  {isLastPatientOfDay && (
                    <tr className={css.dayTotalRow}>
                      <td colSpan="4">Сума за {patient.date}</td>

                      <td className={css.dayTotal}>
                        {dailyTotals[patient.date].toFixed(2)} грн
                      </td>

                      <td colSpan="2"></td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {report.length > 0 && (
              <tr className={css.monthTotalRow}>
                <td colSpan="4">ЗАГАЛЬНИЙ ДОХІД ЗА МІСЯЦЬ</td>

                <td className={css.monthTotal}>{monthTotal.toFixed(2)} грн</td>

                <td colSpan="2"></td>
              </tr>
            )}

            <tr>
              <td ref={bottomRef} colSpan="7"></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReportPage;
