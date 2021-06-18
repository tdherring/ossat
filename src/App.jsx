import Header from "./components/Header";
import Footer from "./components/Footer";
import React from "react";
import { ModalProvider } from "./contexts/ModalContext";
import { ResizeProvider } from "./contexts/ResizeContext";
import Body from "./components/Body";

function App() {
  return (
    <>
      <ResizeProvider>
        <ModalProvider>
          <Header />
          <Body />
        </ModalProvider>
      </ResizeProvider>
      <Footer />
    </>
  );
}

export default App;
