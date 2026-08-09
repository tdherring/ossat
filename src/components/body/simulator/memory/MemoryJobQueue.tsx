import { useContext } from "react";
import MemoryProcess from "./MemoryProcess";
import { Plus } from "lucide-react";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";
import { ModalContext } from "../../../../contexts/ModalContext";

const MemoryJobQueue = () => {
  const [jobQueue] = useContext(MemoryManagerContext).jQueue;
  const [allocated] = useContext(MemoryManagerContext).allocated;
  const [, setActiveModal] = useContext(ModalContext);

  return (
    <div className="lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Process queue</h2>
        </div>
        <button
          type="button"
          className="button h-9 px-3"
          onClick={() => setActiveModal("addMemoryProcess")}
          disabled={Object.keys(allocated).length > 0}
        >
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} /> Add process
        </button>
      </div>
      {jobQueue.length === 0 ? (
        <div className="mt-5 border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Add a process to build the allocation workload.
        </div>
      ) : (
        <div className="process-table-container data-scroll table-container pt-5 lg:min-h-0 lg:flex-1 lg:overflow-auto">
          <table className="table table-fixed w-full">
            <thead className="process-table__desktop-header">
              <tr>
                <th className="w-[46%] px-2">Process</th>
                <th className="w-[22%] px-2">Size</th>
                <th className="px-2">Placement</th>
              </tr>
            </thead>
            <tbody>
              {jobQueue.map((process) => (
                <MemoryProcess key={process.name} process={process} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MemoryJobQueue;
