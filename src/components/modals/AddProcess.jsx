import React, { useContext, useState } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { CPUSimulatorContext } from "../../contexts/CPUSimulatorContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const AddProcess = ({ isPriorityProcess }) => {
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [jobQueue, setJobQueue] = useContext(CPUSimulatorContext).jQueue;
  const [running, setRunning] = useContext(CPUSimulatorContext).running;

  const [activeModal, setActiveModal] = useContext(ModalContext);

  // State for processes.
  const [processName, setProcessName] = useState("");
  const [arrivalTime, setArrivalTime] = useState(0);
  const [burstTime, setBurstTime] = useState(1);
  const [priority, setPriority] = useState(0);

  // Track whether user has attempted to submit the add process form.
  const [submissionAttempt, setSubmissionAttempt] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.

    // Only add the process the the GUI if there isn't already one with the same name and the process name field isn't empty.
    if (!jobQueue.some((process) => process.name === processName) && processName !== "") {
      activeCPUScheduler.createProcess(processName, arrivalTime, burstTime, isPriorityProcess ? priority : null);
      // Flip this hook var to cause a rerender of the job and ready queues.
      setRunning(!running);
      setSubmissionAttempt(false);
      // Close the modal and reset all the input fields and the process attributes.
      setActiveModal(null);
      event.target.reset();
      setProcessName("");
      setArrivalTime(0);
      setBurstTime(1);
      setPriority(0);
    } else {
      setSubmissionAttempt(true);
    }

    setJobQueue(activeCPUScheduler.getJobQueue());
  };

  return (
    <div className={`modal p-3 ${activeModal === "addProcess" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <form onSubmit={handleSubmit}>
          <header className="modal-card-head">
            <p className="modal-card-title">Add Process</p>
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
                <label className="label">Arrival Time</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    defaultValue="0"
                    min="0"
                    onInput={(event) => {
                      setArrivalTime(parseInt(event.target.value));
                    }}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Burst Time</label>
                <div className="control">
                  <input className="input" type="number" defaultValue="1" min="0" onInput={(event) => setBurstTime(parseInt(event.target.value))} />
                </div>
              </div>
              {isPriorityProcess && (
                <div className="field">
                  <label className="label">Priority</label>
                  <div className="control">
                    <input className="input" type="number" defaultValue="0" min="0" onInput={(event) => setPriority(parseInt(event.target.value))} />
                  </div>
                </div>
              )}
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

export default AddProcess;
