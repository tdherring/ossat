import { useContext } from "react";
import { Plus } from "lucide-react";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";
import { ModalContext } from "../../../../contexts/ModalContext";
import type MemoryBlock from "../../../../simulator/memory/memory_block";

const MemoryLayout = () => {
  const [activeManager] = useContext(MemoryManagerContext).active;
  const [timeDelta] = useContext(MemoryManagerContext).time;
  const [blocks] = useContext(MemoryManagerContext).blocks;
  const [allocated] = useContext(MemoryManagerContext).allocated;
  const [, setActiveModal] = useContext(ModalContext);

  const getAllocation = (block: MemoryBlock) => {
    const processName = Object.keys(allocated).find((key) => allocated[key] === block);
    const processIndex = processName ? Object.keys(allocated).indexOf(processName) : -1;
    const process = processName ? activeManager.getProcessByName(processName) : null;

    return {
      processName,
      processSize: process?.getSize() ?? 0,
      isVisible: processIndex !== -1 && timeDelta >= processIndex,
      isCommitted: processIndex !== -1 && timeDelta > processIndex,
    };
  };

  return (
    <div className="lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Memory layout</h2>
        </div>
        <button
          type="button"
          className="button h-9 px-3"
          onClick={() => setActiveModal("addMemoryBlock")}
          disabled={Object.keys(allocated).length > 0}
        >
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} /> Add block
        </button>
      </div>
      {Object.keys(blocks).length === 0 && (
        <div className="mt-5 border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Add one or more blocks to define the available memory.
        </div>
      )}
      {blocks.length > 0 && (
        <div className="mt-5 divide-y border lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {blocks.map((block, index) => {
            const size = block.getSize();
            const startAddress = blocks
              .slice(0, index)
              .reduce((total, precedingBlock) => total + precedingBlock.getSize(), 0);
            const endAddress = startAddress + size;
            const allocation = getAllocation(block);
            const usedPercent = Math.min(100, (allocation.processSize / size) * 100);

            return (
              <div
                key={`block-${index}`}
                className="grid gap-3 px-3 py-3 sm:grid-cols-[8rem_minmax(0,1fr)_7rem] sm:items-center"
              >
                <div>
                  <strong className="block font-mono text-sm">Block {index + 1}</strong>
                  <span className="text-[11px] text-muted-foreground">
                    {startAddress}–{endAddress} · {size} units
                  </span>
                </div>
                <div
                  className={`relative h-8 overflow-hidden border bg-muted/45 ${allocation.isVisible && !allocation.isCommitted ? "border-primary" : ""}`}
                >
                  {allocation.isVisible ? (
                    <div
                      className={`flex h-full min-w-1 items-center overflow-hidden border-r border-primary/40 px-2 transition-[width,background-color] duration-300 ${allocation.isCommitted ? "bg-primary/20" : "bg-primary/10"}`}
                      style={{ width: `${usedPercent}%` }}
                    >
                      <span className="truncate font-mono text-[11px] font-semibold text-foreground">
                        {allocation.processName}
                      </span>
                    </div>
                  ) : (
                    <span className="absolute inset-0 flex items-center px-2 text-[11px] text-muted-foreground">
                      Available
                    </span>
                  )}
                </div>
                <div className="flex justify-between gap-3 text-[11px] text-muted-foreground sm:block sm:text-right">
                  <span className="block font-mono text-foreground">
                    {allocation.isVisible ? allocation.processSize : 0} used
                  </span>
                  <span className="block">
                    {allocation.isVisible ? size - allocation.processSize : size} free
                    {allocation.isVisible && !allocation.isCommitted ? " · evaluating" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemoryLayout;
