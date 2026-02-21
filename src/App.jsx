import Header from "./components/Header";
import Footer from "./components/Footer";
import React, { useEffect, useState } from "react";
import { ModalProvider } from "./contexts/ModalContext";
import { PageProvider } from "./contexts/PageContext";
import { UserProvider } from "./contexts/UserContext";
import { QuizProvider } from "./contexts/QuizContext";
import Body from "./components/Body";
import fullLogo from "./assets/images/full-logo.svg";
import fullLogoDark from "./assets/images/full-logo-dark.svg";

function App() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return !splashDone ? (
    <section className="hero has-background-grey-darker is-fullheight">
      <div className="hero-body">
        <div className="container has-text-centered p-5" style={{ width: "600px", maxWidth: "600px" }}>
          <img src={document.documentElement.dataset.theme === "dark" ? fullLogoDark : fullLogo} alt="OSSAT Logo" style={{ width: "100%", maxWidth: "100%" }}></img>
          <progress className="progress is-primary is-centered mt-5" max="100"></progress>
        </div>
      </div>
    </section>
  ) : (
    <>
      <UserProvider>
        <PageProvider>
          <QuizProvider>
            <ModalProvider>
              <Header />
              <Body />
            </ModalProvider>
          </QuizProvider>
        </PageProvider>
      </UserProvider>
      <Footer />
    </>
  );
}

export default App;
