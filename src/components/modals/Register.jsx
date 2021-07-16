import React, { useContext, useState } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { useMutation, gql } from "@apollo/client";

const Register = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  //State for registration.
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // GraphQL mutation to register the user.
  const REGISTER = gql`
    mutation Register($email: String!, $username: String!, $password: String!, $confirmPassword: String!) {
      register(email: $email, username: $username, password1: $password, password2: $confirmPassword) {
        success
        errors
        token
        refreshToken
      }
    }
  `;

  const [register] = useMutation(REGISTER);
  const [registerResult, setRegisterResult] = useState(null);
  const [registerResultErrors, setRegisterResultErrors] = useState({});

  // Track whether user has attempted to submit the registration form.
  const [submissionAttempt, setSubmissionAttempt] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.
    if (!(email === "" || username === "" || password === "" || confirmPassword === "")) {
      setSubmissionAttempt(false);
      register({ variables: { email, username, password, confirmPassword } }).then((result) => {
        setRegisterResult(result);
        if (!result.data.register.errors) {
          setRegisterResultErrors({});
          event.target.reset();
        } else {
          setRegisterResultErrors(result.data.register.errors);
        }
      });
    } else {
      setSubmissionAttempt(true);
    }
  };

  return (
    <div className={`modal p-3 ${activeModal === "register" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <form onSubmit={handleSubmit}>
          <header className="modal-card-head">
            <p className="modal-card-title">Register</p>
            <button
              className="delete"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setRegisterResult(null);
                setRegisterResultErrors({});
              }}
            />
          </header>
          <section className="modal-card-body">
            <div className="content">
              <div className="field">
                <label className="label">Email</label>
                <div className="control">
                  <input
                    className={`input ${(submissionAttempt && email === "") || Object.keys(registerResultErrors).includes("email") ? "is-danger" : null}`}
                    type="email"
                    onInput={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Username</label>
                <div className="control">
                  <input
                    className={`input ${(submissionAttempt && username === "") || Object.keys(registerResultErrors).includes("username") ? "is-danger" : null}`}
                    type="text"
                    onInput={(event) => setUsername(event.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Password</label>
                <div className="control">
                  <input
                    className={`input ${
                      (submissionAttempt && password === "") || Object.keys(registerResultErrors).includes("password1") || Object.keys(registerResultErrors).includes("password2") ? "is-danger" : null
                    }`}
                    type="password"
                    onInput={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Confirm Password</label>
                <div className="control">
                  <input
                    className={`input ${
                      (submissionAttempt && confirmPassword === "") || Object.keys(registerResultErrors).includes("password2") || Object.keys(registerResultErrors).includes("password1")
                        ? "is-danger"
                        : null
                    }`}
                    type="password"
                    onInput={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
              </div>
              {
                // Any fields are empty?
                submissionAttempt && (email === "" || username === "" || password === "" || confirmPassword === "") ? (
                  <p className="help is-danger">Please complete the highlighted fields before submitting.</p>
                ) : // Any other errors returned by API?
                Object.keys(registerResultErrors).length > 0 ? (
                  // Map all of the error messages from registration and display at bottom of form.
                  Object.keys(registerResultErrors).map((key) => {
                    let error = registerResultErrors[key];
                    return <p className="help is-danger">{error[0].message}</p>;
                  })
                ) : (
                  //Successfully registered.
                  registerResult && registerResult.data.register.success && <p className="help is-success">User successfully registered! Please check your email to verify your account.</p>
                )
              }
            </div>
          </section>
          <footer className="modal-card-foot">
            <button className="button is-primary" type="submit">
              Register
            </button>
            <a
              className="button"
              href="/#"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setRegisterResult(null);
                setRegisterResultErrors({});
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

export default Register;
