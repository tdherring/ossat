import {
  createContext,
  useState,
  useEffect,
  useRef,
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
  sessionStatus: "pending" | "authenticated" | "anonymous";
  isActive: StatePair<boolean | null>;
  firstName: StatePair<string | null>;
  lastName: StatePair<string | null>;
  username: StatePair<string | null>;
  email: StatePair<string | null>;
};

type UserInfo = {
  me: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  } | null;
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
  const [sessionStatus, setSessionStatus] = useState<"pending" | "authenticated" | "anonymous">(
    isDemoMode ? "authenticated" : isApiMode ? "pending" : "anonymous",
  );
  const [isActive, setIsActive] = useState<boolean | null>(isDemoMode ? true : null);
  const [firstName, setFirstName] = useState<string | null>(isDemoMode ? demoUser.firstName : null);
  const [lastName, setLastName] = useState<string | null>(isDemoMode ? demoUser.lastName : null);
  const [username, setUsername] = useState<string | null>(isDemoMode ? demoUser.username : null);
  const [email, setEmail] = useState<string | null>(isDemoMode ? demoUser.email : null);
  const [cookies, setCookie, removeCookie] = useCookies(["refreshToken"]);
  const refreshTokenRef = useRef(cookies.refreshToken);
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
    setSessionStatus("authenticated");
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
              isActive
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
          setIsActive(result.data.me.isActive);
        }
      });
  };

  const invalidate = () => {
    setLoggedIn(false);
    setSessionStatus("anonymous");
    setFirstName(null);
    setLastName(null);
    setUsername(null);
    setEmail(null);
    setIsActive(null);
  };

  useEffect(() => {
    refreshTokenRef.current = cookies.refreshToken;
  }, [cookies.refreshToken]);

  useEffect(() => {
    if (isDemoMode) {
      setLoggedIn(true);
      setFirstName(demoUser.firstName);
      setLastName(demoUser.lastName);
      setUsername(demoUser.username);
      setEmail(demoUser.email);
      setIsActive(true);
      setSessionStatus("authenticated");
      return undefined;
    }

    if (!isApiMode) {
      invalidate();
      return undefined;
    }

    const attemptTokenRefresh = () => {
      const currentRefreshToken = refreshTokenRef.current;
      if (currentRefreshToken) {
        console.debug("Refreshing access token!");
        refreshToken({ variables: { token: currentRefreshToken } })
          .then((result) => {
            const refreshed = result.data?.refreshToken;
            if (!refreshed?.token || !refreshed.refreshToken) {
              localStorage.removeItem("accessToken");
              removeCookie("refreshToken");
              invalidate();
              return;
            }

            localStorage.setItem("accessToken", refreshed.token);
            setCookie("refreshToken", refreshed.refreshToken, {
              path: "/",
              sameSite: "strict",
              secure: import.meta.env.PROD,
            });
            refreshTokenRef.current = refreshed.refreshToken;
            if (refreshed.payload) setUsername(refreshed.payload.username);
            validate();
          })
          .catch(() => {
            localStorage.removeItem("accessToken");
            removeCookie("refreshToken");
            invalidate();
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
        sessionStatus,
        isActive: [isActive, setIsActive],
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
