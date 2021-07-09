import React, { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { CPUSimulatorContext } from "../../contexts/CPUSimulatorContext";

const ConfirmSwitchCPU = ({ label, value }) => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [, setActiveCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [, setActiveSchedulerName] = useContext(CPUSimulatorContext).activeName;
  const [, setJobQueue] = useContext(CPUSimulatorContext).jQueue;
  const [, setTimeDelta] = useContext(CPUSimulatorContext).time;
  const Scheduler = useContext(CPUSimulatorContext).scheduler;

  return (
    <div className={`modal p-3 ${activeModal === "confirmSwitchCPU" ? "is-active" : ""}`}>
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
          <div className="content">Are you sure you want to switch CPU scheduling algorithms? The job queue, ready queue, and schedule will be cleared.</div>
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
              setTimeDelta(0);
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

export default ConfirmSwitchCPU;
