import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faPlay, faBackward, faForward, faPlus } from "@fortawesome/free-solid-svg-icons";
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
  const { active, speed } = useContext(CPUSimulatorContext);
  const { width } = useContext(ResizeContext);
  const [activeModal, setActiveModal] = useContext(ModalContext);

  const [activeCPUScheduler, setActiveCPUScheduler] = active;
  const [, setSimulationSpeed] = speed;
  const [widthValue] = width;

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

  return (
    <div className={`field is-grouped is-grouped-multiline ${widthValue < 1024 && "is-grouped-centered"}`}>
      <span className="control">
        <div className="dropdown is-hoverable">
          <div className="dropdown-trigger">
            <button className="button" aria-haspopup="true" aria-controls="dropdown-menu">
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
        <span className="field is-grouped">
          <button className="button is-primary mr-2" href="/#">
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <button
            className="button is-primary mr-2"
            href="/#"
            onClick={() => {
              activeCPUScheduler.dispatchProcesses(true);
            }}
          >
            <FontAwesomeIcon icon={faPlay} />
          </button>
          <button className="button is-primary mr-2" href="/#">
            <FontAwesomeIcon icon={faForward} />
          </button>
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
