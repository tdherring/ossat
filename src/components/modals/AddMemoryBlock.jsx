import React, { useContext, useState } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { MemoryManagerContext } from "../../contexts/MemoryManagerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const AddMemoryBlock = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [activeManager] = useContext(MemoryManagerContext).active;
  const [running, setRunning] = useContext(MemoryManagerContext).running;

  //State for block
  const [size, setSize] = useState(100);

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.

    activeManager.createBlock(size);
    setRunning(!running);
    setActiveModal(null);
    event.target.reset();
    setSize(100);
  };

  return (
    <div className={`modal p-3 ${activeModal === "addMemoryBlock" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <form onSubmit={handleSubmit}>
          <header className="modal-card-head">
            <p className="modal-card-title">Add Block</p>
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
              <div className="field">
                <label className="label">Block Size</label>
                <div className="control">
                  <input className="input" type="number" defaultValue="100" min="10" onInput={(event) => setSize(parseInt(event.target.value))} />
                </div>
              </div>
            </div>
          </section>
          <footer className="modal-card-foot">
            <button type="submit" className="button is-primary">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add
            </button>
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
        </form>
      </div>
    </div>
  );
};

export default AddMemoryBlock;
