import { useContext, useRef, useState, type FormEvent } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useCookies } from "react-cookie";
import type { ApiErrors, MutationPayload } from "../../types/api";

interface PasswordChangePayload extends MutationPayload {
  token: string | null;
  refreshToken: string | null;
}

const ChangePassword = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [, setCookie] = useCookies(["refreshToken"]);

  // State for password updates.
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [changePassword] = useMutation<
    { passwordChange: PasswordChangePayload },
    { oldPassword: string; newPassword: string; confirmNewPassword: string }
  >(gql`
    mutation ChangePassword(
      $oldPassword: String!
      $newPassword: String!
      $confirmNewPassword: String!
    ) {
      passwordChange(
        oldPassword: $oldPassword
        newPassword1: $newPassword
        newPassword2: $confirmNewPassword
      ) {
        success
        errors
        token
        refreshToken
      }
    }
  `);

  const [changePasswordResult, setChangePasswordResult] = useState<PasswordChangePayload | null>(
    null,
  );
  const [changePasswordResultErrors, setChangePasswordResultErrors] = useState<ApiErrors | null>(
    null,
  );

  // Track whether user has attempted to submit the update profile form.
  const [submissionAttempt, setSubmissionAttempt] = useState(false);

  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);
  const closeModal = () => {
    requestIdRef.current += 1;
    setLoading(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setSubmissionAttempt(false);
    setChangePasswordResult(null);
    setChangePasswordResultErrors(null);
    setActiveModal(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.

    if (oldPassword !== "" && newPassword !== "" && confirmNewPassword !== "") {
      setSubmissionAttempt(false);
      setLoading(true);
      const requestId = ++requestIdRef.current;
      changePassword({ variables: { oldPassword, newPassword, confirmNewPassword } })
        .then((result) => {
          if (requestId !== requestIdRef.current) return;
          const payload = result.data?.passwordChange;
          if (!payload) return;
          setChangePasswordResult(payload);
          if (!payload.errors) {
            setChangePasswordResultErrors(null);
            if (payload.token) localStorage.setItem("accessToken", payload.token);
            if (payload.refreshToken)
              setCookie("refreshToken", payload.refreshToken, {
                path: "/",
                sameSite: "strict",
                secure: import.meta.env.PROD,
              });
          } else {
            setChangePasswordResultErrors(payload.errors);
          }
        })
        .catch((error) => {
          if (requestId !== requestIdRef.current) return;
          console.warn("The password change request failed.", error);
          setChangePasswordResultErrors({
            nonFieldErrors: [
              { code: "request_failed", message: "Password change failed. Please try again." },
            ],
          });
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setLoading(false);
        });
    } else {
      setSubmissionAttempt(true);
    }
  };

  return (
    <div className={`modal p-3 ${activeModal === "changePassword" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <form onSubmit={handleSubmit}>
          <header className="modal-card-head">
            <p className="modal-card-title">Change Password</p>
            <button
              className="delete"
              type="button"
              aria-label="Close change password dialog"
              onClick={closeModal}
            />
          </header>
          <section className="modal-card-body">
            <div className="content">
              <div className="field">
                <label className="label">Old Password</label>
                <div className="control">
                  <input
                    className={`input ${
                      (submissionAttempt && oldPassword === "") ||
                      (changePasswordResultErrors &&
                        Object.keys(changePasswordResultErrors).includes("oldPassword"))
                        ? "is-danger"
                        : null
                    }`}
                    type="password"
                    value={oldPassword}
                    onChange={(event) => setOldPassword(event.currentTarget.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">New Password</label>
                <div className="control">
                  <input
                    className={`input ${
                      (submissionAttempt && newPassword === "") ||
                      (changePasswordResultErrors &&
                        (Object.keys(changePasswordResultErrors).includes("newPassword1") ||
                          Object.keys(changePasswordResultErrors).includes("newPassword2")))
                        ? "is-danger"
                        : null
                    }`}
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.currentTarget.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Confirm New Password</label>
                <div className="control">
                  <input
                    className={`input ${
                      (submissionAttempt && confirmNewPassword === "") ||
                      (changePasswordResultErrors &&
                        (Object.keys(changePasswordResultErrors).includes("newPassword1") ||
                          Object.keys(changePasswordResultErrors).includes("newPassword2")))
                        ? "is-danger"
                        : null
                    }`}
                    type="password"
                    value={confirmNewPassword}
                    onChange={(event) => setConfirmNewPassword(event.currentTarget.value)}
                  />
                </div>
              </div>
            </div>
            {submissionAttempt &&
            (oldPassword === "" || newPassword === "" || confirmNewPassword === "") ? (
              <p className="help is-danger">
                Please complete the highlighted fields before submitting.
              </p>
            ) : changePasswordResultErrors ? (
              // Map all of the error messages from profile update and display at bottom of form.
              Object.keys(changePasswordResultErrors).map((key) => {
                const error = changePasswordResultErrors[key];
                const firstError = error[0];
                if (!firstError) return null;
                return (
                  <p key={`change-pwd-err-${firstError.code}`} className="help is-danger">
                    {firstError.message}
                  </p>
                );
              })
            ) : changePasswordResult?.success ? (
              <p className="help is-success">Password successfully changed!</p>
            ) : null}
          </section>
          <footer className="modal-card-foot" style={{ gap: "10px" }}>
            <button className={`button is-primary ${loading && "is-loading"}`} type="submit">
              Change
            </button>
            <button type="button" className="button" onClick={closeModal}>
              Close
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
