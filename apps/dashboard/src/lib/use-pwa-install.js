import { useState, useEffect, useCallback } from "react";

/**
 * Hook that captures the browser's PWA install prompt.
 *
 * Returns:
 * - canInstall: true when the browser offers a PWA install option
 * - install(): triggers the native install dialog
 * - isInstalled: true if the app is already running as a PWA
 */
export function usePwaInstall() {
  const [prompt, setPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect when the PWA gets installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!prompt) return false;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setPrompt(null);
      return true;
    }
    return false;
  }, [prompt]);

  return {
    canInstall: prompt !== null,
    install,
    isInstalled,
  };
}
