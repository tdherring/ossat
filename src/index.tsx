import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { CookiesProvider } from "react-cookie";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";
import { demoApolloLink } from "./lib/demoApolloLink";
import { isDemoMode } from "./lib/demoMode";
import { BrowserRouter } from "react-router-dom";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URI ?? "http://localhost:8000/graphql",
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const accessToken = localStorage.getItem("accessToken");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `JWT ${accessToken}` : "",
    },
  };
});

const client = new ApolloClient({
  link: isDemoMode ? demoApolloLink : authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <CookiesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CookiesProvider>
    </ApolloProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.debug))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
