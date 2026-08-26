import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import css from "./PricesPage.module.css";

const procedureOptions = [
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
  { value: "PlAm", label: "PlAm" },
  { value: "PlCC", label: "PlCC" },
  {
    value: "зняття_напластувань",
    label: "Повне зняття зубних напластувань",
  },
  {
    value: "медикаментозне_лікування_пародонту",
    label: "Медикаментозне лікування",
  },
  {
    value: "шинування_зубів",
    label: "Тимчасове шинування зубів",
  },
  {
    value: "лікування_слизової_рота",
    label: "Лікування слизової оболонки порожнини рота",
  },
  { value: "рентген", label: "Рентген" },
  {
    value: "планова_санація",
    label: "Оглянуто в порядку планової санації",
  },
  { value: "гігієна", label: "Гігієнічне навчання" },
  {
    value: "навчання_догляду",
    label: "Навчання догляду за порожниною рота",
  },
  {
    value: "професійна_гігієна",
    label: "Професійна гігієна",
  },
  {
    value: "ремінералізуюча_терапія",
    label: "Ремінералізуюча терапія",
  },
  {
    value: "герметизація_фісур",
    label: "Герметизація фісур",
  },
  { value: "пломб_корен_кан_1", label: "Пломб.корен.кан.(1)" },
  { value: "пломб_корен_кан_2", label: "Пломб.корен.кан.(2)" },
  { value: "пломб_корен_кан_3", label: "Пломб.корен.кан.(3)" },

  {
    value: "кюретаж",
    label: "Кюретаж",
  },
  {
    value: "клаптева_операція",
    label: "Клаптева та інші операції",
  },
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
  {
    value: "операція_імплантати",
    label: "Операція - зубні імплантати",
  },
  {
    value: "операція_інші",
    label: "Операція - інші",
  },
];

function PricesPage() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState({});
  const [customServices, setCustomServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [savingService, setSavingService] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        // -------------------------
        // Завантаження цін процедур
        // -------------------------

        const pricesRes = await fetch("http://localhost:3001/api/prices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const pricesData = await pricesRes.json();

        if (!pricesRes.ok) {
          throw new Error(pricesData.message || "Помилка завантаження цін");
        }

        const priceMap = {};

        pricesData.forEach((item) => {
          priceMap[item.procedure_code] = item.price;
        });

        setPrices(priceMap);

        // -------------------------
        // Завантаження додаткових послуг
        // -------------------------

        const servicesRes = await fetch(
          "http://localhost:3001/api/prices/custom",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const servicesData = await servicesRes.json();

        if (!servicesRes.ok) {
          throw new Error(
            servicesData.message || "Помилка завантаження додаткових послуг",
          );
        }

        setCustomServices(servicesData);
      } catch (err) {
        console.error("LOAD PRICES/SERVICES ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePriceChange = (code, value) => {
    setPrices((prev) => ({
      ...prev,
      [code]: value,
    }));

    setSaved((prev) => ({
      ...prev,
      [code]: false,
    }));
  };

  const savePrice = async (procedure) => {
    try {
      setSaving(procedure.value);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3001/api/prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          procedure_code: procedure.value,
          procedure_name: procedure.label,
          price: Number(prices[procedure.value]) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Помилка збереження");
      }

      console.log("PRICE SAVED:", data);
      setSaved((prev) => ({
        ...prev,
        [procedure.value]: true,
      }));
    } catch (err) {
      console.error("SAVE PRICE ERROR:", err);
    } finally {
      setSaving(null);
    }
  };
  const saveCustomService = async () => {
    if (!newServiceName.trim()) {
      alert("Введіть назву послуги");
      return;
    }

    try {
      setSavingService(true);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3001/api/prices/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newServiceName,
          price: Number(newServicePrice) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Помилка збереження послуги");
      }

      setCustomServices((prev) => [...prev, data.service]);

      setNewServiceName("");
      setNewServicePrice("");
    } catch (err) {
      console.error("SAVE CUSTOM SERVICE ERROR:", err);
      alert(err.message);
    } finally {
      setSavingService(false);
    }
  };
  const deleteCustomService = async (id) => {
    if (!window.confirm("Видалити цю послугу?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:3001/api/prices/custom/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Помилка видалення послуги");
      }

      setCustomServices((prev) => prev.filter((service) => service.id !== id));
    } catch (err) {
      console.error("DELETE CUSTOM SERVICE ERROR:", err);
      alert(err.message);
    }
  };
  if (loading) {
    return <div className={css.page}>Завантаження...</div>;
  }

  return (
    <div className={css.page}>
      <button className={css.homeButton} onClick={() => navigate("/")}>
        Головна
      </button>
      <h1>Ціни на процедури</h1>

      <table className={css.table}>
        <thead>
          <tr>
            <th>Процедура</th>
            <th>Ціна, грн</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {procedureOptions.map((procedure) => (
            <tr key={procedure.value}>
              <td>{procedure.label}</td>

              <td>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={prices[procedure.value] ?? ""}
                  onChange={(e) =>
                    handlePriceChange(procedure.value, e.target.value)
                  }
                />
              </td>

              <td>
                <button
                  onClick={() => savePrice(procedure)}
                  disabled={
                    saving === procedure.value || saved[procedure.value]
                  }
                >
                  {saving === procedure.value
                    ? "Збереження..."
                    : saved[procedure.value]
                      ? "✓ Збережено"
                      : "💾 Зберегти"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={css.customServices}>
        <h2>Додаткові послуги</h2>

        <table className={css.table}>
          <thead>
            <tr>
              <th>Назва послуги</th>
              <th>Ціна, грн</th>
              <th>Дія</th>
            </tr>
          </thead>

          <tbody>
            {customServices.map((service) => (
              <tr key={service.id}>
                <td>{service.name}</td>

                <td>{service.price}</td>

                <td>
                  <button onClick={() => deleteCustomService(service.id)}>
                    Видалити
                  </button>
                </td>
              </tr>
            ))}

            <tr>
              <td>
                <input
                  type="text"
                  placeholder="Назва послуги"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
              </td>

              <td>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ціна"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                />
              </td>

              <td>
                <button onClick={saveCustomService} disabled={savingService}>
                  {savingService ? "Збереження..." : "Додати"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PricesPage;
