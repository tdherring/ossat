import React, { useContext } from "react";
import { CPUSimulatorContext } from "../../contexts/CPUSimulatorContext";
import { ModalContext } from "../../contexts/ModalContext";

const ResetCPU = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [, setJobQueue] = useContext(CPUSimulatorContext).jQueue;
  const [, setReadyQueue] = useContext(CPUSimulatorContext).rQueue;
  const [, setTimeDelta] = useContext(CPUSimulatorContext).time;

  return (
    <div className={`modal p-3 ${activeModal === "resetCPU" ? "is-active" : ""}`}>
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
          <div className="content">Are you sure you want to reset? The job queue, ready queue, and schedule will be cleared.</div>
        </section>
        <footer className="modal-card-foot">
          <a
            className="button is-primary"
            href="/#"
            onClick={(event) => {
              event.preventDefault();
              activeCPUScheduler.reset();
              setJobQueue([]);
              setReadyQueue([]);
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

export default ResetCPU;
