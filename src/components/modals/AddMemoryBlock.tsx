import { useContext, useState, type FormEvent } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { MemoryManagerContext } from "../../contexts/MemoryManagerContext";
import { Plus } from "lucide-react";

const AddMemoryBlock = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [activeManager] = useContext(MemoryManagerContext).active;
  const [running, setRunning] = useContext(MemoryManagerContext).running;

  //State for block
  const [size, setSize] = useState(100);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.

    if (!Number.isFinite(size)) return;
    activeManager.createBlock(size);
    setRunning(!running);
    setActiveModal(null);
    event.currentTarget.reset();
    setSize(100);
  };

  return (
    <div className={`modal p-3 ${activeModal === "addMemoryBlock" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <form onSubmit={handleSubmit}>
          <header className="modal-card-head">
            <p className="modal-card-title">Add Block</p>
            <button
              type="button"
              className="delete"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
              }}
            />
          </header>
          <section className="modal-card-body">
            <div className="content">
              <div className="field">
                <label className="label">Block Size</label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    defaultValue="100"
                    min="10"
                    required
                    onInput={(event) => {
                      const nextSize = event.currentTarget.valueAsNumber;
                      if (Number.isFinite(nextSize)) setSize(nextSize);
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
          <footer className="modal-card-foot" style={{ gap: "10px" }}>
            <button type="submit" className="button is-primary">
              <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
              Add
            </button>
            <button
              type="button"
              className="button"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
              }}
            >
              Close
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddMemoryBlock;
