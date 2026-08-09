import { useContext } from "react";
import MemoryProcess from "./MemoryProcess";
import { Plus } from "lucide-react";
import { MemoryManagerContext } from "../../../../contexts/MemoryManagerContext";
import { ModalContext } from "../../../../contexts/ModalContext";

const MemoryJobQueue = () => {
  const [jobQueue, setJobQueue] = useContext(MemoryManagerContext).jQueue;
  const [activeManager] = useContext(MemoryManagerContext).active;
  const [allocated] = useContext(MemoryManagerContext).allocated;
  const [, setActiveModal] = useContext(ModalContext);
  const hasStarted = Object.keys(allocated).length > 0;

  const deleteProcess = (processName: string) => {
    activeManager.removeProcess(processName);
    setJobQueue([...activeManager.getJobQueue()]);
  };

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
          disabled={hasStarted}
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
                <th className="w-[36%] px-2">Process</th>
                <th className="w-[18%] px-2">Size</th>
                <th className="px-2">Placement</th>
                <th className="px-2">State</th>
              </tr>
            </thead>
            <tbody>
              {jobQueue.map((process) => (
                <MemoryProcess
                  key={process.name}
                  process={process}
                  onDelete={hasStarted ? undefined : () => deleteProcess(process.name)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MemoryJobQueue;
