import css from "./SummaryControls.module.css";

export default function SummaryControls({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) {
  const handlePrint = () => {
    if (!startDate || !endDate) {
      alert("Виберіть обидві дати!");
      return;
    }

    window.print();
  };

  return (
    <div className={`${css.controls} ${css.noPrint}`}>
      <label>Дата від:</label>

      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <label>Дата до:</label>

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <button onClick={handlePrint}>Друк</button>
    </div>
  );
}
