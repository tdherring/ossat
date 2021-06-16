import React from "react";
import CPUProcess from "./CPUProcess";

const CPUJobQueue = () => {
  return (
    <div>
      <h5 className="is-size-5">Job Queue</h5>
      <div className="columns is-multiline p-5 is-vcentered">
        <CPUProcess name="p1" arrivalTime="0" burstTime="2" status="FINISHED" />
        <CPUProcess name="p2" arrivalTime="1" burstTime="4" status="EXECUTING" />
        <CPUProcess name="p3" arrivalTime="2" burstTime="1" status="WAITING" />
        <CPUProcess name="p4" arrivalTime="3" burstTime="7" status="WAITING" />
        <CPUProcess name="p5" arrivalTime="4" burstTime="3" status="WAITING" />
        <CPUProcess name="p6" arrivalTime="5" burstTime="4" status="WAITING" />
        <CPUProcess name="p7" arrivalTime="6" burstTime="8" status="WAITING" />
        <CPUProcess name="p8" arrivalTime="7" burstTime="3" status="WAITING" />
      </div>
    </div>
  );
};

export default CPUJobQueue;
