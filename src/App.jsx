import Header from "./components/Header";
import Footer from "./components/Footer";
import React, { useState, useEffect } from "react";
import { ModalProvider } from "./contexts/ModalContext";
import { ResizeProvider } from "./contexts/ResizeContext";
import { PageProvider } from "./contexts/PageContext";
import { UserProvider } from "./contexts/UserContext";
import Body from "./components/Body";
import fullLogo from "./assets/images/full-logo.svg";
import { useCookies } from "react-cookie";

function App() {
  const [isLoading, setLoading] = useState(false);
  const [cookies, setCookie] = useCookies(["splashShown"]);

  useEffect(() => {
    if (!cookies.splashShown) {
      setLoading(true);
      setTimeout(function () {
        setCookie("splashShown", true, { path: "/" });
        setLoading(false);
      }, 2000);
    }
  }, []);

  return isLoading ? (
    <section className="hero has-background-grey-lighter is-fullheight">
      <div className="hero-body">
        <div className="container has-text-centered p-5" style={{ width: "600px", maxWidth: "600px" }}>
          <img src={fullLogo} alt="OSSAT Logo" style={{ width: "100%", maxWidth: "100%" }}></img>
          <progress className="progress is-primary is-centered mt-5" max="100">
            30%
          </progress>
        </div>
      </div>
    </section>
  ) : (
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
