import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStepBackward, faStepForward, faFastBackward, faFastForward, faPlus, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { ResizeContext } from "../../../contexts/ResizeContext";
import { ModalContext } from "../../../contexts/ModalContext";
import { MemoryManagerContext } from "../../../contexts/MemoryManagerContext";
import AddMemoryBlock from "../../modals/AddMemoryBlock";
import AddMemoryProcess from "../../modals/AddMemoryProcess";

const MemoryControls = () => {
  const [widthValue] = useContext(ResizeContext).width;
  const [, setActiveModal] = useContext(ModalContext);
  const [jobQueue] = useContext(MemoryManagerContext).jQueue;
  const [activeManager, setActiveManager] = useContext(MemoryManagerContext).active;
  const [activeManagerName, setActiveManagerName] = useContext(MemoryManagerContext).activeName;
  const [allocated, setAllocated] = useContext(MemoryManagerContext).allocated;
  const Manager = useContext(MemoryManagerContext).manager;

  const dropdownOptions = [
    {
      label: "First Fit",
      value: "FF",
    },
    {
      label: "Best Fit",
      value: "BF",
    },
    {
      label: "Worst Fit",
      value: "WF",
    },
  ];

  return (
    <div className={`field is-grouped is-grouped-multiline ${widthValue < 2303 && "is-grouped-centered"}`}>
      <span className="control">
        <div className="dropdown is-hoverable">
          <div className="dropdown-trigger">
            <button className="button" aria-haspopup="true" aria-controls="dropdown-menu" style={{ width: "10rem" }}>
              <span>{activeManagerName}</span>
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
                    setActiveManagerName(option.label);
                    setActiveManager(Manager[option.value]);
                  }}
                >
                  {option.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </span>
      <span className="control buttons is-grouped has-addons">
        <button className="button is-primary" href="/#">
          <FontAwesomeIcon icon={faFastBackward} />
        </button>
        <button className="button is-primary" href="/#">
          <FontAwesomeIcon icon={faStepBackward} />
        </button>
        <button
          className="button is-primary"
          href="/#"
          onClick={() => {
            if (jobQueue.length > 0) {
              activeManager.allocateProcesses(true);
              setAllocated(activeManager.getAllocated());
            }
          }}
        >
          <FontAwesomeIcon icon={faPlay} />
        </button>
        <button className="button is-primary" href="/#" onClick={() => console.log(allocated)}>
          <FontAwesomeIcon icon={faStepForward} />
        </button>
        <button className="button is-primary" href="/#">
          <FontAwesomeIcon icon={faFastForward} />
        </button>
      </span>
      <span className="control buttons is-grouped has-addons">
        <button className="button is-primary" href="/#" onClick={() => setActiveModal("addMemoryBlock")}>
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Block
        </button>
        <button className="button is-primary" href="/#" onClick={() => setActiveModal("addMemoryProcess")}>
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Process
        </button>
      </span>
      <AddMemoryBlock />
      <AddMemoryProcess />
    </div>
  );
};

export default MemoryControls;
