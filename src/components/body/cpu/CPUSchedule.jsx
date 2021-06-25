import React, { useContext, useEffect } from "react";
import { CPUSimulatorContext } from "../../../contexts/CPUSimulatorContext";

const CPUSchedule = () => {
  const [activeCPUScheduler] = useContext(CPUSimulatorContext).active;
  const [timeDelta] = useContext(CPUSimulatorContext).time;
  const [, setCurrentProcess] = useContext(CPUSimulatorContext).current;

  let schedule = activeCPUScheduler.getSchedule();
  let generatedSchedule = [];
  let timeLabels = [...Array(timeDelta).keys()];

  let counter = 0;
  let process;

  for (let i = 0; i < schedule.length; i++) {
    process = schedule[i];
    let burst = { processName: process["processName"], timeDelta: process["timeDelta"], burstTime: 0 };
    for (let j = 0; j < process["burstTime"]; j++) {
      if (counter === timeDelta) break;
      burst["burstTime"] += 1;
      counter++;
    }
    generatedSchedule.push(burst);
    if (counter === timeDelta) break;
  }

  useEffect(() => setCurrentProcess(process));

  console.log(generatedSchedule);

  return (
    <div>
      <h5 className="is-size-5">Schedule</h5>
      <div className="table-container px-3 py-4">
        <table className="table is-bordered is-striped">
          <tbody>
            <tr>
              {timeLabels.map((label) => (
                <th className="px-0" key={"ptd-" + label}>
                  <h6 className="is-size-6">{generatedSchedule.some((burst) => burst.timeDelta === label) && label}</h6>
                </th>
              ))}
              {activeCPUScheduler.getReadyQueue().length > 0 && (
                <th className="px-0" key={"ptd-" + timeLabels.length}>
                  <h6 className="is-size-6">{timeLabels.length}</h6>
                </th>
              )}
            </tr>
            <tr>
              {generatedSchedule.map((burst) => (
                <td colSpan={burst.burstTime} className="has-text-centered" key={burst.timeDelta + "-" + burst.processName}>
                  <h5 className="is-size-5">{burst.processName}</h5>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CPUSchedule;
