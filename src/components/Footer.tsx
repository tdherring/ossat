import { useContext } from "react";
import { Code2, Info } from "lucide-react";
import { ModalContext } from "../contexts/ModalContext";
import { useLocation } from "react-router-dom";
import { simulatorPaths } from "../lib/routes";

const Footer = () => {
  const { pathname } = useLocation();
  const [, setActiveModal] = useContext(ModalContext);

  if (simulatorPaths.has(pathname)) return null;

  return (
    <footer
      className="px-4 pb-7 text-xs text-muted-foreground sm:px-6 lg:pl-[15.5rem] lg:pr-8"
      id="page-footer"
    >
      <div className="mx-auto flex max-w-[1800px] flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-foreground">OSSAT</span> · Operating System Simulation
          &amp; Assessment Tool
        </p>
        <div className="flex items-center gap-5">
          <button
            type="button"
            className="inline-flex items-center gap-2 hover:text-foreground"
            onClick={() => setActiveModal("about")}
          >
            <Info className="h-4 w-4" strokeWidth={1.75} />
            About
          </button>
          <a href="https://kcl.ac.uk">King's College London</a>
          <a
            href="https://github.com/tdherring/OSSAT-Frontend"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            aria-label="View OSSAT source code on GitHub"
          >
            <Code2 className="h-4 w-4" strokeWidth={1.75} />
            Source code
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
