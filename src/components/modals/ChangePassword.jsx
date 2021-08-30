import React, { useContext, useState } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { useMutation, gql } from "@apollo/client";
import { useCookies } from "react-cookie";

const ChangePassword = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [, setCookie] = useCookies(["refreshToken"]);

  // State for password updates.
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [changePassword] = useMutation(gql`
    mutation ChangePassword($oldPassword: String!, $newPassword: String!, $confirmNewPassword: String!) {
      passwordChange(oldPassword: $oldPassword, newPassword1: $newPassword, newPassword2: $confirmNewPassword) {
        success
        errors
        token
        refreshToken
      }
    }
  `);

  const [changePasswordResult, setChangePasswordResult] = useState(null);
  const [changePasswordResultErrors, setChangePasswordResultErrors] = useState(null);

  // Track whether user has attempted to submit the update profile form.
  const [submissionAttempt, setSubmissionAttempt] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.

    if (oldPassword !== "" && newPassword !== "" && confirmNewPassword !== "") {
      setSubmissionAttempt(false);
      setLoading(true);
      changePassword({ variables: { oldPassword, newPassword, confirmNewPassword } }).then((result) => {
        setChangePasswordResult(result);
        if (!result.data.passwordChange.errors) {
          setChangePasswordResultErrors(null);
          if (result.data.passwordChange.token) localStorage.setItem("accessToken", result.data.passwordChange.token);
          if (result.data.passwordChange.refreshToken) setCookie("refreshToken", result.data.passwordChange.refreshToken, { path: "/", secure: true }); //! SET secure : true in production
        } else {
          setChangePasswordResultErrors(result.data.passwordChange.errors);
        }
        setLoading(false);
      });
    } else {
      setChangePasswordResult({ ...changePasswordResultErrors, misc: { 0: { message: "Please complete the highlighted fields before submitting." } } });
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
            <a
              className="delete"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setChangePasswordResult(null);
                setChangePasswordResultErrors(null);
              }}
            />
          </header>
          <section className="modal-card-body">
            <div className="content">
              <div className="field">
                <label className="label">Old Password</label>
                <div className="control">
                  <input
                    className={`input ${
                      (submissionAttempt && oldPassword === "") || (changePasswordResultErrors && Object.keys(changePasswordResultErrors).includes("oldPassword")) ? "is-danger" : null
                    }`}
                    type="password"
                    onInput={(event) => setOldPassword(event.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">New Password</label>
                <div className="control">
                  <input
                    className={`input ${
                      (submissionAttempt && newPassword === "") ||
                      (changePasswordResultErrors && (Object.keys(changePasswordResultErrors).includes("newPassword1") || Object.keys(changePasswordResultErrors).includes("newPassword2")))
                        ? "is-danger"
                        : null
                    }`}
                    type="password"
                    onInput={(event) => setNewPassword(event.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Confirm New Password</label>
                <div className="control">
                  <input
                    className={`input ${
                      (submissionAttempt && confirmNewPassword === "") ||
                      (changePasswordResultErrors && (Object.keys(changePasswordResultErrors).includes("newPassword1") || Object.keys(changePasswordResultErrors).includes("newPassword2")))
                        ? "is-danger"
                        : null
                    }`}
                    type="password"
                    onInput={(event) => setConfirmNewPassword(event.target.value)}
                  />
                </div>
              </div>
            </div>
            {submissionAttempt && (oldPassword === "" || newPassword === "" || confirmNewPassword === "") ? (
              <p className="help is-danger">Please complete the highlighted fields before submitting.</p>
            ) : changePasswordResultErrors ? (
              // Map all of the error messages from profile update and display at bottom of form.
              Object.keys(changePasswordResultErrors).map((key) => {
                let error = changePasswordResultErrors[key];
                return (
                  <p key={`change-pwd-err-${error[0].code}`} className="help is-danger">
                    {error[0].message}
                  </p>
                );
              })
            ) : changePasswordResult && changePasswordResult.data && changePasswordResult.data.passwordChange.success ? (
              <p className="help is-success">Password successfully changed!</p>
            ) : null}
          </section>
          <footer className="modal-card-foot">
            <button className={`button is-primary ${loading && "is-loading"}`} type="submit">
              Change
            </button>
            <a
              className="button"
              href="/#"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setChangePasswordResult(null);
                setChangePasswordResultErrors(null);
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

export default ChangePassword;
