import React, { useContext } from "react";
import { MemoryManagerContext } from "../../../contexts/MemoryManagerContext";

const MemoryLayout = () => {
  const [activeManager] = useContext(MemoryManagerContext).active;
  const [blocks] = useContext(MemoryManagerContext).blocks;
  const [allocated] = useContext(MemoryManagerContext).allocated;

  let blockCounter = 0;

  const findProcessFill = (block) => {
    let processName = Object.keys(allocated).find((key) => allocated[key] === block);
    return (
      processName && (
        <div className="has-text-centered" style={{ height: activeManager.getProcessByName(processName).getSize(), backgroundColor: "lightsteelblue", width: "100%" }}>
          {processName}
        </div>
      )
    );
  };

  return (
    <div>
      <h5 className="is-size-5">Memory Layout</h5>
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
    </div>
  );
};

export default MemoryLayout;
