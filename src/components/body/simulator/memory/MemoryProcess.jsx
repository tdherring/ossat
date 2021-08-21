import React, { useContext, useEffect } from "react";
import { ResizeContext } from "../../../../contexts/ResizeContext";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";

const MemoryProcess = ({ process }) => {
  const [widthValue] = useContext(ResizeContext).width;
  const [timeDelta] = useContext(MemoryManagerContext).time;
  const [jobQueue] = useContext(MemoryManagerContext).jQueue;
  const [blocks] = useContext(MemoryManagerContext).blocks;

  const [allocated] = useContext(MemoryManagerContext).allocated;

  useEffect(() => {
    console.log(process.name);
  }, [timeDelta]);

  return (
    <div className={`column ${widthValue > 3000 ? "is-2" : widthValue > 2100 ? "is-3" : widthValue > 1800 ? "is-4" : widthValue > 930 ? "is-6" : "is-12"}`}>
      <div className={`box has-background-white-bis ${timeDelta === Object.keys(allocated).indexOf(process.name) && "active-process"}`}>
        <h6 className="is-size-6">
          <strong>{process.name}</strong>
          {Object.keys(allocated).length > 0 &&
            (timeDelta === Object.keys(allocated).indexOf(process.name) ? (
              <span className="is-pulled-right field is-grouped">
                <span className="tag is-info">Allocating</span>
              </span>
            ) : timeDelta > Object.keys(allocated).indexOf(process.name) && allocated[process.name] !== null ? (
              <span className="is-pulled-right field is-grouped">
                <span className="tag is-success">Allocated</span>
              </span>
            ) : timeDelta > Object.keys(allocated).indexOf(process.name) && allocated[process.name] === null ? (
              <span className="is-pulled-right field is-grouped">
                <span className="tag is-danger">Unallocated</span>
              </span>
            ) : null)}
        </h6>
        <hr className="is-divider mt-2 my-3" />
        <h6 className="is-size-6">Size: {process.size}</h6>
      </div>
    </div>
  );
};

export default MemoryProcess;
