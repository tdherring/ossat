import type { ReportCallback } from "web-vitals";

const reportWebVitals = (onPerfEntry?: ReportCallback) => {
  if (onPerfEntry) {
    import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFCP(onPerfEntry);
      onINP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
