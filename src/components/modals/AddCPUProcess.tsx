import { useContext, useEffect, useState, type FormEvent } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { CPUSimulatorContext } from "../../contexts/CPUSimulatorContext";
import { Plus } from "lucide-react";
import { getNextProcessName } from "../../lib/processName";

const AddCPUProcess = ({ isPriorityProcess = false }: { isPriorityProcess?: boolean }) => {
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [jobQueue, setJobQueue] = useContext(CPUSimulatorContext).jQueue;
  const [running, setRunning] = useContext(CPUSimulatorContext).running;

  const [activeModal, setActiveModal] = useContext(ModalContext);

  // State for processes.
  const [processName, setProcessName] = useState("");
  const [arrivalTime, setArrivalTime] = useState("0");
  const [burstTime, setBurstTime] = useState("1");
  const [priority, setPriority] = useState("0");

  // Track whether user has attempted to submit the add process form.
  const [submissionAttempt, setSubmissionAttempt] = useState(false);

  useEffect(() => {
    if (activeModal === "addCPUProcess") {
      setProcessName(getNextProcessName(jobQueue));
      setArrivalTime("0");
      setBurstTime("1");
      setPriority("0");
      setSubmissionAttempt(false);
    }
    // Generate the name once per opening; queue updates must not overwrite user input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.
    const parsedArrivalTime = Number(arrivalTime);
    const parsedBurstTime = Number(burstTime);
    const parsedPriority = Number(priority);

    // Only add the process the the GUI if there isn't already one with the same name and the process name field isn't empty.
    if (
      !jobQueue.some((process) => process.name === processName) &&
      processName !== "" &&
      arrivalTime !== "" &&
      burstTime !== "" &&
      Number.isFinite(parsedArrivalTime) &&
      parsedArrivalTime >= 0 &&
      Number.isFinite(parsedBurstTime) &&
      parsedBurstTime >= 1 &&
      (!isPriorityProcess ||
        (priority !== "" && Number.isFinite(parsedPriority) && parsedPriority >= 0))
    ) {
      activeCPUScheduler.createProcess(
        processName,
        parsedArrivalTime,
        parsedBurstTime,
        isPriorityProcess ? parsedPriority : null,
      );
      // Flip this hook var to cause a rerender of the job and ready queues.
      setRunning(!running);
      setSubmissionAttempt(false);
      // Close the modal and reset all the input fields and the process attributes.
      setActiveModal(null);
      event.currentTarget.reset();
      setProcessName("");
      setArrivalTime("0");
      setBurstTime("1");
      setPriority("0");
    } else {
      setSubmissionAttempt(true);
    }

    setJobQueue(activeCPUScheduler.getJobQueue());
  };

  return (
    <div className={`modal p-3 ${activeModal === "addCPUProcess" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <form onSubmit={handleSubmit}>
          <header className="modal-card-head">
            <p className="modal-card-title">Add CPU Process</p>
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
                <label className="label" htmlFor="cpu-process-name">
                  Process Name
                </label>
                <div className="control">
                  <input
                    className={`input ${submissionAttempt && (processName === "" || jobQueue.some((process) => process.name === processName)) ? "is-danger" : null}`}
                    id="cpu-process-name"
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
                <label className="label" htmlFor="cpu-arrival-time">
                  Arrival Time
                </label>
                <div className="control">
                  <input
                    className="input"
                    id="cpu-arrival-time"
                    type="number"
                    value={arrivalTime}
                    min="0"
                    required
                    onChange={(event) => setArrivalTime(event.currentTarget.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label" htmlFor="cpu-burst-time">
                  Burst Time
                </label>
                <div className="control">
                  <input
                    className="input"
                    id="cpu-burst-time"
                    type="number"
                    value={burstTime}
                    min="1"
                    required
                    onChange={(event) => setBurstTime(event.currentTarget.value)}
                  />
                </div>
              </div>
              {isPriorityProcess && (
                <div className="field">
                  <label className="label" htmlFor="cpu-priority">
                    Priority
                  </label>
                  <div className="control">
                    <input
                      className="input"
                      id="cpu-priority"
                      type="number"
                      value={priority}
                      min="0"
                      required
                      onChange={(event) => setPriority(event.currentTarget.value)}
                    />
                  </div>
                </div>
              )}
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

export default AddCPUProcess;
