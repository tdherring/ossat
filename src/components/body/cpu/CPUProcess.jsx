import React, { useContext } from "react";
import { ResizeContext } from "../../../contexts/ResizeContext";
import { CPUSimulatorContext } from "../../../contexts/CPUSimulatorContext";

const CPUProcess = ({ name, arrivalTime, burstTime, remainingTime, priority, status, jobQueueProcess }) => {
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [running, setRunning] = useContext(CPUSimulatorContext).running;
  const [widthValue] = useContext(ResizeContext).width;

  return (
    <div className={`column ${widthValue > 2400 ? "is-2" : widthValue > 1680 ? "is-3" : widthValue > 1250 ? "is-4" : "is-6"}`}>
      <div className="box has-background-white-bis">
        <h6 className="is-size-6">
          <span className="is-pulled-right field is-grouped">
            {status === "EXECUTING" && <span className="tag is-success">Executing</span>}
            {status === "FINISHED" && <span className="tag is-danger">Finished</span>}
            {status === "WAITING" && <span className="tag is-info">Waiting</span>}
            {jobQueueProcess && (
              <a
                href="/#"
                className="ml-2 tag is-delete has-background-grey-lighter"
                onClick={() => {
                  // Remove the process from the job queue.
                  activeCPUScheduler.removeProcess(name);
                  // Flip this hook var to cause a rerender of the job and ready queues.
                  setRunning(!running);
                }}
              >
                {" "}
              </a>
            )}
          </span>
          <strong>{name}</strong>
        </h6>
        <hr className="is-divider my-3" />
        <h6 className="is-size-6">Arrival Time: {arrivalTime}</h6>
        <h6 className="is-size-6">Burst Time: {burstTime}</h6>
        <h6 className="is-size-6">Remaining Time: {remainingTime}</h6>
        {priority !== undefined && <h6 className="is-size-6">Priority: {priority}</h6>}
      </div>
    </div>
  );
};

export default CPUProcess;
