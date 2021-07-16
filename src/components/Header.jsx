import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBug, faHome, faBook, faMicroscope, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import smallLogo from "../assets/images/small-logo.svg";
import fullLogo from "../assets/images/full-logo.svg";
import Register from "./modals/Register";
import LogIn from "./modals/LogIn";
import About from "./modals/About";
import BugReport from "./modals/BugReport";
import { ModalContext } from "../contexts/ModalContext";
import { PageContext } from "../contexts/PageContext";
import { UserContext } from "../contexts/UserContext";
import { useCookies } from "react-cookie";

const Header = () => {
  const [burgerActive, setBurgerActive] = useState(false);
  const [, setActiveModal] = useContext(ModalContext);
  const [activePage, setActivePage] = useContext(PageContext);
  const [loggedIn, setLoggedIn] = useContext(UserContext).loggedIn;
  const [username, setUsername] = useContext(UserContext).username;
  const [, setFirstName] = useContext(UserContext).firstName;
  const [, setLastName] = useContext(UserContext).lastName;
  const [, , removeCookie] = useCookies(["refreshToken"]);

  return (
    <header>
      <nav className="navbar is-light" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="/#">
            <img className="is-hidden-touch" src={smallLogo} alt="OSSAT Logo" style={{ height: "70px", maxHeight: "70px" }}></img>
            <img className="is-hidden-desktop" src={fullLogo} alt="OSSAT Logo" style={{ height: "70px", maxHeight: "70px" }}></img>
          </a>
          {/* Burger menu. Small bit of logic to make active when pressed.*/}
          <a
            role="button"
            onClick={() => setBurgerActive(!burgerActive)}
            className={`navbar-burger ${burgerActive ? "is-active" : ""}`}
            style={{ height: "auto" }}
            aria-label="menu"
            aria-expanded="false"
            data-target="navbarBasicExample"
            href="/#"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div className={`navbar-menu has-background-white-ter ${burgerActive ? "is-active" : ""}`}>
          <div className="navbar-start">
            <a
              className="navbar-item"
              href="/#"
              onClick={(event) => {
                setActivePage("home");
                event.target.blur();
              }}
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              {activePage === "home" ? <strong>Home</strong> : <>Home</>}
            </a>
            <a
              className="navbar-item"
              href="/#"
              onClick={(event) => {
                setActivePage("assessmentLanding");
                event.target.blur();
              }}
            >
              <FontAwesomeIcon icon={faBook} className="mr-2" />
              {activePage === "assessmentLanding" ? <strong>Assessment</strong> : <>Assessment</>}
            </a>
            <div className="navbar-item has-dropdown is-hoverable">
              <a className="navbar-link" href="/#">
                More
              </a>
              <div className="navbar-dropdown">
                <a className="navbar-item" href="/#" onClick={() => setActiveModal("about")}>
                  <FontAwesomeIcon icon={faMicroscope} className="mr-2" />
                  About
                </a>
                <a className="navbar-item" href="/#" onClick={() => setActiveModal("bugReport")}>
                  <FontAwesomeIcon icon={faBug} className="mr-2" />
                  Bug Report
                </a>
              </div>
            </div>
          </div>

          <div className="navbar-end">
            {!loggedIn ? (
              <div className="navbar-item">
                <div className="buttons">
                  <a className="button is-primary" href="/#" onClick={() => setActiveModal("register")}>
                    <strong>Register</strong>
                  </a>

                  <a className="button is-outlined" href="/#" onClick={() => setActiveModal("logIn")}>
                    Log in
                  </a>
                </div>
              </div>
            ) : (
              <div className="navbar-item has-dropdown is-hoverable">
                <a className="navbar-link" href="/#">
                  Welcome, {username}
                </a>
                <div className="navbar-dropdown">
                  <a className="navbar-item" href="/#">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    My Profile
                  </a>
                  <hr className="navbar-divider" />
                  <a
                    className="navbar-item"
                    href="/#"
                    onClick={() => {
                      setLoggedIn(false);
                      setFirstName(null);
                      setLastName(null);
                      setUsername(null);
                      removeCookie("refreshToken");
                      localStorage.removeItem("accessToken");
                    }}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Logout
                  </a>
                </div>
              </div>
            )}
            <div className="navbar-item is-hidden-touch">
              <a href="https://github.com/tdherring/OSSAT-Frontend">
                <FontAwesomeIcon icon={faGithub} className="mr-2 is-size-4 has-text-black" />
              </a>
            </div>
          </div>
        </div>
      </nav>
      <LogIn />
      <Register />
      <About />
      <BugReport />
    </header>
  );
};

export default Header;
