"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { NeumorphicButton } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Standard next-themes hydration guard: resolvedTheme is unknown until
    // after mount, so the icon must not render (and mismatch the server) before then.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-11 w-11" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <NeumorphicButton
      variant="raised"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </NeumorphicButton>
  );
}
