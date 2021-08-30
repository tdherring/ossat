import React, { useContext, useState, useEffect } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { UserContext } from "../../contexts/UserContext";
import { useMutation, gql } from "@apollo/client";
import { useCookies } from "react-cookie";

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
  const [logIn] = useMutation(gql`
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

  const [logInResult, setLogInResult] = useState(null);
  const [logInResultErrors, setLogInResultErrors] = useState({});

  // Track whether user has attempted to submit the login form.
  const [submissionAttempt, setSubmissionAttempt] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the page from refreshing upon submission.
    if (!(_username === "" || password === "")) {
      setSubmissionAttempt(false);
      logIn({ variables: { username: _username, password } }).then((result) => {
        setLogInResult(result);
        if (!result.data.tokenAuth.errors) {
          setLogInResultErrors({});
          localStorage.setItem("accessToken", result.data.tokenAuth.token);
          setCookie("refreshToken", result.data.tokenAuth.refreshToken, { path: "/" }); //! SET secure : true in production
          event.target.reset();
          _setUsername("");
          setPassword("");
        } else {
          setLogInResultErrors(result.data.tokenAuth.errors);
        }
      });
    } else {
      setSubmissionAttempt(true);
    }
  };

  // Set state vars for storage of user info.
  useEffect(() => {
    if (logInResult && logInResult.data.tokenAuth.success) {
      setLoggedIn(true);
      setFirstName(logInResult.data.tokenAuth.user.firstName);
      setLastName(logInResult.data.tokenAuth.user.lastName);
      setUsername(logInResult.data.tokenAuth.user.username);
      setEmail(logInResult.data.tokenAuth.user.email);
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
            <a
              className="delete"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setLogInResult(null);
                setLogInResultErrors({});
              }}
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
                    onInput={(event) => _setUsername(event.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Password</label>
                <div className="control">
                  <input
                    className={`input ${(submissionAttempt && password === "") || Object.keys(logInResultErrors).includes("password") ? "is-danger" : null}`}
                    type="password"
                    onInput={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>
              {
                // Any fields are empty?
                submissionAttempt && (_username === "" || password === "") ? (
                  <p className="help is-danger">Please complete the highlighted fields before submitting.</p>
                ) : // Any other errors returned by API?
                Object.keys(logInResultErrors).length > 0 ? (
                  // Map all of the error messages from log in and display at bottom of form.
                  Object.keys(logInResultErrors).map((key) => {
                    let error = logInResultErrors[key];
                    return (
                      <p key={`login-err-${error[0].code}`} className="help is-danger">
                        {error[0].message}
                      </p>
                    );
                  })
                ) : null
              }
            </div>
            <a href="/#" onClick={() => setActiveModal("requestPasswordReset")}>
              Forgot Password?
            </a>
          </section>
          <footer className="modal-card-foot">
            <button className="button is-primary" type="submit">
              Login
            </button>
            <a
              className="button"
              href="/#"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setLogInResult(null);
                setLogInResultErrors({});
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

export default LogIn;
