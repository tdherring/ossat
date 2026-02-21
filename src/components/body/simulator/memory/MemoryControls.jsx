import React, { useContext, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStepBackward, faStepForward, faFastBackward, faFastForward, faPlus, faTimes, faPause, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { ModalContext } from "../../../../contexts/ModalContext";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";
import AddMemoryBlock from "../../../modals/AddMemoryBlock";
import AddMemoryProcess from "../../../modals/AddMemoryProcess";
import ResetMemory from "../../../modals/ResetMemory";
import ConfirmSwitchMemory from "../../../modals/ConfirmSwitchMemory";

const MemoryControls = () => {
  const [, setActiveModal] = useContext(ModalContext);
  const [timeDelta, setTimeDelta] = useContext(MemoryManagerContext).time;
  const [simulationSpeed, setSimulationSpeed] = useContext(MemoryManagerContext).speed;
  const [jobQueue] = useContext(MemoryManagerContext).jQueue;
  const [activeManager, setActiveManager] = useContext(MemoryManagerContext).active;
  const [, setActiveManagerName] = useContext(MemoryManagerContext).activeName;
  const [blocks] = useContext(MemoryManagerContext).blocks;
  const [allocated, setAllocated] = useContext(MemoryManagerContext).allocated;
  const Manager = useContext(MemoryManagerContext).manager;

  const dropdownOptions = ["First Fit", "Best Fit", "Worst Fit"];

  const [autoAllocating, setAutoAllocating] = useState(false);
  const [intervalVal, setIntervalVal] = useState(null);

  const [possibleNewManagerName, setPossibleNewManagerName] = useState(null);
  const [possibleNewManager, setPossibleNewManager] = useState(null);

  // Stop the auto allocator from overflowing the allocation boundaries.
  useEffect(() => {
    if (Object.keys(allocated).length > 0 && timeDelta >= Object.keys(allocated).length) {
      setAutoAllocating(false);
      clearInterval(intervalVal);
    }
    if (!autoAllocating) clearInterval(intervalVal);
  }, [timeDelta, intervalVal]);

  return (
    <div>
      <div className="field is-grouped is-flex is-grouped-multiline is-grouped-centered mb-3">
        <div className="control is-expanded" style={{ minWidth: "15rem" }}>
          <div className="select is-fullwidth">
            <select
              onChange={(event) => {
                setAutoAllocating(false);

                if (blocks.length > 0 || jobQueue.length > 0) {
                  setPossibleNewManagerName(event.target.value);
                  setPossibleNewManager(event.target.value);
                  setActiveModal("confirmSwitchMemory");
                } else {
                  setActiveManagerName(event.target.value);
                  setActiveManager(Manager[event.target.value]);
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
        {jobQueue.length > 0 || blocks.length > 0 ? (
          <div className="control ml-1">
            <button
              className="button is-danger mb-0 px-3"
              style={{ height: "40px" }}
              href="/#"
              onClick={() => {
                setActiveModal("resetMemory");
                setAutoAllocating(false);
              }}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              Reset
            </button>
          </div>
        ) : null}
      </div>
      <div className="field is-grouped is-flex is-grouped-multiline is-grouped-centered mb-5">
        <span className="control buttons is-grouped has-addons mb-0">
          <button
            style={{ height: "40px" }} className="button is-primary mb-0 px-3 has-tooltip-arrow has-tooltip-bottom"
            data-tooltip="Jump to Start"
            href="/#"
            onClick={() => {
              setTimeDelta(0);
              setAutoAllocating(false);
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
                setAutoAllocating(false);
              }
            }}
          >
            <FontAwesomeIcon icon={faStepBackward} />
          </button>
          <button
            style={{ height: "40px" }} className="button is-primary mb-0 px-3 has-tooltip-arrow has-tooltip-bottom"
            data-tooltip={autoAllocating ? "Pause" : "Play"}
            href="/#"
            onClick={() => {
              if (jobQueue.length > 0 && blocks.length > 0) {
                activeManager.allocateProcesses(true);
                setAllocated(activeManager.getAllocated());

                if (Object.keys(activeManager.getAllocated()).length > 0) setAutoAllocating(!autoAllocating);
                // Ensure the pause happens immediately.
                if (autoAllocating) clearInterval(intervalVal);
                // Every 1000 / simulation speed seconds, automatically increment the time delta.
                if (!autoAllocating && timeDelta < Object.keys(activeManager.getAllocated()).length) {
                  setIntervalVal(
                    setInterval(() => {
                      setTimeDelta((timeDelta) => timeDelta + 1);
                    }, 1000 / simulationSpeed)
                  );
                } else {
                  setAutoAllocating(false);
                }
              }
            }}
          >
            <FontAwesomeIcon icon={autoAllocating ? faPause : faPlay} />
          </button>
          <button
            style={{ height: "40px" }} className="button is-primary mb-0 px-3 has-tooltip-arrow has-tooltip-bottom"
            data-tooltip="Step Forward"
            href="/#"
            onClick={() => {
              if (timeDelta < Object.keys(allocated).length) {
                setTimeDelta(timeDelta + 1);
                setAutoAllocating(false);
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
              setTimeDelta(Object.keys(allocated).length);
              setAutoAllocating(false);
            }}
          >
            <FontAwesomeIcon icon={faFastForward} />
          </button>
        </span>

        <AddMemoryBlock />
        <AddMemoryProcess />
        <ResetMemory />
        <ConfirmSwitchMemory label={possibleNewManagerName} value={possibleNewManager} />
      </div>
    </div>
  );
};

export default MemoryControls;
