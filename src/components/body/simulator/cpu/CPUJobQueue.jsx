import React, { useContext } from "react";
import CPUProcess from "./CPUProcess";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ModalContext } from "../../../../contexts/ModalContext";

const CPUJobQueue = () => {
  const [jobQueue] = useContext(CPUSimulatorContext).jQueue;
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [currentProcess] = useContext(CPUSimulatorContext).current;
  const [, setActiveModal] = useContext(ModalContext);

  return (
    <div>
      <h5 className="is-size-5">
        <strong>Job Queue</strong>
        <a
          className="has-text-primary has-tooltip-arrow has-tooltip-right pl-3"
          data-tooltip="Add Process"
          href="/#"
          onClick={(event) => {
            event.preventDefault();
            setActiveModal("addCPUProcess");
          }}
          disabled={activeCPUScheduler.getAllReadyQueues().length > 0 ? true : false}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
        </a>
      </h5>
      {jobQueue.length === 0 ? (
        <article className="message is-dark mx-2 my-4">
          <div className="message-body">Waiting for processes...</div>
        </article>
      ) : (
        <div className="columns is-multiline px-2 py-4 is-vcentered">
          {jobQueue.map((process) => (
            <CPUProcess
              key={process.name}
              name={process.name}
              arrivalTime={process.arrivalTime}
              burstTime={process.burstTime}
              remainingTime={process.remainingTime}
              priority={process.priority}
              status={
                process.remainingTime === 0 ? "FINISHED" : activeCPUScheduler.getAllReadyQueues().length > 0 && currentProcess && currentProcess.processName === process.name ? "EXECUTING" : "WAITING"
              }
              jobQueueProcess
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CPUJobQueue;
