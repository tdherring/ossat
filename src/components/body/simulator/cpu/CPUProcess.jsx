import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const CPUProcess = ({ name, arrivalTime, burstTime, remainingTime, priority, status }) => {

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-3">
      <div className={`card ${status === "EXECUTING" ? "active-process" : ""}`}>
        <header
          className="card-header"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", padding: "0.5rem 1rem" }}
        >
          <span className="icon mr-2">
            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
          </span>
          <p className="card-header-title is-marginless" style={{ padding: 0 }}>
            {name}
          </p>
          <div className="is-pulled-right ml-auto">
            {status === "EXECUTING" && <span className="tag is-success">Executing</span>}
            {status === "FINISHED" && <span className="tag is-danger">Finished</span>}
            {status === "WAITING" && <span className="tag is-info">Waiting</span>}
          </div>
        </header>

        {isExpanded && (
          <div className="card-content" style={{ paddingTop: 0, paddingBottom: "1rem" }}>
            <div className="content">
              <p className="m-0"><strong>Arrival Time:</strong> {arrivalTime}</p>
              <p className="m-0"><strong>Burst Time:</strong> {burstTime}</p>
              <p className="m-0"><strong>Remaining Time:</strong> {remainingTime}</p>
              {priority !== undefined && <p className="m-0"><strong>Priority:</strong> {priority}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CPUProcess;
