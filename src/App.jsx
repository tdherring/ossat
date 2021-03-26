import Header from "./components/Header";
import Footer from "./components/Footer";
import { ModalProvider } from "./contexts/ModalContext";

function App() {
  return (
    <div className="container">
      <ModalProvider>
        <Header />
      </ModalProvider>
      <Footer />
    </div>
  );
}

export default App;
