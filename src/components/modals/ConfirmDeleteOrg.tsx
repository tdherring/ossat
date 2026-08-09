import { useContext } from "react";
import { Trash2 } from "lucide-react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { ModalContext } from "../../contexts/ModalContext";
import Button from "../ui/Button";

const ConfirmDeleteOrg = ({ name }: { name: string }) => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [deleteOrganisation] = useMutation(gql`
    mutation DeleteOrganisation($name: String!, $token: String!) {
      deleteOrganisation(name: $name, token: $token) {
        success
        errors
      }
    }
  `);
  const close = () => setActiveModal(null);

  return (
    <div
      className={`modal ${activeModal === "confirmDeleteOrg" ? "is-active" : ""}`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-group-title"
    >
      <button
        type="button"
        className="modal-background"
        aria-label="Cancel deletion"
        onClick={close}
      />
      <div className="modal-card max-w-md rounded-[4px]">
        <header className="modal-card-head">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-destructive" />
            <p id="delete-group-title" className="modal-card-title">
              Delete Group
            </p>
          </div>
          <button type="button" className="delete" aria-label="Close" onClick={close} />
        </header>
        <section className="modal-card-body">
          <p className="text-sm leading-6 text-muted-foreground">
            <strong className="text-foreground">{name}</strong> will be permanently deleted. Members
            and managers will lose access to the group and its performance view.
          </p>
        </section>
        <footer className="modal-card-foot">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              deleteOrganisation({
                variables: { name, token: localStorage.getItem("accessToken") ?? "" },
              }).then(close)
            }
          >
            Delete group
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmDeleteOrg;
