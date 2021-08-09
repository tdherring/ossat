import React, { useState, useContext } from "react";
import { useMutation, gql } from "@apollo/client";
import { ModalContext } from "../../../contexts/ModalContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";

const PasswordReset = ({ token }) => {
  const [, setActiveModal] = useContext(ModalContext);

  const [submissionAttempt, setSubmissionAttempt] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordReset] = useMutation(gql`
    mutation PasswordReset($token: String!, $password: String!, $confirmPassword: String!) {
      passwordReset(token: $token, newPassword1: $password, newPassword2: $confirmPassword) {
        success
        errors
      }
    }
  `);

  const [passwordResetResult, setPasswordResetResult] = useState(null);
  const [passwordResetErrors, setPasswordResetErrors] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.
    if (!(password === "" && confirmPassword === "" && token !== "password-reset")) {
      setSubmissionAttempt(false);
      passwordReset({ variables: { token, password, confirmPassword } }).then((result) => {
        setPasswordResetResult(result);
        if (!result.data.passwordReset.errors) {
          setPasswordResetErrors({});
          event.target.reset();
        } else {
          setPasswordResetErrors(result.data.passwordReset.errors);
        }
      });
    } else {
      setSubmissionAttempt(true);
    }
  };

  return (
    <div className="tile is-vertical is-parent is-12 container">
      <div className="tile is-child box">
        <h5 className="is-size-5">
          <strong>Password Reset</strong>
        </h5>
        <hr className="is-divider mt-2" />
        <form onSubmit={handleSubmit}>
          <div className="content">
            <div className="field">
              <label className="label">New Password</label>
              <div className="control">
                <input
                  className={`input ${(submissionAttempt && password === "") || (passwordResetErrors && Object.keys(passwordResetErrors).includes("password")) ? "is-danger" : null}`}
                  type="password"
                  onInput={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Confirm New Password</label>
              <div className="control">
                <input
                  className={`input ${(submissionAttempt && password === "") || (passwordResetErrors && Object.keys(passwordResetErrors).includes("password")) ? "is-danger" : null}`}
                  type="password"
                  onInput={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            </div>
            {
              // Any fields are empty?
              submissionAttempt && (password === "" || confirmPassword === "") ? (
                <p className="help is-danger">Please complete the highlighted fields before submitting.</p>
              ) : // Any other errors returned by API?
              passwordResetErrors && Object.keys(passwordResetErrors).length > 0 ? (
                // Map all of the error messages from log in and display at bottom of form.
                Object.keys(passwordResetErrors).map((key) => {
                  let error = passwordResetErrors[key];
                  return <p className="help is-danger">{error[0].message}</p>;
                })
              ) : passwordResetResult && passwordResetResult.data.passwordReset.success ? (
                <p className="help is-success">
                  Password successfully changed! Click{" "}
                  <a href="/#" onClick={() => setActiveModal("logIn")}>
                    here
                  </a>{" "}
                  to login.
                </p>
              ) : null
            }
          </div>
          <button className="button is-primary" type="submit">
            <FontAwesomeIcon icon={faKey} className="mr-2" />
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;
