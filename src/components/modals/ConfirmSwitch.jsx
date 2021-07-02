import React, { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { CPUSimulatorContext } from "../../contexts/CPUSimulatorContext";

const ConfirmSwitch = ({ label, value }) => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [activeCPUScheduler, setActiveCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [activeSchedulerName, setActiveSchedulerName] = useContext(CPUSimulatorContext).activeName;
  const [jobQueue, setJobQueue] = useContext(CPUSimulatorContext).jQueue;
  const Scheduler = useContext(CPUSimulatorContext).scheduler;

  return (
    <div className={`modal p-3 ${activeModal === "confirmSwitch" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Are you sure?</p>
          <button
            className="delete"
            onClick={(event) => {
              event.preventDefault();
              setActiveModal(null);
            }}
          />
        </header>
        <section className="modal-card-body">
          <div className="content">Are you sure you want to switch scheduling algorithms? All current processes will be cleared.</div>
        </section>
        <footer className="modal-card-foot">
          <a
            className="button is-primary"
            href="/#"
            onClick={(event) => {
              event.preventDefault();
              setActiveSchedulerName(label);
              setActiveCPUScheduler(Scheduler[value]);
              setJobQueue([]);
              setActiveModal(null);
            }}
          >
            <strong>Yes</strong>
          </a>
          <a
            className="button"
            href="/#"
            onClick={(event) => {
              event.preventDefault();
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

export default ConfirmSwitch;
