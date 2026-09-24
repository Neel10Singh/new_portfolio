"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getLenis } from "@/components/SmoothScrollProvider";

const GREETINGS = [
  "Hello",
  "Bonjour",
  "Hola",
  "Ciao",
  "Olá",
  "Hallo",
  "नमस्ते",
  "こんにちは",
  "안녕하세요",
  "你好",
  "Привет",
  "مرحبا",
];

const WORD_INTERVAL_MS = 300;
// Keep the loader up long enough to show a few greetings, even on fast loads.
const MIN_VISIBLE_MS = 2000;
// Never block the page forever if the load event is slow to fire.
const MAX_VISIBLE_MS = 10000;

// Set by the inline script in app/layout.tsx for in-site navigations. It never
// changes after that script runs, so there is nothing to subscribe to.
const subscribe = () => () => {};
const getSkip = () =>
  document.documentElement.hasAttribute("data-skip-loader");
const getServerSkip = () => false;

export default function LoadingScreen() {
  const [index, setIndex] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);

  const skip = useSyncExternalStore(subscribe, getSkip, getServerSkip);
  const isLoading = !skip && !pageLoaded;

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % GREETINGS.length);
    }, WORD_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (skip) return;

    const start = performance.now();
    let hideTimer;

    const finish = () => {
      const elapsed = performance.now() - start;
      hideTimer = setTimeout(
        () => setPageLoaded(true),
        Math.max(0, MIN_VISIBLE_MS - elapsed)
      );
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    const fallbackTimer = setTimeout(() => setPageLoaded(true), MAX_VISIBLE_MS);

    return () => {
      window.removeEventListener("load", finish);
      clearTimeout(hideTimer);
      clearTimeout(fallbackTimer);
    };
  }, [skip]);

  // Lock scrolling while the loader is visible.
  useEffect(() => {
    if (!isLoading) return;

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    // Lenis is created in a sibling effect, so wait a frame before stopping it.
    const rafId = requestAnimationFrame(() => getLenis()?.stop());

    return () => {
      cancelAnimationFrame(rafId);
      html.style.overflow = previousOverflow;
      getLenis()?.start();
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-screen"
          className="loading-screen fixed inset-0 z-[10000] flex items-center justify-center bg-black text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-live="polite"
          aria-label="Loading"
        >
          <div className="flex items-center gap-4 text-4xl font-medium md:text-6xl">
            <span className="h-3 w-3 shrink-0 rounded-full bg-white md:h-4 md:w-4" />
            <span>{GREETINGS[index]}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
