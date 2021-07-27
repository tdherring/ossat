import React, { useContext, useState } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { useMutation, gql } from "@apollo/client";

const RequestPasswordReset = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [email, setEmail] = useState("");

  // GraphQL mutation to send password reset the user.
  const [sendPasswordResetEmail] = useMutation(gql`
    mutation SendPasswordResetEmail($email: String!) {
      sendPasswordResetEmail(email: $email) {
        success
        errors
      }
    }
  `);
  const [sendEmailResult, setSendEmailResult] = useState(null);
  const [sendEmailResultErrors, setSendEmailResultErrors] = useState({});

  // Track whether user has attempted to submit the password reset form.
  const [submissionAttempt, setSubmissionAttempt] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.
    if (email !== "") {
      setSubmissionAttempt(false);
      sendPasswordResetEmail({ variables: { email } }).then((result) => {
        setSendEmailResult(result);
        if (!result.data.sendPasswordResetEmail.errors) {
          setSendEmailResultErrors({});
          event.target.reset();
        } else {
          setSendEmailResultErrors(result.data.sendPasswordResetEmail.errors);
        }
      });
    } else {
      setSubmissionAttempt(true);
    }
  };

  return (
    <div className={`modal p-3 ${activeModal === "requestPasswordReset" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <form onSubmit={handleSubmit}>
          <header className="modal-card-head">
            <p className="modal-card-title">Request Password Reset</p>
            <button
              className="delete"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setSendEmailResult(null);
                setSendEmailResultErrors({});
              }}
            />
          </header>
          <section className="modal-card-body">
            <div className="content">
              <div className="field">
                <label className="label">Email</label>
                <div className="control">
                  <input
                    className={`input ${(submissionAttempt && email === "") || Object.keys(sendEmailResultErrors).includes("email") ? "is-danger" : null}`}
                    type="email"
                    onInput={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>

              {
                // Any fields are empty?
                submissionAttempt && email === "" ? (
                  <p className="help is-danger">Please complete the highlighted fields before submitting.</p>
                ) : // Any other errors returned by API?
                Object.keys(sendEmailResultErrors).length > 0 ? (
                  // Map all of the error messages from attempting to send email and display at bottom of form.
                  Object.keys(sendEmailResultErrors).map((key) => {
                    let error = sendEmailResultErrors[key];
                    return <p className="help is-danger">{error[0].message}</p>;
                  })
                ) : (
                  sendEmailResult &&
                  sendEmailResult.data.sendPasswordResetEmail.success && (
                    <p className="help is-success">If there is an account associated with the address provided, a password reset email successfully sent. Please check your inbox.</p>
                  )
                )
              }
            </div>
          </section>
          <footer className="modal-card-foot">
            <button className="button is-primary" type="submit">
              Send Email
            </button>
            <a
              className="button"
              href="/#"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setSendEmailResult(null);
                setSendEmailResultErrors({});
              }}
            >
              Cancel
            </a>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
