import { useContext, useState, useEffect, useRef, type FormEvent } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { UserContext } from "../../contexts/UserContext";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useCookies } from "react-cookie";
import type { ApiErrors, MutationPayload } from "../../types/api";

interface AuthPayload extends MutationPayload {
  token: string;
  refreshToken: string;
  user: { id: string; username: string; firstName: string; lastName: string; email: string };
}
type LogInData = { tokenAuth: AuthPayload };

const LogIn = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [, setFirstName] = useContext(UserContext).firstName;
  const [, setLastName] = useContext(UserContext).lastName;
  const [, setUsername] = useContext(UserContext).username;
  const [, setLoggedIn] = useContext(UserContext).loggedIn;
  const [, setEmail] = useContext(UserContext).email;

  const [, setCookie] = useCookies(["refreshToken"]);

  // State for login.
  const [_username, _setUsername] = useState("");
  const [password, setPassword] = useState("");

  // GraphQL mutation to login.
  const [logIn, { loading }] = useMutation<LogInData, { username: string; password: string }>(gql`
    mutation LogIn($username: String!, $password: String!) {
      tokenAuth(username: $username, password: $password) {
        success
        errors
        token
        refreshToken
        user {
          id
          username
          firstName
          lastName
          email
        }
      }
    }
  `);

  const [logInResult, setLogInResult] = useState<AuthPayload | null>(null);
  const [logInResultErrors, setLogInResultErrors] = useState<ApiErrors>({});

  // Track whether user has attempted to submit the login form.
  const [submissionAttempt, setSubmissionAttempt] = useState(false);
  const requestIdRef = useRef(0);
  const closeModal = () => {
    requestIdRef.current += 1;
    _setUsername("");
    setPassword("");
    setSubmissionAttempt(false);
    setLogInResult(null);
    setLogInResultErrors({});
    setActiveModal(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.
    if (loading) return;
    if (!(_username === "" || password === "")) {
      setSubmissionAttempt(false);
      const requestId = ++requestIdRef.current;
      logIn({ variables: { username: _username, password } })
        .then((result) => {
          if (requestId !== requestIdRef.current) return;
          const payload = result.data?.tokenAuth;
          if (!payload) {
            setLogInResultErrors({
              nonFieldErrors: [
                { code: "request_failed", message: "Login failed. Please try again." },
              ],
            });
            return;
          }
          setLogInResult(payload);
          if (!payload.errors) {
            setLogInResultErrors({});
            localStorage.setItem("accessToken", payload.token);
            setCookie("refreshToken", payload.refreshToken, {
              path: "/",
              sameSite: "strict",
              secure: import.meta.env.PROD,
            });
            _setUsername("");
            setPassword("");
          } else {
            setLogInResultErrors(payload.errors);
          }
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setLogInResultErrors({
            nonFieldErrors: [
              { code: "request_failed", message: "Login failed. Please try again." },
            ],
          });
        });
    } else {
      setSubmissionAttempt(true);
    }
  };

  // Set state vars for storage of user info.
  useEffect(() => {
    if (logInResult?.success) {
      setLoggedIn(true);
      setFirstName(logInResult.user.firstName);
      setLastName(logInResult.user.lastName);
      setUsername(logInResult.user.username);
      setEmail(logInResult.user.email);
      setActiveModal(null);
    }
  }, [logInResult, setFirstName, setLastName, setUsername, setEmail, setLoggedIn, setActiveModal]);

  return (
    <div className={`modal p-3 ${activeModal === "logIn" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <form onSubmit={handleSubmit}>
          <header className="modal-card-head">
            <p className="modal-card-title">Log In</p>
            <button
              type="button"
              className="delete"
              aria-label="Close login dialog"
              onClick={closeModal}
            />
          </header>
          <section className="modal-card-body">
            <div className="content">
              <div className="field">
                <label className="label">Username</label>
                <div className="control">
                  <input
                    className={`input ${(submissionAttempt && _username === "") || Object.keys(logInResultErrors).includes("username") ? "is-danger" : null}`}
                    type="text"
                    value={_username}
                    onChange={(event) => _setUsername(event.currentTarget.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Password</label>
                <div className="control">
                  <input
                    className={`input ${(submissionAttempt && password === "") || Object.keys(logInResultErrors).includes("password") ? "is-danger" : null}`}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                  />
                </div>
              </div>
              {
                // Any fields are empty?
                submissionAttempt && (_username === "" || password === "") ? (
                  <p className="help is-danger">
                    Please complete the highlighted fields before submitting.
                  </p>
                ) : // Any other errors returned by API?
                Object.keys(logInResultErrors).length > 0 ? (
                  // Map all of the error messages from log in and display at bottom of form.
                  Object.keys(logInResultErrors).map((key) => {
                    const error = logInResultErrors[key];
                    return (
                      <p key={`login-err-${error[0].code}`} className="help is-danger">
                        {error[0].message}
                      </p>
                    );
                  })
                ) : null
              }
            </div>
            <button
              type="button"
              className="button is-ghost"
              onClick={() => setActiveModal("requestPasswordReset")}
            >
              Forgot Password?
            </button>
          </section>
          <footer className="modal-card-foot" style={{ gap: "10px" }}>
            <button className="button is-primary" type="submit" disabled={loading}>
              Login
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

export default LogIn;
