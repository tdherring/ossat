import Header from "./components/Header";
import Footer from "./components/Footer";
import React from "react";
import { ModalProvider } from "./contexts/ModalContext";
import { ResizeProvider } from "./contexts/ResizeContext";
import { PageProvider } from "./contexts/PageContext";
import { UserProvider } from "./contexts/UserContext";
import Body from "./components/Body";

function App() {
  return (
    <>
      <ResizeProvider>
        <UserProvider>
          <PageProvider>
            <ModalProvider>
              <Header />
              <Body />
            </ModalProvider>
          </PageProvider>
        </UserProvider>
      </ResizeProvider>
      <Footer />
    </>
  );
}

export default App;
