import { useEffect, useState } from "react";

export default function useThemeSwitcher(): [
  string,
  React.Dispatch<React.SetStateAction<string>>
] {
  const perferDarkQuery = "(perfer-color-scheme: dark)";
  const [themeMode, setThemeMode] = useState<string>("");

  useEffect(() => {
    const mediaQuery = window.matchMedia(perferDarkQuery);
    const userPref = window.localStorage.getItem("theme");

    const handleChange = () => {
      if (userPref) {
        let check = userPref === "dark" ? "dark" : "light";
        setThemeMode(check);

        if (check === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        let check = mediaQuery.matches ? "dark" : "light";
        setThemeMode(check);

        if (check === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    handleChange();

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (themeMode === "dark") {
      window.localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      window.localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  return [themeMode, setThemeMode];
}
