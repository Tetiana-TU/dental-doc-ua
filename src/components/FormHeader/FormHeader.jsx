import React from "react";
import css from "./FormHeader.module.css";

export default function FormHeader() {
  return (
    <div className={css.formHeader}>
      <div className={css.left}>
        <div className={css.MOZ}>
          <p className={css.ministry}>
            Найменування міністерства, іншого органу виконавчої влади,
            підприємства, установи,
            <br />
            організації, до сфери управління якого належить заклад охорони
            здоров'я
            <br />
            Міністерство охорони здоров'я України
          </p>
        </div>

        <div>
          <p className={css.fop}>
            Найменування та місцезнаходження (повна поштова адреса) закладу, де
            заповнюється форма
            <br />
            ФОП Романюк О.М., м. Житомир, вул. Перемоги, буд. 99.
            <br />
            РНОКПП 2817906093
          </p>
        </div>
      </div>

      <div className={css.right}>
        <div className={css.doctop}>
          <h3>Медична документація</h3>
        </div>

        <div className={css.forma}>
          <p>
            Форма первинної облікової документації
            <br />
            №037/0
            <br />
          </p>

          <h3>Затверджено</h3>

          <p>
            Наказ МОЗ України
            <br />
            від 14.02.2012р №110
          </p>
        </div>
      </div>
    </div>
  );
}
