import React, { useContext } from "react";
import CPUModule from "./body/simulator/cpu/CPUModule";
import MemoryModule from "./body/simulator/memory/MemoryModule";
import AssessmentLandingPage from "./body/assessment/landing/AssessmentLandingPage";
import QuizModule from "./body/assessment/quiz/QuizModule";
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
        {activePage === "assessmentLanding" && <AssessmentLandingPage />}
        {activePage === "quiz" && <QuizModule />}
      </div>
    </div>
  );
};

export default Body;
