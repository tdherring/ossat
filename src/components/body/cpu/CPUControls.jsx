import React, { useContext, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faPlay, faStepBackward, faStepForward, faFastBackward, faFastForward, faPlus, faPause, faTimes } from "@fortawesome/free-solid-svg-icons";
import { CPUSimulatorContext } from "../../../contexts/CPUSimulatorContext";
import { ResizeContext } from "../../../contexts/ResizeContext";
import { ModalContext } from "../../../contexts/ModalContext";
import AddProcess from "../../modals/AddProcess";
import FCFS from "../../../simulator/cpu/non_preemptive/fcfs.mjs";
import SJF from "../../../simulator/cpu/non_preemptive/sjf.mjs";
import Priority from "../../../simulator/cpu/non_preemptive/priority.mjs";
import RR from "../../../simulator/cpu/preemptive/rr.mjs";
import SRTF from "../../../simulator/cpu/preemptive/srtf.mjs";

const CPUControls = () => {
  const [, setActiveModal] = useContext(ModalContext);
  const [activeCPUScheduler, setActiveCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [simulationSpeed, setSimulationSpeed] = useContext(CPUSimulatorContext).speed;
  const [widthValue] = useContext(ResizeContext).width;
  const [running, setRunning] = useContext(CPUSimulatorContext).running;
  const [timeDelta, setTimeDelta] = useContext(CPUSimulatorContext).time;
  const [jobQueue] = useContext(CPUSimulatorContext).jQueue;

  const Scheduler = { FCFS: new FCFS(), SJF: new SJF(), Priority: new Priority(), RR: new RR(2), SRTF: new SRTF() };

  const [activeSchedulerName, setActiveSchedulerName] = useState("First Come First Served (FCFS)");

  const dropdownOptions = [
    {
      label: "First Come First Served (FCFS)",
      value: "FCFS",
    },
    {
      label: "Shortest Job First (SJF)",
      value: "SJF",
    },
    {
      label: "Priority",
      value: "Priority",
    },
    {
      label: "Round Robin (RR)",
      value: "RR",
    },
    {
      label: "Shortest Remaining Time First (SRTF)",
      value: "SRTF",
    },
  ];

  let schedule = activeCPUScheduler.getSchedule();

  const [autoScheduling, setAutoScheduling] = useState(false);
  const [intervalVal, setIntervalVal] = useState(null);

  // Stop the auto scheduler from overflowing the schedule boundaries.
  useEffect(() => {
    if (schedule.length > 0 && timeDelta >= schedule[schedule.length - 1].timeDelta + schedule[schedule.length - 1].burstTime) {
      setAutoScheduling(false);
      clearInterval(intervalVal);
    }
    if (!autoScheduling) clearInterval(intervalVal);
  }, [timeDelta, intervalVal]);

  return (
    <div className={`field is-grouped is-grouped-multiline ${widthValue < 1127 && "is-grouped-centered"}`}>
      <span className="control">
        <div className="dropdown is-hoverable">
          <div className="dropdown-trigger">
            <button className="button" aria-haspopup="true" aria-controls="dropdown-menu" style={{ width: "20rem" }}>
              <span>{activeSchedulerName}</span>
              <FontAwesomeIcon icon={faAngleDown} className="ml-2" />
            </button>
          </div>

          <div className="dropdown-menu" id="dropdown-menu" role="menu">
            <div className="dropdown-content" value="FCFS">
              {dropdownOptions.map((option) => (
                <a
                  key={option.value}
                  href="/#"
                  className="dropdown-item"
                  value={option.value}
                  onClick={() => {
                    setActiveSchedulerName(option.label);
                    setActiveCPUScheduler(Scheduler[option.value]);
                  }}
                >
                  {option.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </span>
      <span className="control mb-0">
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

        <FontAwesomeIcon className="ml-2 my-3" icon={faTimes} />
      </span>
      <span className="control buttons is-grouped has-addons">
        <button
          className="button is-primary"
          href="/#"
          onClick={() => {
            setTimeDelta(0);
            setAutoScheduling(false);
          }}
        >
          <FontAwesomeIcon icon={faFastBackward} />
        </button>
        <button
          className="button is-primary"
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
          className="button is-primary"
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
          className="button is-primary"
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
          className="button is-primary"
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
          <button
            className="button is-primary"
            href="/#"
            onClick={() => {
              setActiveModal("addProcess");
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Process
          </button>
        </span>
      </span>
      <AddProcess />
    </div>
  );
};

export default CPUControls;
