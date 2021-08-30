import React, { useContext } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { gql, useMutation } from "@apollo/client";

const ConfirmDeleteOrg = ({ name }) => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  const [deleteOrganisation] = useMutation(gql`
    mutation DeleteOrganisation($name: String!, $token: String!) {
      deleteOrganisation(name: $name, token: $token) {
        success
        errors
      }
    }
  `);

  return (
    <div className={`modal p-3 ${activeModal === "confirmDeleteOrg" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Are you sure?</p>
          <button
            className="delete"
            onClick={(event) => {
              event.preventDefault();
              setActiveModal(null);
            }}
          />
        </header>
        <section className="modal-card-body">
          <div className="content">Are you sure you want to delete this Organisation? All managers and members will be removed, and access to their performance data lost.</div>
        </section>
        <footer className="modal-card-foot">
          <a
            className="button is-primary"
            href="/#"
            onClick={(event) => {
              deleteOrganisation({ variables: { name: name, token: localStorage.getItem("accessToken") } }).then((result) => setActiveModal(null));
            }}
          >
            <strong>Yes</strong>
          </a>
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

export default ConfirmDeleteOrg;
