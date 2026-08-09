const dataMode = import.meta.env.VITE_DATA_MODE;

export const isDemoMode = dataMode === "demo";
export const isApiMode = dataMode === "api";
