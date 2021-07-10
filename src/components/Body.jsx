import React, { useContext } from "react";
import CPUModule from "./body/simulator/cpu/CPUModule";
import MemoryModule from "./body/simulator/memory/MemoryModule";
import AssessmentModule from "./body/assessment/AssessmentModule";
import { PageContext } from "../contexts/PageContext";

const Body = () => {
  const [activePage] = useContext(PageContext);

  return (
    <div className="section">
      <div className="tile is-ancestor">
        {activePage === "home" && (
          <>
            <MemoryModule /> <CPUModule />
          </>
        )}
        {activePage === "assessment" && <AssessmentModule />}
      </div>
    </div>
  );
};

export default Body;
