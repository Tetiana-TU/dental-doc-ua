import React from "react";
import css from "./Form037_0Page.module.css";
import Controls from "../../../components/Controls/Controls";
import FormHeader from "../../../components/FormHeader/FormHeader";
import TitleBlock from "../../../components/TitleBlock/TitleBlock";
import PeriodRow from "../../../components/PeriodRow/PeriodRow";
import MedTable from "../../../components/MedTable/MedTable";

function Form037() {
  const openSummary = () => {
    window.open("summary.html", "_blank");
  };

  const printPage = () => {
    window.print();
  };

  return (
    <div className={css.pageWrapper}>
      <FormHeader />
      <TitleBlock />
      <PeriodRow />
      <MedTable />
      <Controls onOpenSummary={openSummary} onPrint={printPage} />
    </div>
  );
}
export default Form037;
