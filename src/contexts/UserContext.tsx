import {
  createContext,
  useState,
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { gql } from "@apollo/client";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { useCookies } from "react-cookie";
import { demoUser } from "../lib/demoData";
import { isApiMode, isDemoMode } from "../lib/demoMode";

type StatePair<T> = [T, Dispatch<SetStateAction<T>>];
type UserContextValue = {
  loggedIn: StatePair<boolean>;
  firstName: StatePair<string | null>;
  lastName: StatePair<string | null>;
  username: StatePair<string | null>;
  email: StatePair<string | null>;
};

type UserInfo = {
  me: { id: string; username: string; firstName: string; lastName: string; email: string } | null;
};

type RefreshTokenData = {
  refreshToken: {
    token: string | null;
    refreshToken: string | null;
    payload: { username: string } | null;
  };
};

export const UserContext = createContext<UserContextValue>(null!);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(isDemoMode);
  const [firstName, setFirstName] = useState<string | null>(isDemoMode ? demoUser.firstName : null);
  const [lastName, setLastName] = useState<string | null>(isDemoMode ? demoUser.lastName : null);
  const [username, setUsername] = useState<string | null>(isDemoMode ? demoUser.username : null);
  const [email, setEmail] = useState<string | null>(isDemoMode ? demoUser.email : null);
  const [cookies, setCookie, removeCookie] = useCookies(["refreshToken"]);
  const REFRESH_INTERVAL = 240000;

  // GraphQL mutation to refresh the access token.
  const [refreshToken] = useMutation<RefreshTokenData, { token: string }>(gql`
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
      .query<UserInfo>({
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
        if (result.data?.me) {
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
    if (isDemoMode) {
      setLoggedIn(true);
      setFirstName(demoUser.firstName);
      setLastName(demoUser.lastName);
      setUsername(demoUser.username);
      setEmail(demoUser.email);
      return undefined;
    }

    if (!isApiMode) {
      invalidate();
      return undefined;
    }

    const attemptTokenRefresh = () => {
      if (cookies.refreshToken) {
        console.debug("Refreshing access token!");
        refreshToken({ variables: { token: cookies.refreshToken } }).then((result) => {
          const refreshed = result.data?.refreshToken;
          if (!refreshed) {
            invalidate();
            return;
          }
          if (refreshed.token) {
            // Valid query? Update the access token.
            localStorage.setItem("accessToken", refreshed.token);
            validate();
          } else {
            // Invalid or malicious query? Drop the session.
            localStorage.removeItem("accessToken");
            invalidate();
          }

          if (refreshed.refreshToken) {
            // Valid query? Update the refresh token.
            setCookie("refreshToken", refreshed.refreshToken, { path: "/" }); //! SET secure : true in production

            validate();
          } else {
            // Invalid or malicious query? Drop the refresh token.
            removeCookie("refreshToken");
            invalidate();
          }

          if (refreshed.payload) setUsername(refreshed.payload.username);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {children}
    </UserContext.Provider>
  );
};
