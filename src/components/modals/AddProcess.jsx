import React, { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const BugReport = ({ priority }) => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  return (
    <div className={`modal ${activeModal === "addProcess" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Add Process</p>
          <button
            className="delete"
            onClick={() => {
              setActiveModal(null);
            }}
          />
        </header>
        <section className="modal-card-body">
          <div className="content">
            <form>
              <div className="field">
                <label className="label">Process Name</label>
                <div className="control">
                  <input className="input" type="text" />
                </div>
              </div>
              <div className="field">
                <label className="label">Arrival Time</label>
                <div className="control">
                  <input className="input" type="number" defaultValue="1" min="0" />
                </div>
              </div>
              <div className="field">
                <label className="label">Burst Time</label>
                <div className="control">
                  <input className="input" type="number" defaultValue="1" min="0" />
                </div>
              </div>
              {priority && (
                <div className="field">
                  <label className="label">Priority</label>
                  <div className="control">
                    <input className="input" type="number" defaultValue="1" min="0" />
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>
        <footer className="modal-card-foot">
          <button class="button is-primary">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add
          </button>
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
