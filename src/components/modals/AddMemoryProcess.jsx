import React, { useContext, useState } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { MemoryManagerContext } from "../../contexts/MemoryManagerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const AddMemoryProcess = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [activeManager] = useContext(MemoryManagerContext).active;
  const [jobQueue] = useContext(MemoryManagerContext).jQueue;
  const [running, setRunning] = useContext(MemoryManagerContext).running;

  //State for block
  const [processName, setProcessName] = useState("");
  const [size, setSize] = useState(100);

  // Track whether user has attempted to submit the add process form.
  const [submissionAttempt, setSubmissionAttempt] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.

    if (!jobQueue.some((process) => process.name === processName) && processName !== "") {
      activeManager.createProcess(processName, size);
      setRunning(!running);
      setSubmissionAttempt(false);
      setActiveModal(null);
      setProcessName("");
      setSize(100);
      event.target.reset();
    } else {
      setSubmissionAttempt(true);
    }
  };

  return (
    <div className={`modal p-3 ${activeModal === "addMemoryProcess" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <form onSubmit={handleSubmit}>
          <header className="modal-card-head">
            <p className="modal-card-title">Add Memory Process</p>
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
                <label className="label">Process Name</label>
                <div className="control">
                  <input
                    className={`input ${submissionAttempt && (processName === "" || jobQueue.some((process) => process.name === processName)) ? "is-danger" : null}`}
                    type="text"
                    onInput={(event) => setProcessName(event.target.value)}
                  />
                </div>
                {submissionAttempt && processName === "" ? <p className="help is-danger">This field is required</p> : null}
                {submissionAttempt && jobQueue.some((process) => process.name === processName) ? <p className="help is-danger">There is already a process with that name</p> : null}
              </div>
              <div className="field">
                <label className="label">Size</label>
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

export default AddMemoryProcess;
