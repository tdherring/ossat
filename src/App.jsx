import Header from "./components/Header";
import Footer from "./components/Footer";
import React from "react";
import { ModalProvider } from "./contexts/ModalContext";
import { ResizeProvider } from "./contexts/ResizeContext";
import { PageProvider } from "./contexts/PageContext";
import Body from "./components/Body";

function App() {
  return (
    <>
      <ResizeProvider>
        <PageProvider>
          <ModalProvider>
            <Header />
            <Body />
          </ModalProvider>
        </PageProvider>
      </ResizeProvider>
      <Footer />
    </>
  );
}

export default App;
