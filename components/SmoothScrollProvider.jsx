"use client";

import Lenis from "lenis";
import { useEffect } from "react";

let lenisInstance = null;

export const getLenis = () => lenisInstance;

export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.2,
    });

    lenisInstance = lenis;

    let rafId;

    const animate = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    const pendingTarget = sessionStorage.getItem(
      "portfolio-scroll-target"
    );

    if (pendingTarget) {
      sessionStorage.removeItem(
        "portfolio-scroll-target"
      );

      const scrollToTarget = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const element =
              document.getElementById(pendingTarget);

            if (!element) return;

            lenis.resize();

            lenis.scrollTo(element, {
              duration: 1.3,
              offset: -70,
            });
          });
        });
      };

      const activeTransition =
        document.activeViewTransition;

      if (activeTransition) {
        activeTransition.finished
          .then(scrollToTarget)
          .catch(scrollToTarget);
      } else {
        scrollToTarget();
      }
    }

    return () => {
      cancelAnimationFrame(rafId);

      lenis.destroy();

      if (lenisInstance === lenis) {
        lenisInstance = null;
      }
    };
  }, []);

  return children;
}