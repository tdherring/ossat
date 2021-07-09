import React, { useContext } from "react";
import { MemoryManagerContext } from "../../contexts/MemoryManagerContext";
import { ModalContext } from "../../contexts/ModalContext";

const ResetMemory = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  const [activeManager] = useContext(MemoryManagerContext).active;
  const [, setJobQueue] = useContext(MemoryManagerContext).jQueue;
  const [, setBlocks] = useContext(MemoryManagerContext).blocks;
  const [, setAllocated] = useContext(MemoryManagerContext).allocated;
  const [, setTimeDelta] = useContext(MemoryManagerContext).time;

  return (
    <div className={`modal p-3 ${activeModal === "resetMemory" ? "is-active" : ""}`}>
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
          <div className="content">Are you sure you want to reset? The job queue and memory allocation will be cleared.</div>
        </section>
        <footer className="modal-card-foot">
          <a
            className="button is-primary"
            href="/#"
            onClick={(event) => {
              event.preventDefault();
              activeManager.reset();
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

export default ResetMemory;
