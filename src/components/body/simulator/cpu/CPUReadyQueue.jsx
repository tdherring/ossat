import React, { useContext } from "react";
import CPUProcess from "./CPUProcess";
import { CPUSimulatorContext } from "../../../../contexts/CPUSimulatorContext";

const CPUReadyQueue = () => {
  const [readyQueue] = useContext(CPUSimulatorContext).rQueue;
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [currentProcess] = useContext(CPUSimulatorContext).current;

  return (
    <div>
      <h5 className="is-size-5">Ready Queue</h5>
      {!readyQueue ? (
        <article className="message is-dark mx-2 my-4">
          <div className="message-body">Waiting to run...</div>
        </article>
      ) : (
        <div className="columns is-multiline px-2 py-4 is-vcentered">
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
