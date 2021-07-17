import React, { useContext, useState } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { UserContext } from "../../contexts/UserContext";
import { useMutation, gql } from "@apollo/client";

const MyProfile = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [username] = useContext(UserContext).username;
  const [firstName] = useContext(UserContext).firstName;
  const [lastName] = useContext(UserContext).lastName;
  const [email] = useContext(UserContext).email;

  // State for any profile updates.
  const [newFirstName, setNewFirstName] = useState(null);
  const [newLastName, setNewLastName] = useState(null);

  const [updateAccount] = useMutation(gql`
    mutation PasswordChange($firstName: String, $lastName: String) {
      updateAccount(firstName: $firstName, lastName: $lastName) {
        success
        errors
      }
    }
  `);

  const [updateResult, setUpdateResult] = useState(null);
  const [updateResultErrors, setUpdateResultErrors] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.

    updateAccount({ variables: { firstName: newFirstName ? newFirstName : firstName, lastName: newLastName ? newLastName : lastName } }).then((result) => {
      setUpdateResult(result);
      if (!result.data.updateAccount.errors) {
        setUpdateResultErrors(null);
      } else {
        setUpdateResultErrors(result.data.updateAccount.errors);
      }
    });
  };

  return (
    <div className={`modal p-3 ${activeModal === "myProfile" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <form onSubmit={handleSubmit}>
          <header className="modal-card-head">
            <p className="modal-card-title">My Profile</p>
            <button
              className="delete"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setUpdateResult(null);
                setUpdateResultErrors(null);
              }}
            />
          </header>
          <section className="modal-card-body">
            <div className="content">
              <div className="field">
                <label className="label">Username</label>
                <div className="control">
                  <input className="input is-disabled" type="text" value={username || ""} disabled />
                </div>
              </div>
              <div className="field">
                <label className="label">Email</label>
                <div className="control">
                  <input className="input is-disabled" type="text" value={email || ""} disabled />
                </div>
              </div>
              <div className="field">
                <label className="label">First Name</label>
                <div className="control">
                  <input className="input" type="text" defaultValue={firstName || ""} onInput={(event) => setNewFirstName(event.target.value)} />
                </div>
              </div>
              <div className="field">
                <label className="label">Last Name</label>
                <div className="control">
                  <input className="input" type="text" defaultValue={lastName || ""} onInput={(event) => setNewLastName(event.target.value)} />
                </div>
              </div>

              <p>
                If you wish for your account to be deleted, please contact <a href="mailto:admin@ossat.io">admin@ossat.io</a> and an Administrator will be able to process your request.
              </p>
            </div>
            {updateResultErrors ? (
              // Map all of the error messages from profile update and display at bottom of form.
              Object.keys(updateResultErrors).map((key) => {
                let error = updateResultErrors[key];
                return <p className="help is-danger">{error[0].message}</p>;
              })
            ) : updateResult && updateResult.data.updateAccount.success ? (
              <p className="help is-success">Profile successfully updated!</p>
            ) : null}
          </section>
          <footer className="modal-card-foot">
            <button className="button is-primary" type="submit">
              Update
            </button>
            <a
              className="button"
              href="/#"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setUpdateResult(null);
                setUpdateResultErrors(null);
              }}
            >
              Close
            </a>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
