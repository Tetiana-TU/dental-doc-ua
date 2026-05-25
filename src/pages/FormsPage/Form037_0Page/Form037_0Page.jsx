import React, { useEffect } from "react";
import css from "./Form037_0Page.module.css";
import Controls from "../../../components/Controls/Controls";
import FormHeader from "../../../components/FormHeader/FormHeader";
import TitleBlock from "../../../components/TitleBlock/TitleBlock";
import MedTable from "../../../components/MedTable/MedTable";

function Form037() {
  useEffect(() => {
    document.title = "Форма №037/0";
  }, []);

  // localStorage.setItem("dailyData", JSON.stringify([]));
  const printPage = () => {
    window.print();
  };

  return (
    <div className={css.pageWrapper}>
      <FormHeader />
      <TitleBlock />
      <MedTable />
      <Controls onPrint={printPage} />
    </div>
  );
}
export default Form037;
