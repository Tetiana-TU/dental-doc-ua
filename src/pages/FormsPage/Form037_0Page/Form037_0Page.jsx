import React, { useState, useEffect } from "react";
import css from "./Form037_0Page.module.css";
import Controls from "../../../components/Controls/Controls";
import FormHeader from "../../../components/FormHeader/FormHeader";
import TitleBlock from "../../../components/TitleBlock/TitleBlock";
import MedTable from "../../../components/MedTable/MedTable";
import { useNavigate } from "react-router-dom";
function Form037() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Форма №037/0";
  }, []);

  const printPage = () => {
    window.print();
  };

  return (
    <div className={css.pageWrapper}>
      <button className={css.homeButton} onClick={() => navigate("/")}>
        Головна
      </button>
      <FormHeader />
      <TitleBlock />
      <MedTable />
      <Controls onPrint={printPage} />
    </div>
  );
}
export default Form037;
