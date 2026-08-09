export type Theme = "light" | "dark";
export type ThemePreference = "auto" | Theme;

export const getInitialThemePreference = (): ThemePreference => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "auto" || savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  return "auto";
};

export const resolveTheme = (
  preference: ThemePreference,
  prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches,
): Theme => (preference === "auto" ? (prefersDark ? "dark" : "light") : preference);

export const getInitialTheme = (): Theme => resolveTheme(getInitialThemePreference());
