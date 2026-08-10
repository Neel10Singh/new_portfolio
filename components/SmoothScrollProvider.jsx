"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
    duration: 1.3,
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.2,
    });

    let raf;

    function animate(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return children;
}