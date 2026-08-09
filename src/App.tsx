import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect, useLayoutEffect, useState } from "react";
import { ModalProvider } from "./contexts/ModalContext";
import { UserProvider } from "./contexts/UserContext";
import Body from "./components/Body";
import LoadingScreen from "./components/LoadingScreen";
import { getInitialTheme } from "./lib/theme";

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [initialTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = initialTheme;
  }, [initialTheme]);

  useEffect(() => {
    const splashTimer = setTimeout(() => setSplashDone(true), 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  return (
    <>
      <UserProvider>
        <ModalProvider>
          <Header />
          <Body />
          <Footer />
        </ModalProvider>
      </UserProvider>
      {!splashDone && <LoadingScreen theme={initialTheme} />}
    </>
  );
}

export default App;
