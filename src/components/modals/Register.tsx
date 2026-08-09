import { useContext, useState, type FormEvent } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import type { ApiErrors, MutationPayload } from "../../types/api";

interface RegisterPayload extends MutationPayload {
  token: string | null;
  refreshToken: string | null;
}

const Register = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  //State for registration.
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // GraphQL mutation to register the user.
  const [register] = useMutation<
    { register: RegisterPayload },
    { email: string; username: string; password: string; confirmPassword: string }
  >(gql`
    mutation Register(
      $email: String!
      $username: String!
      $password: String!
      $confirmPassword: String!
    ) {
      register(
        email: $email
        username: $username
        password1: $password
        password2: $confirmPassword
      ) {
        success
        errors
        token
        refreshToken
      }
    }
  `);
  const [registerResult, setRegisterResult] = useState<RegisterPayload | null>(null);
  const [registerResultErrors, setRegisterResultErrors] = useState<ApiErrors>({});

  // Track whether user has attempted to submit the registration form.
  const [submissionAttempt, setSubmissionAttempt] = useState(false);
  const closeModal = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setSubmissionAttempt(false);
    setRegisterResult(null);
    setRegisterResultErrors({});
    setActiveModal(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.
    const form = event.currentTarget;
    if (!(email === "" || username === "" || password === "" || confirmPassword === "")) {
      setSubmissionAttempt(false);
      register({ variables: { email, username, password, confirmPassword } }).then((result) => {
        const payload = result.data?.register;
        if (!payload) return;
        setRegisterResult(payload);
        if (!payload.errors) {
          setRegisterResultErrors({});
          form.reset();
          setEmail("");
          setUsername("");
          setPassword("");
          setConfirmPassword("");
        } else {
          setRegisterResultErrors(payload.errors);
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
              type="button"
              className="delete"
              aria-label="Close registration dialog"
              onClick={closeModal}
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
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Username</label>
                <div className="control">
                  <input
                    className={`input ${(submissionAttempt && username === "") || Object.keys(registerResultErrors).includes("username") ? "is-danger" : null}`}
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.currentTarget.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Password</label>
                <div className="control">
                  <input
                    className={`input ${
                      (submissionAttempt && password === "") ||
                      Object.keys(registerResultErrors).includes("password1") ||
                      Object.keys(registerResultErrors).includes("password2")
                        ? "is-danger"
                        : null
                    }`}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Confirm Password</label>
                <div className="control">
                  <input
                    className={`input ${
                      (submissionAttempt && confirmPassword === "") ||
                      Object.keys(registerResultErrors).includes("password2") ||
                      Object.keys(registerResultErrors).includes("password1")
                        ? "is-danger"
                        : null
                    }`}
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                  />
                </div>
              </div>
              {
                // Any fields are empty?
                submissionAttempt &&
                (email === "" || username === "" || password === "" || confirmPassword === "") ? (
                  <p className="help is-danger">
                    Please complete the highlighted fields before submitting.
                  </p>
                ) : // Any other errors returned by API?
                Object.keys(registerResultErrors).length > 0 ? (
                  // Map all of the error messages from registration and display at bottom of form.
                  Object.keys(registerResultErrors).map((key) => {
                    const error = registerResultErrors[key];
                    return (
                      <p key={`register-err-${error[0].code}`} className="help is-danger">
                        {error[0].message}
                      </p>
                    );
                  })
                ) : (
                  //Successfully registered.
                  registerResult?.success && (
                    <p className="help is-success">
                      User successfully registered! Please check your email to verify your account.
                    </p>
                  )
                )
              }
            </div>
          </section>
          <footer className="modal-card-foot" style={{ gap: "10px" }}>
            <button className="button is-primary" type="submit">
              Register
            </button>
            <button type="button" className="button" onClick={closeModal}>
              Cancel
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default Register;
