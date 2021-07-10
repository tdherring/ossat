import React, { useContext } from "react";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";

const MemoryLayout = () => {
  const [activeManager] = useContext(MemoryManagerContext).active;
  const [timeDelta] = useContext(MemoryManagerContext).time;
  const [blocks] = useContext(MemoryManagerContext).blocks;
  const [allocated] = useContext(MemoryManagerContext).allocated;
  const [jobQueue] = useContext(MemoryManagerContext).jQueue;

  let blockCounter = 0;
  let counter = -1;

  const findProcessFill = (block) => {
    let processName = Object.keys(allocated).find((key) => allocated[key] === block);
    let processSize = processName && activeManager.getProcessByName(processName).getSize();
    let height = processName && processSize + "px";
    counter++;
    if (counter < timeDelta)
      return (
        processName && (
          <div
            className="has-text-centered"
            style={{
              height: height,
              lineHeight: height,
              backgroundColor: "lightsteelblue",
              width: "100%",
            }}
          >
            <strong>
              {processName} ({processSize})
            </strong>
          </div>
        )
      );
  };

  return (
    <div>
      <h5 className="is-size-5">Memory Layout</h5>
      {jobQueue.length === 0 && blocks.length === 0 ? (
        <article className="message is-dark mx-2 my-4">
          <div className="message-body">Waiting for Memory Blocks and Processes...</div>
        </article>
      ) : (
        <div className="table-container px-3 pb-4">
          <table className="table is-bordered" width="100%">
            <tbody>
              {blocks.length > 0 && (
                <tr height="0px">
                  <td width="100%" style={{ border: 0 }}></td>
                  <td width="auto" className="block-counter">
                    <h6 className="is-6">0</h6>
                  </td>
                </tr>
              )}
              {blocks.map((block) => (
                <tr height={block.getSize()}>
                  <td width="100%" className="p-0">
                    {findProcessFill(block)}
                  </td>
                  <td width="auto" className="block-counter">
                    <h6 className="is-6">{(blockCounter += block.getSize())}</h6>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MemoryLayout;
