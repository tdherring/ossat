import React, { createContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie";

export const PageContext = createContext();

export const PageProvider = (props) => {
  const [cookies, setCookie] = useCookies(["lastPage"]);
  const [activePage, setActivePage] = useState(cookies["lastPage"] || "home");

  useEffect(() => {
    setCookie("lastPage", activePage, { path: "/" });
  }, [activePage]);

  return <PageContext.Provider value={[activePage, setActivePage]}>{props.children}</PageContext.Provider>;
};
