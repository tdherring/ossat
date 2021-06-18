import React, { createContext, useState } from "react";

export const ModalContext = createContext();

export const ModalProvider = (props) => {
  const [activeModal, setActiveModal] = useState(null);

  return <ModalContext.Provider value={[activeModal, setActiveModal]}>{props.children}</ModalContext.Provider>;
};