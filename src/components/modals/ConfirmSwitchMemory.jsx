import React, { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { MemoryManagerContext } from "../../contexts/MemoryManagerContext";

const ConfirmSwitchMemory = ({ label, value }) => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [, setActiveManager] = useContext(MemoryManagerContext).active;
  const [, setActiveManagerName] = useContext(MemoryManagerContext).activeName;
  const [, setJobQueue] = useContext(MemoryManagerContext).jQueue;
  const [, setBlocks] = useContext(MemoryManagerContext).blocks;
  const [, setAllocated] = useContext(MemoryManagerContext).allocated;
  const [, setTimeDelta] = useContext(MemoryManagerContext).time;
  const Manager = useContext(MemoryManagerContext).manager;

  return (
    <div className={`modal p-3 ${activeModal === "confirmSwitchMemory" ? "is-active" : ""}`}>
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
          <div className="content">Are you sure you want to switch memory management algorithms? The job queue and memory allocation will be cleared.</div>
        </section>
        <footer className="modal-card-foot">
          <a
            className="button is-primary"
            href="/#"
            onClick={(event) => {
              event.preventDefault();
              setActiveManagerName(label);
              setActiveManager(Manager[value]);
              setJobQueue([]);
              setBlocks([]);
              setAllocated([]);
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

export default ConfirmSwitchMemory;
