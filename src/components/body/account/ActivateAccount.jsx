import React, { useState, useEffect, useContext } from "react";
import { useMutation, gql } from "@apollo/client";
import { ModalContext } from "../../../contexts/ModalContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

const ActivateAccount = ({ token }) => {
  const [, setActiveModal] = useContext(ModalContext);

  const [resendEmail, setResendEmail] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  const [activateAccount] = useMutation(gql`
    mutation VerifyAccount($token: String!) {
      verifyAccount(token: $token) {
        success
        errors
      }
    }
  `);

  const [activateResult, setActivateResult] = useState(null);
  const [activateResultErrors, setActivateResultErrors] = useState(null);

  const [resendActivationEmail] = useMutation(gql`
    mutation ResendActivationEmail($email: String!) {
      resendActivationEmail(email: $email) {
        success
        errors
      }
    }
  `);

  const [resendResult, setResendResult] = useState(null);
  const [resendResultErrors, setResendResultErrors] = useState(null);

  useEffect(() => {
    activateAccount({ variables: { token } }).then((result) => {
      setActivateResult(result);
      if (!result.data.verifyAccount.errors) {
        setActivateResultErrors(null);
      } else {
        setActivateResultErrors(result.data.verifyAccount.errors);
      }
    });
  }, [activateAccount, token]);

  return (
    <div className="tile is-vertical is-parent is-12 container">
      <div className="tile is-child box">
        <p className="title is-size-4">Account Activation</p>
        <hr className="is-divider mt-2" />
        {activateResult === null ? (
          <span className="has-text-vcentered">
            <p className="py-0 my-0">
              <button className="button is-primary is-outlined is-loading is-inverted"></button>
            </p>
          </span>
        ) : activateResultErrors ? (
          // Map all of the error messages from activation and display.
          Object.keys(activateResultErrors).map((key) => {
            let error = activateResultErrors[key];
            if (error[0].code === "invalid_token" || error[0].code === "expired_token")
              return (
                <span key={`activate-err-${error[0].code}`}>
                  <p className="has-text-danger">{error[0].message}</p>
                  <div className="field has-addons mr-3 pt-3">
                    <span className="control">
                      <input
                        placeholder="Email Address"
                        className="input"
                        type="email"
                        onChange={(event) => {
                          setResendEmail(event.target.value);
                        }}
                      />
                    </span>
                    <span className="control">
                      <a
                        className={`button is-primary ${resendLoading && "is-loading"}`}
                        href="/#"
                        onClick={(event) => {
                          event.preventDefault();
                          setResendLoading(true);
                          resendActivationEmail({ variables: { email: resendEmail } }).then((result) => {
                            setResendLoading(false);
                            setResendResult(result);
                            console.log(result);
                            if (!result.data.resendActivationEmail.errors) {
                              setResendResultErrors(null);
                            } else {
                              setResendResultErrors(result.data.resendActivationEmail.errors);
                            }
                          });
                        }}
                      >
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                        Resend Activation Email
                      </a>
                    </span>
                  </div>
                  {resendResultErrors ? (
                    Object.keys(resendResultErrors).map((key) => {
                      let error = resendResultErrors[key];
                      return (
                        <p key={`resend-err-${error[0].code}`} className="help is-danger">
                          {error[0].message}
                        </p>
                      );
                    })
                  ) : resendResult && resendResult.data.resendActivationEmail.success ? (
                    <p className="help is-success">If an account with the email provided exists, a new activation email was sent. Please check your inbox.</p>
                  ) : null}
                </span>
              );
            return <p className="has-text-danger">{error[0].message}</p>;
          })
        ) : activateResult && activateResult.data.verifyAccount.success ? (
          <p className="has-text-success">
            Account successfully activated! Click{" "}
            <a
              href="/#"
              onClick={(event) => {
                event.preventDefault();
                setActiveModal("logIn");
              }}
            >
              here
            </a>{" "}
            to login.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default ActivateAccount;
