import React, { useContext, useState } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { CPUSimulatorContext } from "../../contexts/CPUSimulatorContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const AddProcess = ({ isPriorityProcess }) => {
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [jobQueue, setJobQueue] = useContext(CPUSimulatorContext).jQueue;

  const [activeModal, setActiveModal] = useContext(ModalContext);

  // State for processes
  const [processName, setProcessName] = useState("");
  const [arrivalTime, setArrivalTime] = useState(0);
  const [burstTime, setBurstTime] = useState(1);
  const [priority, setPriority] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.

    activeCPUScheduler.createProcess(processName, arrivalTime, burstTime, priority);

    // Only add the process the the GUI if there isn't already one with the same name.
    if (!jobQueue.some((process) => process.name === processName)) setJobQueue(jobQueue.concat({ name: processName, arrivalTime: arrivalTime, burstTime: burstTime, priority: priority }));
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
                  <input className="input is-danger" type="text" onChange={(event) => setProcessName(event.target.value)} />
                </div>
                <p className="help is-danger">This field is required</p>
              </div>
              <div className="field">
                <label className="label">Arrival Time</label>
                <div className="control">
                  <input className="input" type="number" defaultValue="0" min="0" onChange={(event) => setArrivalTime(parseInt(event.target.value))} />
                </div>
              </div>
              <div className="field">
                <label className="label">Burst Time</label>
                <div className="control">
                  <input className="input" type="number" defaultValue="1" min="0" onChange={(event) => setBurstTime(parseInt(event.target.value))} />
                </div>
              </div>
              {isPriorityProcess && (
                <div className="field">
                  <label className="label">Priority</label>
                  <div className="control">
                    <input className="input" type="number" defaultValue="0" min="0" onChange={(event) => setPriority(parseInt(event.target.value))} />
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
