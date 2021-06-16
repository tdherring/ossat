import React from "react";

const CPUProcess = ({ name, arrivalTime, burstTime, priority, status }) => {
  return (
    <div className="column is-2">
      <div className="box has-background-white-bis">
        <h6 className="is-size-6">
          <span className="is-pulled-right field is-grouped">
            {status == "EXECUTING" && <span className="tag is-success">Executing</span>}
            {status == "FINISHED" && <span className="tag is-danger">Finished</span>}
            {status == "WAITING" && <span className="tag is-info">Waiting</span>}
            <a class="ml-2 tag is-delete has-background-grey-lighter"></a>
          </span>
          <strong>{name}</strong>
        </h6>
        <h6 className="is-size-6">Arrival: {arrivalTime}</h6>
        <h6 className="is-size-6">Burst: {burstTime}</h6>
        {priority && <h6 className="is-size-6">Priority: {priority}</h6>}
      </div>
    </div>
  );
};

export default CPUProcess;
