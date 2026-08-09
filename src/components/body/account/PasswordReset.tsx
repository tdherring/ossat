import { useState, useContext, type FormEvent } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { ModalContext } from "../../../contexts/ModalContext";
import { KeyRound } from "lucide-react";
import type { ApiErrors, MutationPayload } from "../../../types/api";

type PasswordResetData = { passwordReset: MutationPayload };
type PasswordResetVariables = { token: string; password: string; confirmPassword: string };

const PasswordReset = ({ token = "" }: { token?: string }) => {
  const [, setActiveModal] = useContext(ModalContext);

  const [submissionAttempt, setSubmissionAttempt] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordReset] = useMutation<PasswordResetData, PasswordResetVariables>(gql`
    mutation PasswordReset($token: String!, $password: String!, $confirmPassword: String!) {
      passwordReset(token: $token, newPassword1: $password, newPassword2: $confirmPassword) {
        success
        errors
      }
    }
  `);

  const [passwordResetResult, setPasswordResetResult] = useState<MutationPayload | null>(null);
  const [passwordResetErrors, setPasswordResetErrors] = useState<ApiErrors | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.
    const form = event.currentTarget;
    if (!(password === "" && confirmPassword === "" && token !== "password-reset")) {
      setSubmissionAttempt(false);
      passwordReset({ variables: { token, password, confirmPassword } }).then((result) => {
        const payload = result.data?.passwordReset;
        if (!payload) return;
        setPasswordResetResult(payload);
        if (!payload.errors) {
          setPasswordResetErrors(null);
          form.reset();
          setPassword("");
          setConfirmPassword("");
        } else {
          setPasswordResetErrors(payload.errors);
        }
      });
    } else {
      setSubmissionAttempt(true);
    }
  };

  return (
    <div className="container">
      <div className="box">
        <p className="title is-size-4">Password Reset</p>
        <hr className="is-divider mt-2" />
        <form onSubmit={handleSubmit}>
          <div className="content">
            <div className="field">
              <label className="label">New Password</label>
              <div className="control">
                <input
                  className={`input ${(submissionAttempt && password === "") || (passwordResetErrors && Object.keys(passwordResetErrors).includes("password")) ? "is-danger" : null}`}
                  type="password"
                  onInput={(event) => setPassword(event.currentTarget.value)}
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Confirm New Password</label>
              <div className="control">
                <input
                  className={`input ${(submissionAttempt && password === "") || (passwordResetErrors && Object.keys(passwordResetErrors).includes("password")) ? "is-danger" : null}`}
                  type="password"
                  onInput={(event) => setConfirmPassword(event.currentTarget.value)}
                />
              </div>
            </div>
            {
              // Any fields are empty?
              submissionAttempt && (password === "" || confirmPassword === "") ? (
                <p className="help is-danger">
                  Please complete the highlighted fields before submitting.
                </p>
              ) : // Any other errors returned by API?
              passwordResetErrors && Object.keys(passwordResetErrors).length > 0 ? (
                // Map all of the error messages from log in and display at bottom of form.
                Object.keys(passwordResetErrors).map((key) => {
                  const error = passwordResetErrors[key];
                  return (
                    <p key={`password-reset-err-${error[0].code}`} className="help is-danger">
                      {error[0].message}
                    </p>
                  );
                })
              ) : passwordResetResult?.success ? (
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
            <KeyRound className="mr-2 h-4 w-4" strokeWidth={1.75} />
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;
