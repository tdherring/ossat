import React, { useContext } from "react";
import CPUModule from "./body/simulator/cpu/CPUModule";
import MemoryModule from "./body/simulator/memory/MemoryModule";
import AssessmentLandingPage from "./body/assessment/landing/AssessmentLandingPage";
import OrganisationLandingPage from "./body/organisation/landing/OrganisationLandingPage";
import QuizModule from "./body/assessment/quiz/QuizModule";
import { PageContext } from "../contexts/PageContext";
import { BrowserRouter as BrowserRouter, Routes, Route } from "react-router-dom";
import ActivateAccount from "./body/account/ActivateAccount";
import PasswordReset from "./body/account/PasswordReset";
import { MemoryManagerProvider } from "../contexts/MemoryManagerContext";
import { CPUSimulatorProvider } from "../contexts/CPUSimulatorContext";

const Body = () => {
  const [activePage, setActivePage] = useContext(PageContext);

  return (
    <div className="section" id="page-body">
      <BrowserRouter>
        <Routes>
          <Route path="/activate" render={() => setActivePage("activate")} />
          <Route path="/password-reset" render={() => setActivePage("passwordReset")} />
        </Routes>
      </BrowserRouter>
      <div className="tile is-ancestor">
        {activePage === "home" && (
          <>
            <MemoryManagerProvider>
              <MemoryModule />
            </MemoryManagerProvider>
            <CPUSimulatorProvider>
              <CPUModule />
            </CPUSimulatorProvider>
          </>
        )}
        {activePage === "assessmentLanding" && <AssessmentLandingPage />}
        {activePage === "organisationLanding" && <OrganisationLandingPage />}
        {activePage === "quiz" && <QuizModule />}
        {activePage === "activate" && <ActivateAccount token={window.location.pathname.split("/").pop()} />}
        {activePage === "passwordReset" && <PasswordReset token={window.location.pathname.split("/").pop()} />}
      </div>
    </div>
  );
};

export default Body;
