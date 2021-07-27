import React, { useContext } from "react";
import CPUModule from "./body/simulator/cpu/CPUModule";
import MemoryModule from "./body/simulator/memory/MemoryModule";
import AssessmentLandingPage from "./body/assessment/landing/AssessmentLandingPage";
import QuizModule from "./body/assessment/quiz/QuizModule";
import { PageContext } from "../contexts/PageContext";
import { BrowserRouter as Router, Route } from "react-router-dom";
import ActivateAccount from "./body/account/ActivateAccount";
import PasswordReset from "./body/account/PasswordReset";

const Body = () => {
  const [activePage, setActivePage] = useContext(PageContext);

  return (
    <div className="section" id="page-body">
      <Router>
        <Route path="/activate" render={() => setActivePage("activate")} />
        <Route path="/password-reset" render={() => setActivePage("passwordReset")} />
      </Router>
      <div className="tile is-ancestor">
        {activePage === "home" && (
          <>
            <MemoryModule /> <CPUModule />
          </>
        )}
        {activePage === "assessmentLanding" && <AssessmentLandingPage />}
        {activePage === "quiz" && <QuizModule />}
        {activePage === "activate" && <ActivateAccount token={window.location.pathname.split("/").pop()} />}
        {activePage === "passwordReset" && <PasswordReset token={window.location.pathname.split("/").pop()} />}
      </div>
    </div>
  );
};

export default Body;
