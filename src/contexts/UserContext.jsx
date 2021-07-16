import React, { createContext, useState, useEffect } from "react";
import { useMutation, gql, useApolloClient } from "@apollo/client";
import { useCookies } from "react-cookie";

export const UserContext = createContext();

export const UserProvider = (props) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [username, setUsername] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["refreshToken"]);
  const REFRESH_INTERVAL = 300000;

  const REFRESH_TOKEN = gql`
    mutation RefreshToken($token: String!) {
      refreshToken(refreshToken: $token) {
        token
        refreshToken
      }
    }
  `;

  const [refreshToken] = useMutation(REFRESH_TOKEN);

  const GET_USER_INFO = gql`
    query GetUserInfo {
      me {
        id
        username
        firstName
        lastName
      }
    }
  `;

  const client = useApolloClient();

  const validate = () => {
    setLoggedIn(true);

    client
      .query({
        query: GET_USER_INFO,
      })
      .then((result) => {
        if (result.data.me) {
          setFirstName(result.data.me.firstName);
          setLastName(result.data.me.lastName);
          setUsername(result.data.me.username);
        }
      });
  };

  const invalidate = () => {
    setLoggedIn(false);
    setFirstName(null);
    setLastName(null);
    setUsername(null);
  };

  useEffect(() => {
    const attemptTokenRefresh = () => {
      if (cookies.refreshToken) {
        console.log("Refreshing access token!");
        refreshToken({ variables: { token: cookies.refreshToken } }).then((result) => {
          console.log(result);

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
            setCookie("refreshToken", result.data.refreshToken.refreshToken, { path: "/" }); //! SET secure : true in production
            validate();
          } else {
            // Invalid or malicious query? Drop the refresh token.
            removeCookie("refreshToken");
            invalidate();
          }
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
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};
