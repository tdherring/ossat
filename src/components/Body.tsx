import { Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import { MemoryManagerProvider } from "../contexts/MemoryManagerContext";
import { CPUSimulatorProvider } from "../contexts/CPUSimulatorContext";
import { routes, simulatorPaths } from "../lib/routes";
import { UserContext } from "../contexts/UserContext";

const SimulationLandingPage = lazy(() => import("./body/simulator/SimulationLandingPage"));
const CPUModule = lazy(() => import("./body/simulator/cpu/CPUModule"));
const MemoryModule = lazy(() => import("./body/simulator/memory/MemoryModule"));
const VirtualMemoryModule = lazy(
  () => import("./body/simulator/virtual-memory/VirtualMemoryModule"),
);
const DiskSchedulingModule = lazy(() => import("./body/simulator/disk/DiskSchedulingModule"));
const AssessmentLandingPage = lazy(() => import("./body/assessment/landing/AssessmentLandingPage"));
const OrganisationLandingPage = lazy(
  () => import("./body/organisation/landing/OrganisationLandingPage"),
);
const QuizModule = lazy(() => import("./body/assessment/quiz/QuizModule"));
const ActivateAccount = lazy(() => import("./body/account/ActivateAccount"));
const PasswordReset = lazy(() => import("./body/account/PasswordReset"));

const RouteLoading = () => (
  <div className="col-span-12 py-16 text-center text-sm text-muted-foreground">Loading page…</div>
);

const Body = () => {
  const { pathname } = useLocation();
  const isSimulationWorkspace = simulatorPaths.has(pathname);
  const isOverview = pathname === routes.home;

  return (
    <main
      className={`section ${isSimulationWorkspace ? "simulation-workspace" : ""} ${isOverview ? "overview-page" : ""}`}
      id="page-body"
    >
      <MemoryManagerProvider>
        <CPUSimulatorProvider>
          <div
            className={`page-grid mx-auto min-h-0 w-full max-w-[1800px] gap-6 ${
              isOverview ? "grid lg:flex lg:flex-1 lg:self-stretch" : "grid h-full lg:grid-cols-12"
            }`}
          >
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route path={routes.home} element={<SimulationLandingPage />} />
                <Route path={routes.cpuSimulator} element={<CPUModule />} />
                <Route path={routes.memorySimulator} element={<MemoryModule />} />
                <Route path={routes.virtualMemorySimulator} element={<VirtualMemoryModule />} />
                <Route path={routes.diskSimulator} element={<DiskSchedulingModule />} />
                <Route element={<AuthenticatedRoute />}>
                  <Route path={routes.assessments} element={<AssessmentLandingPage />} />
                  <Route path={`${routes.assessments}/:assessmentId`} element={<QuizModule />} />
                  <Route path={routes.learningGroups} element={<OrganisationLandingPage />} />
                  <Route
                    path={`${routes.learningGroups}/assessments/:assessmentId`}
                    element={<QuizModule readOnly />}
                  />
                </Route>
                <Route path={`${routes.activate}/:token?`} element={<ActivateAccountRoute />} />
                <Route path={`${routes.passwordReset}/:token?`} element={<PasswordResetRoute />} />
                <Route path="*" element={<Navigate to={routes.home} replace />} />
              </Routes>
            </Suspense>
          </div>
        </CPUSimulatorProvider>
      </MemoryManagerProvider>
    </main>
  );
};

function AuthenticatedRoute() {
  const { sessionStatus } = useContext(UserContext);
  if (sessionStatus === "pending") return <RouteLoading />;
  return sessionStatus === "authenticated" ? <Outlet /> : <Navigate to={routes.home} replace />;
}

function ActivateAccountRoute() {
  const { token } = useParams<{ token: string }>();
  return <ActivateAccount token={token} />;
}

function PasswordResetRoute() {
  const { token } = useParams<{ token: string }>();
  return <PasswordReset token={token} />;
}

export default Body;
