import React, { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";

const Register = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  return (
    <div className={`modal p-3 ${activeModal === "register" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Register</p>
          <button
            className="delete"
            onClick={(event) => {
              event.preventDefault();
              setActiveModal(null);
            }}
          />
        </header>
        <section className="modal-card-body">
          <div className="content"></div>
        </section>
        <footer className="modal-card-foot">
          <a
            className="button"
            href="/#"
            onClick={(event) => {
              event.preventDefault();
              setActiveModal(null);
            }}
          >
            Cancel
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Register;
