import css from "./TitleBlock.module.css";

export default function TitleBlock() {
  return (
    <div className={css.zagolovok}>
      <h2 className={css.title}>Листок</h2>

      <p className={css.subtitle}>
        щоденного обліку роботи лікаря-стоматолога (стоматологічної поліклініки,
        відділення, кабінету)
      </p>
    </div>
  );
}
