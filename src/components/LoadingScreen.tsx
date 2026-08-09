import fullLogo from "../assets/images/full-logo.svg";
import fullLogoDark from "../assets/images/full-logo-dark.svg";

const LoadingScreen = ({ theme }: { theme: "light" | "dark" }) => (
  <section
    className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 text-foreground"
    aria-busy="true"
    aria-live="polite"
  >
    <main className="relative w-full max-w-xl text-center" role="status">
      <img
        className="mx-auto w-full max-w-md"
        src={theme === "dark" ? fullLogoDark : fullLogo}
        alt="OSSAT"
      />

      <div className="mx-auto mt-9 max-w-xs">
        <div className="h-1 w-full overflow-hidden bg-muted">
          <div className="h-full w-1/3 animate-loader-progress bg-primary" />
        </div>
        <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Loading
        </p>
      </div>
    </main>
  </section>
);

export default LoadingScreen;
