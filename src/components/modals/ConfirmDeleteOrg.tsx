import { useContext, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { ModalContext } from "../../contexts/ModalContext";
import Button from "../ui/Button";
import type { ApiErrors, MutationPayload } from "../../types/api";

const ConfirmDeleteOrg = ({ name }: { name: string }) => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [deleteOrganisation, { loading }] = useMutation<
    { deleteOrganisation: MutationPayload },
    { name: string; token: string }
  >(gql`
    mutation DeleteOrganisation($name: String!, $token: String!) {
      deleteOrganisation(name: $name, token: $token) {
        success
        errors
      }
    }
  `);
  const [errors, setErrors] = useState<ApiErrors>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const close = () => {
    if (loading) return;
    setErrors({});
    setActiveModal(null);
  };

  useEffect(() => {
    if (activeModal !== "confirmDeleteOrg") return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const getFocusable = () =>
      dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
    const focusable = getFocusable();
    focusable?.[0]?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const currentFocusable = getFocusable();
      if (!currentFocusable?.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      previousFocusRef.current?.focus();
    };
  }, [activeModal]);

  return (
    <div
      ref={dialogRef}
      className={`modal ${activeModal === "confirmDeleteOrg" ? "is-active" : ""}`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-group-title"
      tabIndex={-1}
    >
      <button
        type="button"
        className="modal-background"
        aria-label="Cancel deletion"
        disabled={loading}
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
          <button
            type="button"
            className="delete"
            aria-label="Close"
            disabled={loading}
            onClick={close}
          />
        </header>
        <section className="modal-card-body">
          <p className="text-sm leading-6 text-muted-foreground">
            <strong className="text-foreground">{name}</strong> will be permanently deleted. Members
            and managers will lose access to the group and its performance view.
          </p>
          {Object.values(errors)
            .flat()
            .map((error) => (
              <p key={`${error.code}-${error.message}`} className="mt-3 text-sm text-destructive">
                {error.message}
              </p>
            ))}
        </section>
        <footer className="modal-card-foot">
          <Button variant="outline" disabled={loading} onClick={close}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => (
              setErrors({}),
              deleteOrganisation({
                variables: { name, token: localStorage.getItem("accessToken") ?? "" },
              })
                .then((result) => {
                  const payload = result.data?.deleteOrganisation;
                  if (payload?.success) {
                    setErrors({});
                    close();
                  } else setErrors(payload?.errors ?? {});
                })
                .catch(() =>
                  setErrors({
                    nonFieldErrors: [
                      { code: "request_failed", message: "The group could not be deleted." },
                    ],
                  }),
                )
            )}
          >
            Delete group
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmDeleteOrg;
