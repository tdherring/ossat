import { Trash2 } from "lucide-react";

const DeleteProcessButton = ({ name, onDelete }: { name: string; onDelete: () => void }) => (
  <button
    type="button"
    className="inline-flex h-7 w-7 items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    aria-label={`Delete ${name}`}
    onClick={onDelete}
  >
    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
  </button>
);

export default DeleteProcessButton;
