import React, { useContext, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStepBackward, faStepForward, faFastBackward, faFastForward, faPlus, faPause, faTimes, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";
import { ResizeContext } from "../../../../contexts/ResizeContext";
import { ModalContext } from "../../../../contexts/ModalContext";
import AddCPUProcess from "../../../modals/AddCPUProcess";
import ConfirmSwitchCPU from "../../../modals/ConfirmSwitchCPU";
import ResetCPU from "../../../modals/ResetCPU";

const CPUControls = () => {
  const [, setActiveModal] = useContext(ModalContext);
  const [activeCPUScheduler, setActiveCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [activeSchedulerName, setActiveSchedulerName] = useContext(CPUSimulatorContext).activeName;
  const [simulationSpeed, setSimulationSpeed] = useContext(CPUSimulatorContext).speed;
  const [widthValue] = useContext(ResizeContext).width;
  const [running, setRunning] = useContext(CPUSimulatorContext).running;
  const [timeDelta, setTimeDelta] = useContext(CPUSimulatorContext).time;
  const [jobQueue, setJobQueue] = useContext(CPUSimulatorContext).jQueue;
  const Scheduler = useContext(CPUSimulatorContext).scheduler;

  const dropdownOptions = ["FCFS", "SJF", "Priority", "RR", "SRTF"];

  const [autoScheduling, setAutoScheduling] = useState(false);
  const [intervalVal, setIntervalVal] = useState(null);

  const [possibleNewSchedulerName, setPossibleNewSchedulerName] = useState(null);
  const [possibleNewScheduler, setPossibleNewScheduler] = useState(null);

  let schedule = activeCPUScheduler.getSchedule();

  // Stop the auto scheduler from overflowing the schedule boundaries.
  useEffect(() => {
    if (schedule.length > 0 && timeDelta >= schedule[schedule.length - 1].timeDelta + schedule[schedule.length - 1].burstTime) {
      setAutoScheduling(false);
      clearInterval(intervalVal);
    }
    if (!autoScheduling) clearInterval(intervalVal);
  }, [timeDelta, intervalVal]);

  return (
    <div className="field is-grouped is-grouped-multiline is-grouped-centered">
      <span className="control">
        <div className="control is-expanded">
          <div className="select is-fullwidth">
            <select
              onChange={(event) => {
                setAutoScheduling(false);

                if (jobQueue.length > 0) {
                  setPossibleNewSchedulerName(event.target.value);
                  setPossibleNewScheduler(event.target.value);
                  setActiveModal("confirmSwitchCPU");
                } else {
                  setActiveSchedulerName(event.target.value);
                  setActiveCPUScheduler(Scheduler[event.target.value]);
                  setJobQueue([]);
                }
              }}
            >
              {dropdownOptions.map((option) => (
                <option key={option} href="/#" className="dropdown-item" value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </span>
      {activeSchedulerName === "RR" && (
        <span className="control mb-0">
          {" "}
          <input
            className="input"
            style={{ width: "4.5rem" }}
            type="number"
            defaultValue="2"
            min="1"
            onInput={(event) => {
              activeCPUScheduler.setTimeQuantum(event.target.valueAsNumber);
            }}
          />
        </span>
      )}
      <div className="field has-addons mr-3">
        <span className="control">
          <input
            className="input"
            style={{ width: "4.5rem" }}
            type="number"
            defaultValue="1"
            min="0.1"
            max="10"
            step="0.1"
            onChange={(event) => {
              setSimulationSpeed(event.target.valueAsNumber);
            }}
          />
        </span>
        <span className="control">
          <a href="/#" className="button is-static">
            <FontAwesomeIcon icon={faTimes} />
          </a>
        </span>
      </div>
      <span className="control buttons is-grouped has-addons">
        <button
          className="button is-primary mb-0"
          href="/#"
          onClick={() => {
            setTimeDelta(0);
            setAutoScheduling(false);
          }}
        >
          <FontAwesomeIcon icon={faFastBackward} />
        </button>
        <button
          className="button is-primary mb-0"
          href="/#"
          onClick={() => {
            if (timeDelta > 0) {
              setTimeDelta(timeDelta - 1);
              setAutoScheduling(false);
            }
          }}
        >
          <FontAwesomeIcon icon={faStepBackward} />
        </button>
        <button
          className="button is-primary mb-0"
          href="/#"
          onClick={() => {
            if (jobQueue.length > 0) {
              activeCPUScheduler.dispatchProcesses(true);
              setRunning(!running);

              if (schedule.length > 0) setAutoScheduling(!autoScheduling);
              // Ensure the pause happens immediately.
              if (autoScheduling) clearInterval(intervalVal);
              // Every 1000 / simulation speed seconds, automatically increment the time delta.
              if (!autoScheduling && timeDelta < schedule[schedule.length - 1].timeDelta + schedule[schedule.length - 1].burstTime) {
                setIntervalVal(
                  setInterval(() => {
                    setTimeDelta((timeDelta) => timeDelta + 1);
                  }, 1000 / simulationSpeed)
                );
              } else {
                setAutoScheduling(false);
              }
            }
          }}
        >
          <FontAwesomeIcon icon={autoScheduling ? faPause : faPlay} />
        </button>
        <button
          className="button is-primary mb-0"
          href="/#"
          onClick={() => {
            if (schedule.length > 0 && timeDelta < schedule[schedule.length - 1].timeDelta + schedule[schedule.length - 1].burstTime) {
              setTimeDelta(timeDelta + 1);
              setAutoScheduling(false);
            }
          }}
        >
          <FontAwesomeIcon icon={faStepForward} />
        </button>
        <button
          className="button is-primary mb-0"
          href="/#"
          onClick={() => {
            if (schedule.length > 0 && timeDelta < schedule[schedule.length - 1].timeDelta + schedule[schedule.length - 1].burstTime) {
              setTimeDelta(schedule[schedule.length - 1].timeDelta + schedule[schedule.length - 1].burstTime);
              setAutoScheduling(false);
            }
          }}
        >
          <FontAwesomeIcon icon={faFastForward} />
        </button>
      </span>
      <span className="control">
        <span className="field">
          <button className="button is-primary mb-0" href="/#" onClick={() => setActiveModal("addCPUProcess")} disabled={activeCPUScheduler.getAllReadyQueues().length > 0 ? true : false}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Process
          </button>
        </span>
      </span>
      {jobQueue.length > 0 && (
        <span className="control">
          <span className="field">
            <button
              className="button is-danger mb-0"
              href="/#"
              onClick={() => {
                setActiveModal("resetCPU");
                setAutoScheduling(false);
              }}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              Reset
            </button>
          </span>
        </span>
      )}
      {activeSchedulerName === "Priority" ? <AddCPUProcess isPriorityProcess /> : <AddCPUProcess />}
      <ConfirmSwitchCPU label={possibleNewSchedulerName} value={possibleNewScheduler} />
      <ResetCPU />
    </div>
  );
};

export default CPUControls;
