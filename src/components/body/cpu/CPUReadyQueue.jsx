import React from "react";
import CPUProcess from "./CPUProcess";

const CPUReadyQueue = () => {
  return (
    <div>
      <h5 className="is-size-5">Ready Queue</h5>
      <div className="columns is-multiline p-5 is-vcentered">
        <CPUProcess name="p2" arrivalTime="1" burstTime="4" status="EXECUTING" />
        <CPUProcess name="p3" arrivalTime="2" burstTime="1" status="WAITING" />
        <CPUProcess name="p4" arrivalTime="3" burstTime="7" status="WAITING" />
      </div>
    </div>
  );
};

export default CPUReadyQueue;
