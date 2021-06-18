import React, { createContext, useState, useEffect } from "react";

export const ResizeContext = createContext();

export const ResizeProvider = (props) => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  const updateWidthAndHeight = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };

  useEffect(() => {
    window.addEventListener("resize", updateWidthAndHeight);
    return () => window.removeEventListener("resize", updateWidthAndHeight);
  });

  return <ResizeContext.Provider value={{ width: [width, setWidth], height: [height, setHeight] }}>{props.children}</ResizeContext.Provider>;
};
