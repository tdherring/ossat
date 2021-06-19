import React, { useContext } from "react";
import { ResizeContext } from "../../../contexts/ResizeContext";
import { CPUSimulatorContext } from "../../../contexts/CPUSimulatorContext";

const CPUProcess = ({ name, arrivalTime, burstTime, priority, status }) => {
  const { width } = useContext(ResizeContext);
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [jobQueue, setJobQueue] = useContext(CPUSimulatorContext).jQueue;
  const [widthValue] = width;

  return (
    <div className={`column ${widthValue > 2400 ? "is-2" : widthValue > 1680 ? "is-3" : widthValue > 1250 ? "is-4" : "is-6"}`}>
      <div className="box has-background-white-bis">
        <h6 className="is-size-6">
          <span className="is-pulled-right field is-grouped">
            {status === "EXECUTING" && <span className="tag is-success">Executing</span>}
            {status === "FINISHED" && <span className="tag is-danger">Finished</span>}
            {status === "WAITING" && <span className="tag is-info">Waiting</span>}
            <a
              href="/#"
              className="ml-2 tag is-delete has-background-grey-lighter"
              onClick={() => {
                // Remove the process from the job queue on the GUI.
                setJobQueue(
                  jobQueue.filter((process) => {
                    return process.name !== name;
                  })
                );
                // Remove the process from the actual job queue.
                activeCPUScheduler.removeProcess(name);
              }}
            ></a>
          </span>
          <strong>{name}</strong>
        </h6>
        <hr className="is-divider my-3" />
        <h6 className="is-size-6">Arrival Time: {arrivalTime}</h6>
        <h6 className="is-size-6">Burst Time: {burstTime}</h6>
        {priority && <h6 className="is-size-6">Priority: {priority}</h6>}
      </div>
    </div>
  );
};

export default CPUProcess;
