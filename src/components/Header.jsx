import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBug, faHome, faBook, faMicroscope } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import smallLogo from "../assets/images/small-logo.svg";
import Register from "./modals/Register";
import LogIn from "./modals/LogIn";
import BugReport from "./modals/BugReport";
import { ModalContext } from "../contexts/ModalContext";

const Header = () => {
  const [burgerActive, setBurgerActive] = useState(false);
  const [, setActiveModal] = useContext(ModalContext);

  return (
    <header>
      <nav className="navbar is-light" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="/#">
            <img src={smallLogo} alt="OSSAT Logo" style={{ height: "70px", maxHeight: "70px" }}></img>
          </a>
          {/* Burger menu. Small bit of logic to make active when pressed.*/}
          <a
            role="button"
            onClick={() => {
              setBurgerActive(!burgerActive);
            }}
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

        <div className="navbar-menu">
          <div className="navbar-start">
            <a className="navbar-item" href="/#">
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Home
            </a>
            <a className="navbar-item" href="/#">
              <FontAwesomeIcon icon={faBook} className="mr-2" />
              Assessment
            </a>
            <div className="navbar-item has-dropdown is-hoverable">
              <a className="navbar-link" href="/#">
                More
              </a>
              <div className="navbar-dropdown">
                <a className="navbar-item" href="/#">
                  <FontAwesomeIcon icon={faMicroscope} className="mr-2" />
                  About
                </a>
                <hr className="navbar-divider"></hr>
                <a
                  className="navbar-item"
                  href="/#"
                  onClick={() => {
                    setActiveModal("bugReport");
                  }}
                >
                  <FontAwesomeIcon icon={faBug} className="mr-2" />
                  Bug Report
                </a>
              </div>
            </div>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              <a href="https://github.com/tdherring/OSSAT-Frontend">
                <FontAwesomeIcon icon={faGithub} className="mr-2 is-size-4 has-text-black" />
              </a>
            </div>
            <div className="navbar-item">
              <div className="buttons">
                <a
                  className="button is-primary"
                  href="/#"
                  onClick={() => {
                    setActiveModal("register");
                  }}
                >
                  <strong>Register</strong>
                </a>

                <a
                  className="button is-light"
                  href="/#"
                  onClick={() => {
                    setActiveModal("logIn");
                  }}
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <LogIn />
      <Register />
      <BugReport />
    </header>
  );
};

export default Header;
