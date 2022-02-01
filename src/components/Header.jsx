import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBook, faMicroscope, faUser, faSignOutAlt, faKey, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import smallLogo from "../assets/images/small-logo.svg";
import fullLogo from "../assets/images/full-logo.svg";
import Register from "./modals/Register";
import LogIn from "./modals/LogIn";
import RequestPasswordReset from "./modals/RequestPasswordReset";
import About from "./modals/About";
import MyProfile from "./modals/MyProfile";
import ChangePassword from "./modals/ChangePassword";
import { ModalContext } from "../contexts/ModalContext";
import { PageContext } from "../contexts/PageContext";
import { UserContext } from "../contexts/UserContext";
import { useCookies } from "react-cookie";
import { useMutation, gql } from "@apollo/client";

const Header = () => {
  const [burgerActive, setBurgerActive] = useState(false);
  const [, setActiveModal] = useContext(ModalContext);
  const [activePage, setActivePage] = useContext(PageContext);
  const [, setLoggedIn] = useContext(UserContext).loggedIn;
  const [username, setUsername] = useContext(UserContext).username;
  const [, setFirstName] = useContext(UserContext).firstName;
  const [, setLastName] = useContext(UserContext).lastName;
  const [cookies, , removeCookie] = useCookies(["refreshToken"]);

  // GraphQL mutation to revoke token.
  const [revokeToken] = useMutation(gql`
    mutation RevokeToken($refreshToken: String!) {
      revokeToken(refreshToken: $refreshToken) {
        success
        errors
      }
    }
  `);

  useEffect(() => {
    setBurgerActive(false);
  }, [activePage]);

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
            {cookies["refreshToken"] && (
              <>
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

                <a
                  className="navbar-item"
                  href="/#"
                  onClick={(event) => {
                    setActivePage("organisationLanding");
                    event.target.blur();
                  }}
                >
                  <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                  {activePage === "organisationLanding" ? <strong>Organisations</strong> : <>Organisations</>}
                </a>
              </>
            )}
            <div className="navbar-item has-dropdown is-hoverable">
              <a className="navbar-link" href="/#">
                More
              </a>
              <div className="navbar-dropdown">
                <a className="navbar-item" href="/#" onClick={() => setActiveModal("about")}>
                  <FontAwesomeIcon icon={faMicroscope} className="mr-2" />
                  About
                </a>
              </div>
            </div>
          </div>

        </div>
      </nav>
      <LogIn />
      <Register />
      <About />
      <MyProfile />
      <ChangePassword />
      <RequestPasswordReset />
    </header>
  );
};

export default Header;
