import Header from "./components/Header";
import Footer from "./components/Footer";
import React from "react";
import { ModalProvider } from "./contexts/ModalContext";
import Body from "./components/Body";

function App() {
  return (
    <>
      <ModalProvider>
        <Header />
      </ModalProvider>

      <Body />

      <Footer />
    </>
  );
}

export default App;
