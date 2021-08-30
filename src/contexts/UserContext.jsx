import React, { createContext, useState, useEffect } from "react";
import { useMutation, gql, useApolloClient } from "@apollo/client";
import { useCookies } from "react-cookie";

export const UserContext = createContext();

export const UserProvider = (props) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["refreshToken"]);
  const REFRESH_INTERVAL = 240000;

  // GraphQL mutation to refresh the access token.
  const [refreshToken] = useMutation(gql`
    mutation RefreshToken($token: String!) {
      refreshToken(refreshToken: $token) {
        token
        refreshToken
        payload
      }
    }
  `);

  const client = useApolloClient();

  const validate = () => {
    setLoggedIn(true);
    // GraphQL Query for user information.
    client
      .query({
        query: gql`
          query GetUserInfo {
            me {
              id
              username
              firstName
              lastName
              email
            }
          }
        `,
      })
      .then((result) => {
        if (result.data.me) {
          setFirstName(result.data.me.firstName);
          setLastName(result.data.me.lastName);
          setUsername(result.data.me.username);
          setEmail(result.data.me.email);
        }
      });
  };

  const invalidate = () => {
    setLoggedIn(false);
    setFirstName(null);
    setLastName(null);
    setUsername(null);
    setEmail(null);
  };

  useEffect(() => {
    const attemptTokenRefresh = () => {
      if (cookies.refreshToken) {
        console.log("Refreshing access token!");
        refreshToken({ variables: { token: cookies.refreshToken } }).then((result) => {
          if (result.data.refreshToken.token) {
            // Valid query? Update the access token.
            localStorage.setItem("accessToken", result.data.refreshToken.token);
            validate();
          } else {
            // Invalid or malicious query? Drop the session.
            localStorage.removeItem("accessToken");
            invalidate();
          }

          if (result.data.refreshToken.refreshToken) {
            // Valid query? Update the refresh token.
            setCookie("refreshToken", result.data.refreshToken.refreshToken, { path: "/", secure: true  }); //! SET secure : true in production

            validate();
          } else {
            // Invalid or malicious query? Drop the refresh token.
            removeCookie("refreshToken");
            invalidate();
          }

          result.data.refreshToken.payload && setUsername(result.data.refreshToken.payload.username);
        });
      } else {
        invalidate();
      }
    };

    // Refresh the access token on page load.
    attemptTokenRefresh();

    // Refresh the access token periodically.
    const interval = setInterval(() => {
      attemptTokenRefresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <UserContext.Provider
      value={{
        loggedIn: [loggedIn, setLoggedIn],
        firstName: [firstName, setFirstName],
        lastName: [lastName, setLastName],
        username: [username, setUsername],
        email: [email, setEmail],
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};
