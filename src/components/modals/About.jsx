import React, { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import fullLogo from "../../assets/images/full-logo.svg";

const About = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  return (
    <div className={`modal p-3 ${activeModal === "about" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">About</p>
          <button
            className="delete"
            onClick={(event) => {
              event.preventDefault();
              setActiveModal(null);
            }}
          />
        </header>
        <section className="modal-card-body">
          <div className="content">
            <div className="container">
              <img className="p-3" src={fullLogo} alt="OSSAT Logo" style={{ maxHeight: "250px" }}></img>
              <p className="has-text-centered pt-5">
                A Final Year MSc Project by Tom Herring. Developed for <a href="https://kcl.ac.uk/">Kings College London</a> in 2021.
                <br />
                <br />
                For any queries, please contact me at <a href="mailto:thomas.herring@kcl.ac.uk">thomas.herring@kcl.ac.uk</a>.
              </p>
            </div>
          </div>
        </section>
        <footer className="modal-card-foot">
          <a
            className="button"
            href="/#"
            onClick={(event) => {
              event.preventDefault();
              setActiveModal(null);
            }}
          >
            Close
          </a>
        </footer>
      </div>
    </div>
  );
};

export default About;
