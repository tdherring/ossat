import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faPlay, faBackward, faForward, faPlus } from "@fortawesome/free-solid-svg-icons";

const CPUControls = () => {
  return (
    <nav className="level">
      <div className="level-left">
        <div className="level-item">
          <div className="dropdown is-hoverable">
            <div className="dropdown-trigger">
              <button className="button" aria-haspopup="true" aria-controls="dropdown-menu">
                <span>Scheduling Algorithm</span>
                <FontAwesomeIcon icon={faAngleDown} className="ml-2" />
              </button>
            </div>

            <div className="dropdown-menu" id="dropdown-menu" role="menu">
              <div className="dropdown-content">
                <a href="#" className="dropdown-item">
                  First Come First Served (FCFS)
                </a>
                <a href="#" className="dropdown-item">
                  Shortest Job First (SJF)
                </a>
                <a href="#" className="dropdown-item">
                  Priority
                </a>
                <hr className="dropdown-divider" />
                <a href="#" className="dropdown-item">
                  Round Robin (RR)
                </a>
                <a href="#" className="dropdown-item">
                  Shortest Remaining Time First (SRTF)
                </a>
              </div>
            </div>
          </div>

          <input className="input ml-2" style={{ width: "4.5rem" }} type="number" defaultValue="1" min="0.1" max="10" step="0.1" />
        </div>

        <div className="level-item field">
          <button className="button is-primary mr-2" href="/#">
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <button className="button is-primary mr-2" href="/#">
            <FontAwesomeIcon icon={faPlay} />
          </button>
          <button className="button is-primary mr-2" href="/#">
            <FontAwesomeIcon icon={faForward} />
          </button>
          <button className="button is-primary" href="/#">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Process
          </button>
        </div>
      </div>
      <div className="level-right">
        <div className="level-item ml-2">Time Delta: 3</div>
      </div>
    </nav>
  );
};

export default CPUControls;
