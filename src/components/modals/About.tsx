import { useCallback, useContext, useEffect, useRef } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import fullLogo from "../../assets/images/full-logo.svg";
import fullLogoDark from "../../assets/images/full-logo-dark.svg";

const About = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const close = useCallback(() => setActiveModal(null), [setActiveModal]);

  useEffect(() => {
    if (activeModal !== "about") return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
  }, [activeModal, close]);

  return (
    <div
      ref={dialogRef}
      className={`modal p-3 ${activeModal === "about" ? "is-active" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-dialog-title"
    >
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p id="about-dialog-title" className="modal-card-title">
            About
          </p>
          <button
            type="button"
            className="delete"
            aria-label="Close About dialog"
            onClick={close}
          />
        </header>
        <section className="modal-card-body">
          <div className="content">
            <div className="container">
              <img
                className="p-3"
                src={document.documentElement.dataset.theme === "dark" ? fullLogoDark : fullLogo}
                alt="OSSAT Logo"
                style={{ maxHeight: "250px" }}
              ></img>
              <p className="has-text-centered pt-5">
                A Final Year MSc Project by Tom Herring. Developed for{" "}
                <a href="https://kcl.ac.uk/">King's College London</a> in 2021.
                <br />
                <br />
                For any queries, please contact me at{" "}
                <a href="mailto:thomas.herring@kcl.ac.uk">thomas.herring@kcl.ac.uk</a>.
              </p>
            </div>
          </div>
        </section>
        <footer className="modal-card-foot" style={{ gap: "10px" }}>
          <button type="button" className="button" onClick={close}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default About;
