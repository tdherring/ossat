import Header from "./components/Header";
import Footer from "./components/Footer";
import React from "react";
import { ModalProvider } from "./contexts/ModalContext";
import Welcome from "./components/Welcome";

function App() {
  return (
    <>
      <ModalProvider>
        <Header />
      </ModalProvider>

      <Welcome />

      <Footer />
    </>
  );
}

export default App;
