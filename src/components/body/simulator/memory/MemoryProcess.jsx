import React, { useContext, useEffect, useState } from "react";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const MemoryProcess = ({ process }) => {
  const [timeDelta] = useContext(MemoryManagerContext).time;

  const [allocated] = useContext(MemoryManagerContext).allocated;
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    console.log(process.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeDelta]);

  let tag = null;
  if (Object.keys(allocated).length > 0) {
    if (timeDelta === Object.keys(allocated).indexOf(process.name)) {
      tag = <span className="tag is-info">Allocating</span>;
    } else if (timeDelta > Object.keys(allocated).indexOf(process.name) && allocated[process.name] !== null) {
      tag = <span className="tag is-success">Allocated</span>;
    } else if (timeDelta > Object.keys(allocated).indexOf(process.name) && allocated[process.name] === null) {
      tag = <span className="tag is-danger">Unallocated</span>;
    }
  }

  return (
    <div className="mb-3">
      <div className={`card ${timeDelta === Object.keys(allocated).indexOf(process.name) ? "active-process" : ""}`}>
        <header
          className="card-header"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", padding: "0.5rem 1rem" }}
        >
          <span className="icon mr-2">
            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
          </span>
          <p className="card-header-title is-marginless" style={{ padding: 0 }}>
            {process.name}
          </p>
          {tag && (
            <div className="is-pulled-right ml-auto">
              {tag}
            </div>
          )}
        </header>

        {isExpanded && (
          <div className="card-content" style={{ paddingTop: 0, paddingBottom: "1rem" }}>
            <div className="content">
              <p className="m-0"><strong>Size:</strong> {process.getSize ? process.getSize() : process.size}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryProcess;
