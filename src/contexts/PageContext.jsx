import React, { createContext, useState } from "react";

export const PageContext = createContext();

export const PageProvider = (props) => {
  const [activePage, setActivePage] = useState("home");

  return <PageContext.Provider value={[activePage, setActivePage]}>{props.children}</PageContext.Provider>;
};
