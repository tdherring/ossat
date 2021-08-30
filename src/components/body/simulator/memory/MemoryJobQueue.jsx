import React, { useContext } from "react";
import MemoryProcess from "./MemoryProcess";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";
import { ModalContext } from "../../../../contexts/ModalContext";

const MemoryJobQueue = () => {
  const [jobQueue] = useContext(MemoryManagerContext).jQueue;
  const [allocated] = useContext(MemoryManagerContext).allocated;
  const [, setActiveModal] = useContext(ModalContext);

  return (
    <div>
      <span>
        <h5 className="is-size-5">
          <strong>Job Queue</strong>
          <a
            className="has-text-primary has-tooltip-arrow has-tooltip-right pl-3"
            data-tooltip="Add Process"
            href="/#"
            onClick={(event) => {
              event.preventDefault();
              setActiveModal("addMemoryProcess");
            }}
            disabled={Object.keys(allocated).length > 0 ? true : false}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
          </a>
        </h5>
      </span>
      {jobQueue.length === 0 ? (
        <article className="message is-dark mx-2 my-4">
          <div className="message-body">Waiting for processes...</div>
        </article>
      ) : (
        <div className="columns is-multiline px-2 py-4 is-vcentered">
          {jobQueue.map((process) => (
            <MemoryProcess key={process.name} process={process} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryJobQueue;
