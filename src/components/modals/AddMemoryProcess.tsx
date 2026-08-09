import { useContext, useEffect, useState, type FormEvent } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { MemoryManagerContext } from "../../contexts/MemoryManagerContext";
import { Plus } from "lucide-react";
import { getNextProcessName } from "../../lib/processName";

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

  useEffect(() => {
    if (activeModal === "addMemoryProcess") {
      setProcessName(getNextProcessName(jobQueue));
      setSubmissionAttempt(false);
    }
  }, [activeModal, jobQueue]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.

    if (
      !jobQueue.some((process) => process.name === processName) &&
      processName !== "" &&
      Number.isFinite(size)
    ) {
      activeManager.createProcess(processName, size);
      setRunning(!running);
      setSubmissionAttempt(false);
      setActiveModal(null);
      setProcessName("");
      setSize(100);
      event.currentTarget.reset();
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
              type="button"
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
                    className={`input ${submissionAttempt && (processName === "" || jobQueue.some((process) => process.name === processName)) ? "is-danger" : ""}`}
                    type="text"
                    value={processName}
                    autoFocus
                    onInput={(event) => setProcessName(event.currentTarget.value)}
                  />
                </div>
                {submissionAttempt && processName === "" ? (
                  <p className="help is-danger">This field is required</p>
                ) : null}
                {submissionAttempt && jobQueue.some((process) => process.name === processName) ? (
                  <p className="help is-danger">There is already a process with that name</p>
                ) : null}
              </div>
              <div className="field">
                <label className="label">Size</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    defaultValue="100"
                    min="10"
                    required
                    onInput={(event) => {
                      const nextSize = event.currentTarget.valueAsNumber;
                      if (Number.isFinite(nextSize)) setSize(nextSize);
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
          <footer className="modal-card-foot" style={{ gap: "10px" }}>
            <button type="submit" className="button is-primary">
              <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
              Add
            </button>
            <button
              type="button"
              className="button"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
              }}
            >
              Close
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddMemoryProcess;
