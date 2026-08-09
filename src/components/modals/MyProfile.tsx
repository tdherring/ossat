import { useContext, useState, type FormEvent } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { UserContext } from "../../contexts/UserContext";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import type { ApiErrors, MutationPayload } from "../../types/api";

const MyProfile = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [username] = useContext(UserContext).username;
  const [firstName, setFirstName] = useContext(UserContext).firstName;
  const [lastName, setLastName] = useContext(UserContext).lastName;
  const [email] = useContext(UserContext).email;

  // State for any profile updates.
  const [newFirstName, setNewFirstName] = useState<string | null>(null);
  const [newLastName, setNewLastName] = useState<string | null>(null);

  const [updateAccount] = useMutation<
    { updateAccount: MutationPayload },
    { firstName: string | null; lastName: string | null }
  >(gql`
    mutation PasswordChange($firstName: String, $lastName: String) {
      updateAccount(firstName: $firstName, lastName: $lastName) {
        success
        errors
      }
    }
  `);

  const [updateResult, setUpdateResult] = useState<MutationPayload | null>(null);
  const [updateResultErrors, setUpdateResultErrors] = useState<ApiErrors | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.

    updateAccount({
      variables: {
        firstName: newFirstName ?? firstName,
        lastName: newLastName ?? lastName,
      },
    }).then((result) => {
      const payload = result.data?.updateAccount;
      if (!payload) return;
      setUpdateResult(payload);
      if (!payload.errors) {
        setUpdateResultErrors(null);
        setFirstName(newFirstName ?? firstName);
        setLastName(newLastName ?? lastName);
      } else {
        setUpdateResultErrors(payload.errors);
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
              type="button"
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
                  <input
                    className="input is-disabled"
                    type="text"
                    value={username || ""}
                    disabled
                  />
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
                  <input
                    className="input"
                    type="text"
                    defaultValue={firstName || ""}
                    onInput={(event) => setNewFirstName(event.currentTarget.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Last Name</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    defaultValue={lastName || ""}
                    onInput={(event) => setNewLastName(event.currentTarget.value)}
                  />
                </div>
              </div>

              <p>
                If you wish for your account to be deleted, please contact{" "}
                <a href="mailto:admin@ossat.io">admin@ossat.io</a> and an Administrator will be able
                to process your request.
              </p>
            </div>
            {updateResultErrors ? (
              // Map all of the error messages from profile update and display at bottom of form.
              Object.keys(updateResultErrors).map((key) => {
                const error = updateResultErrors[key];
                return (
                  <p key={`update-result-err-${error[0].code}`} className="help is-danger">
                    {error[0].message}
                  </p>
                );
              })
            ) : updateResult?.success ? (
              <p className="help is-success">Profile successfully updated!</p>
            ) : null}
          </section>
          <footer className="modal-card-foot" style={{ gap: "10px" }}>
            <button className="button is-primary" type="submit">
              Update
            </button>
            <button
              type="button"
              className="button"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setUpdateResult(null);
                setUpdateResultErrors(null);
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

export default MyProfile;
