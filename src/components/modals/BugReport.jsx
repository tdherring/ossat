import React, { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";

const BugReport = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  return (
    <div className={`modal ${activeModal === "bugReport" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Bug Report</p>
          <button
            className="delete"
            onClick={() => {
              setActiveModal(null);
            }}
          />
        </header>
        <section className="modal-card-body">
          <div className="content"></div>
        </section>
        <footer className="modal-card-foot">
          <a
            className="button"
            href="/#"
            onClick={() => {
              setActiveModal(null);
            }}
          >
            Cancel
          </a>
        </footer>
      </div>
    </div>
  );
};

export default BugReport;
