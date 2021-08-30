import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";
import { ModalContext } from "../../../../contexts/ModalContext";

const MemoryLayout = () => {
  const [activeManager] = useContext(MemoryManagerContext).active;
  const [timeDelta] = useContext(MemoryManagerContext).time;
  const [blocks] = useContext(MemoryManagerContext).blocks;
  const [allocated] = useContext(MemoryManagerContext).allocated;
  const [, setActiveModal] = useContext(ModalContext);

  let blockCounter = 0;

  const findProcessFill = (block) => {
    let processName = Object.keys(allocated).find((key) => allocated[key] === block);
    let processSize = processName && activeManager.getProcessByName(processName).getSize();
    let height = processName && processSize + "px";

    let processIndex = Object.keys(allocated).indexOf(processName);

    if (processIndex !== -1 && timeDelta > processIndex)
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
      <h5 className="is-size-5">
        <strong>Memory Layout</strong>
        <a
          className="has-text-primary has-tooltip-arrow has-tooltip-right pl-3"
          data-tooltip="Add Block"
          href="/#"
          onClick={(event) => {
            event.preventDefault();
            setActiveModal("addMemoryBlock");
          }}
          disabled={Object.keys(allocated).length > 0 ? true : false}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
        </a>
      </h5>
      {Object.keys(blocks).length === 0 && (
        <article className="message is-dark mx-2 my-4">
          <div className="message-body">Waiting for blocks...</div>
        </article>
      )}
      <div className="table-container px-2 pb-3 my-4">
        <table className="table is-bordered" width="100%">
          <tbody>
            {blocks.length > 0 && (
              <tr height="0px">
                <td width="100%" className="p-0" style={{ border: 0 }}></td>
                <td width="auto" className="block-counter py-0">
                  <h6 className="is-6">0</h6>
                </td>
              </tr>
            )}

            {blocks.map((block) => (
              <tr key={`block-${Object.keys(blocks).indexOf(block)}`} height={block.getSize()}>
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
