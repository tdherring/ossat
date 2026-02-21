import React, { useContext, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStepBackward, faStepForward, faFastBackward, faFastForward, faPause, faTimes, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";
import { ModalContext } from "../../../../contexts/ModalContext";
import AddCPUProcess from "../../../modals/AddCPUProcess";
import ConfirmSwitchCPU from "../../../modals/ConfirmSwitchCPU";
import ResetCPU from "../../../modals/ResetCPU";

const CPUControls = () => {
  const [, setActiveModal] = useContext(ModalContext);
  const [activeCPUScheduler, setActiveCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [activeSchedulerName, setActiveSchedulerName] = useContext(CPUSimulatorContext).activeName;
  const [simulationSpeed, setSimulationSpeed] = useContext(CPUSimulatorContext).speed;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeDelta, intervalVal]);

  return (
    <div>
      <div className="field is-grouped is-flex is-grouped-multiline is-grouped-centered mb-3">
        <div className="control is-expanded" style={{ minWidth: "15rem" }}>
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
        {activeSchedulerName === "RR" && (
          <div className="control">
            {" "}
            <input
              className="input"
              style={{ width: "5.5rem" }}
              type="number"
              defaultValue="2"
              min="1"
              onInput={(event) => {
                activeCPUScheduler.setTimeQuantum(event.target.valueAsNumber);
              }}
            />
          </div>
        )}
        <div className="control">
          <div className="field has-addons mb-0">
            <span className="control">
              <input
                className="input"
                style={{ width: "5.5rem" }}
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
              <span className="button is-static px-3" style={{ height: "40px" }}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </span>
          </div>
        </div>
        {jobQueue.length > 0 && (
          <div className="control ml-1">
            <button
              className="button is-danger mb-0 px-3"
              style={{ height: "40px" }}
              href="/#"
              onClick={() => {
                setActiveModal("resetCPU");
                setAutoScheduling(false);
              }}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              Reset
            </button>
          </div>
        )}
      </div>
      <div className="field is-grouped is-flex is-grouped-multiline is-grouped-centered mb-5">
        <span className="control buttons is-grouped has-addons mb-0">
          <button
            style={{ height: "40px" }} className="button is-primary mb-0 px-3 has-tooltip-arrow has-tooltip-bottom"
            data-tooltip="Jump to Start"
            href="/#"
            onClick={() => {
              setTimeDelta(0);
              setAutoScheduling(false);
            }}
          >
            <FontAwesomeIcon icon={faFastBackward} />
          </button>
          <button
            style={{ height: "40px" }} className="button is-primary mb-0 px-3 has-tooltip-arrow has-tooltip-bottom"
            data-tooltip="Step Backward"
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
            style={{ height: "40px" }} className="button is-primary mb-0 px-3 has-tooltip-arrow has-tooltip-bottom"
            data-tooltip={autoScheduling ? "Pause" : "Play"}
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
            style={{ height: "40px" }} className="button is-primary mb-0 px-3 has-tooltip-arrow has-tooltip-bottom"
            data-tooltip="Step Forward"
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
            style={{ height: "40px" }} className="button is-primary mb-0 px-3 has-tooltip-arrow has-tooltip-bottom"
            data-tooltip="Jump to End"
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

        {activeSchedulerName === "Priority" ? <AddCPUProcess isPriorityProcess /> : <AddCPUProcess />}
        <ConfirmSwitchCPU label={possibleNewSchedulerName} value={possibleNewScheduler} />
        <ResetCPU />
      </div>
    </div>
  );
};

export default CPUControls;
