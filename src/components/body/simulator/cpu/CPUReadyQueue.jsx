import React, { useContext } from "react";
import CPUProcess from "./CPUProcess";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";

const CPUReadyQueue = () => {
  const [readyQueue] = useContext(CPUSimulatorContext).rQueue;
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [currentProcess] = useContext(CPUSimulatorContext).current;


  return (
    <div>
      <hr className="is-divider mt-2" />
      <h5 className="is-size-5">
        <strong>Ready Queue</strong>
      </h5>
      {!readyQueue ? (
        <article className="message is-primary my-4">
          <div className="message-body">Waiting to run...</div>
        </article>
      ) : (
        <div className="py-4">
          {readyQueue.map((process) => (
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CPUReadyQueue;
