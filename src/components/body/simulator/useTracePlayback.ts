import { useEffect, useState } from "react";

const useTracePlayback = (lastStep: number, speed: number, resetKey?: unknown) => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [lastStep, resetKey]);

  useEffect(() => {
    if (!playing) return undefined;
    if (step >= lastStep) {
      setPlaying(false);
      return undefined;
    }

    const interval = window.setInterval(
      () =>
        setStep((current) => {
          if (current >= lastStep) {
            setPlaying(false);
            return current;
          }
          return current + 1;
        }),
      1000 / Math.max(0.1, speed),
    );

    return () => window.clearInterval(interval);
  }, [lastStep, playing, speed, step]);

  return {
    step,
    playing,
    setStep: (next: number) => {
      setPlaying(false);
      setStep(Math.max(0, Math.min(lastStep, next)));
    },
    toggle: () => {
      if (lastStep === 0) return;
      if (step >= lastStep) setStep(0);
      setPlaying((current) => !current);
    },
    stop: () => setPlaying(false),
  };
};

export default useTracePlayback;
