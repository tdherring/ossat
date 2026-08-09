import { useState, useContext, useEffect } from "react";
import {
  BookOpen,
  Building2,
  Cpu,
  HardDrive,
  Grid2X2,
  KeyRound,
  LogOut,
  MemoryStick,
  Layers3,
  Menu,
  Monitor,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import { useCookies } from "react-cookie";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import fullLogo from "../assets/images/full-logo.svg";
import fullLogoDark from "../assets/images/full-logo-dark.svg";
import Register from "./modals/Register";
import LogIn from "./modals/LogIn";
import RequestPasswordReset from "./modals/RequestPasswordReset";
import About from "./modals/About";
import MyProfile from "./modals/MyProfile";
import ChangePassword from "./modals/ChangePassword";
import { ModalContext } from "../contexts/ModalContext";
import { UserContext } from "../contexts/UserContext";
import Button from "./ui/Button";
import { getInitialThemePreference, resolveTheme, type ThemePreference } from "../lib/theme";
import { isApiMode, isDemoMode } from "../lib/demoMode";
import { demoUser } from "../lib/demoData";
import type { MutationPayload } from "../types/api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routes } from "../lib/routes";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [, setActiveModal] = useContext(ModalContext);
  const { pathname } = useLocation();
  const routerNavigate = useNavigate();
  const [loggedIn, setLoggedIn] = useContext(UserContext).loggedIn;
  const [username, setUsername] = useContext(UserContext).username;
  const [, setFirstName] = useContext(UserContext).firstName;
  const [, setLastName] = useContext(UserContext).lastName;
  const [, setEmail] = useContext(UserContext).email;
  const [cookies, , removeCookie] = useCookies(["refreshToken"]);

  const [themePreference, setThemePreference] = useState(getInitialThemePreference);
  const [theme, setTheme] = useState(() => resolveTheme(getInitialThemePreference()));

  useEffect(() => {
    const colourScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolvedTheme = resolveTheme(themePreference, colourScheme.matches);
      setTheme(resolvedTheme);
      document.documentElement.dataset.theme = resolvedTheme;
    };

    localStorage.setItem("theme", themePreference);
    applyTheme();

    if (themePreference !== "auto") return;
    colourScheme.addEventListener("change", applyTheme);
    return () => colourScheme.removeEventListener("change", applyTheme);
  }, [themePreference]);

  const [revokeToken] = useMutation<{ revokeToken: MutationPayload }, { refreshToken: string }>(gql`
    mutation RevokeToken($refreshToken: String!) {
      revokeToken(refreshToken: $refreshToken) {
        success
        errors
      }
    }
  `);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const navigate = (path: string) => {
    routerNavigate(path);
    setMobileMenuOpen(false);
  };

  const signOut = () => {
    if (isDemoMode) {
      setLoggedIn(false);
      setFirstName(null);
      setLastName(null);
      setUsername(null);
      setEmail(null);
      routerNavigate(routes.home);
      return;
    }

    revokeToken({ variables: { refreshToken: cookies["refreshToken"] ?? "" } }).then((result) => {
      const payload = result.data?.revokeToken;
      if (!payload?.errors) {
        setLoggedIn(false);
        setFirstName(null);
        setLastName(null);
        setUsername(null);
        removeCookie("refreshToken");
        localStorage.removeItem("accessToken");
        routerNavigate(routes.home);
      } else {
        console.warn(
          "An error was encountered when attempting to end the user's session!",
          payload.errors,
        );
      }
    });
  };

  const enterDemo = () => {
    setLoggedIn(true);
    setFirstName(demoUser.firstName);
    setLastName(demoUser.lastName);
    setUsername(demoUser.username);
    setEmail(demoUser.email);
    routerNavigate(routes.home);
  };

  const navigationItems = [
    { path: routes.home, label: "Overview", icon: Grid2X2 },
    { path: routes.cpuSimulator, label: "CPU scheduling", icon: Cpu },
    { path: routes.memorySimulator, label: "Memory allocation", icon: MemoryStick },
    { path: routes.virtualMemorySimulator, label: "Virtual memory", icon: Layers3 },
    { path: routes.diskSimulator, label: "Disk scheduling", icon: HardDrive },
    ...(loggedIn
      ? [
          { path: routes.assessments, label: "Assessments", icon: BookOpen },
          { path: routes.learningGroups, label: "Learning groups", icon: Building2 },
        ]
      : []),
  ];

  const renderNavigation = () => (
    <>
      {navigationItems.map(({ path, label, icon: Icon }) => {
        const isActive =
          pathname === path || (path !== routes.home && pathname.startsWith(`${path}/`));

        return (
          <button
            key={path}
            type="button"
            className={`group flex w-full items-center gap-3 rounded-[3px] border px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
              isActive
                ? "border-transparent bg-muted text-foreground"
                : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
            onClick={() => navigate(path)}
          >
            <Icon
              className={`h-[18px] w-[18px] ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
              strokeWidth={1.75}
            />
            {label}
          </button>
        );
      })}
    </>
  );

  const themeControl = (expanded = false) => {
    const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

    if (expanded) {
      const options: { value: ThemePreference; label: string; icon: typeof Monitor }[] = [
        { value: "auto", label: "Auto", icon: Monitor },
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
      ];

      return (
        <div
          className="grid w-full grid-cols-3 rounded-[3px] border p-0.5"
          aria-label="Colour theme"
        >
          {options.map(({ value, label: optionLabel, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`inline-flex h-9 items-center justify-center rounded-[2px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                themePreference === value
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              onClick={() => setThemePreference(value)}
              aria-label={`Use ${optionLabel.toLowerCase()} theme`}
              aria-pressed={themePreference === value}
              title={optionLabel}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </button>
          ))}
        </div>
      );
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => setThemePreference(theme === "dark" ? "light" : "dark")}
        aria-label={label}
        title={label}
      >
        {theme === "dark" ? (
          <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
        ) : (
          <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        )}
      </Button>
    );
  };

  const accountControls = (mobile = false) => (
    <div className="relative grid gap-2">
      {!loggedIn ? (
        <div className="grid gap-2">
          {isDemoMode ? (
            <Button variant="outline" className="w-full gap-3" onClick={enterDemo}>
              <User className="h-[18px] w-[18px]" strokeWidth={1.75} /> Enter demo
            </Button>
          ) : isApiMode ? (
            <div className="flex items-center gap-2">
              <Button className="min-w-0 flex-1 px-2" onClick={() => setActiveModal("register")}>
                Register
              </Button>
              <Button
                variant="outline"
                className="min-w-0 flex-1 px-2"
                onClick={() => setActiveModal("logIn")}
              >
                Log in
              </Button>
            </div>
          ) : null}
          {themeControl(true)}
        </div>
      ) : isDemoMode ? (
        <>
          <div className="flex items-center gap-3 border px-3 py-2.5 text-sm">
            <span className="inline-flex h-6 w-6 items-center justify-center border-l-2 border-primary bg-primary/10 text-xs text-primary">
              D
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-xs">{username || "Demo teacher"}</strong>
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                Demo data
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={signOut}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Button>
          </div>
          {themeControl(true)}
        </>
      ) : (
        <>
          <div className="flex items-center border pr-1">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              onClick={() => setAccountOpen(!accountOpen)}
              aria-expanded={accountOpen}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center border-l-2 border-primary bg-primary/10 text-xs text-primary">
                {username?.slice(0, 1).toUpperCase()}
              </span>
              <span className="truncate">{username || "Account"}</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={signOut}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Button>
          </div>
          {themeControl(true)}
          {accountOpen && (
            <div
              className={`${mobile ? "" : "absolute bottom-full mb-2"} grid w-full gap-1 border bg-popover p-1.5 text-popover-foreground shadow-xl`}
            >
              <button
                className="flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => setActiveModal("myProfile")}
              >
                <User className="h-4 w-4" /> My Profile
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => setActiveModal("changePassword")}
              >
                <KeyRound className="h-4 w-4" /> Change Password
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-[13.5rem] flex-col border-r bg-sidebar lg:flex"
        aria-label="Primary navigation"
      >
        <Link
          className="flex h-28 items-start px-5 pt-[38px]"
          to={routes.home}
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            className="w-44 max-w-full"
            src={theme === "dark" ? fullLogoDark : fullLogo}
            alt="OSSAT"
          />
        </Link>
        <nav className="space-y-1 px-3">{renderNavigation()}</nav>
        <div className="mt-auto p-3">{accountControls()}</div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-sidebar px-4 lg:hidden">
        <Link to={routes.home} onClick={() => setMobileMenuOpen(false)} aria-label="OSSAT home">
          <img
            className="h-10 w-auto"
            src={theme === "dark" ? fullLogoDark : fullLogo}
            alt="OSSAT"
          />
        </Link>
        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-16 border-b bg-sidebar p-3 shadow-xl">
            <nav className="space-y-1">{renderNavigation()}</nav>
            <div className="mt-3 border-t pt-3">{accountControls(true)}</div>
          </div>
        )}
      </header>

      <About />
      {isApiMode && (
        <>
          <LogIn />
          <Register />
          <MyProfile />
          <ChangePassword />
          <RequestPasswordReset />
        </>
      )}
    </>
  );
};

export default Header;
