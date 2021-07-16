import React, { useContext } from "react";
import MemoryProcess from "./MemoryProcess";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";

const MemoryJobQueue = () => {
  const [jobQueue] = useContext(MemoryManagerContext).jQueue;

  return (
    <div>
      <h5 className="is-size-5">Job Queue</h5>
      {jobQueue.length === 0 ? (
        <article className="message is-dark mx-2 my-4">
          <div className="message-body">Waiting for processes...</div>
        </article>
      ) : (
        <div className="columns is-multiline px-2 py-4 is-vcentered">
          {jobQueue.map((process) => (
            <MemoryProcess key={process.name} name={process.name} size={process.size} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryJobQueue;
