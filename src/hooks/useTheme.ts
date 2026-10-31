import { useCallback, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

const KEY = "theme"

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(KEY)
    if (value === "light" || value === "dark" || value === "system") return value
  } catch {
    // storage may be unavailable
  }
  return "system"
}

function isDarkFor(theme: Theme) {
  return theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
}

function apply(theme: Theme) {
  const dark = isDarkFor(theme)
  document.documentElement.classList.toggle("dark", dark)
  document.documentElement.style.colorScheme = dark ? "dark" : "light"
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme)

  useEffect(() => {
    apply(theme)
    if (theme !== "system") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => apply("system")
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // ignore: the theme still changes for this visit
    }
    setThemeState(next)
  }, [])

  return { theme, setTheme, isDark: isDarkFor(theme) }
}