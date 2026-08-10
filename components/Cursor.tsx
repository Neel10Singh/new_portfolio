"use client";

import { useEffect, useRef } from "react";

export default function CursorRoundV3() {
    const cursorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const finePointer = window.matchMedia("(any-pointer: fine)");
        if (!cursor || !finePointer.matches) return;

        let frame = 0;
        let x = -100;
        let y = -100;
        let visible = false;

        const paint = () => {
            cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            frame = 0;
        };

        const move = (event: PointerEvent) => {
            x = event.clientX;
            y = event.clientY;

            if (!visible) {
                visible = true;
                cursor.style.opacity = "1";
            }

            if (!frame) frame = requestAnimationFrame(paint);
        };

        const hide = () => {
            visible = false;
            cursor.style.opacity = "0";
        };

        const visibilityChange = () => {
            if (document.visibilityState !== "visible") hide();
        };

        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("blur", hide);
        document.documentElement.addEventListener("mouseleave", hide);
        document.addEventListener("visibilitychange", visibilityChange);

        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.removeEventListener("pointermove", move);
            window.removeEventListener("blur", hide);
            document.documentElement.removeEventListener("mouseleave", hide);
            document.removeEventListener("visibilitychange", visibilityChange);
        };
    }, []);

    return (
        <>
            <style>{`
                #portfolio-cursor {
                    display: none;
                }

                #portfolio-cursor-shape {
                    width: 24px;
                    height: 24px;
                    border-radius: 9999px;
                    transform: translate(-50%, -50%);
                    transition:
                        width 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
                        height 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
                        background-color 180ms ease;
                }

                #portfolio-cursor-label {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.75);
                    transition:
                        opacity 120ms ease,
                        transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
                }

                @media (any-pointer: fine) {
                    html,
                    body,
                    a,
                    button,
                    [role="button"] {
                        cursor: none !important;
                    }

                    #portfolio-cursor {
                        display: block;
                    }
                }
            `}</style>

            <div
                ref={cursorRef}
                aria-hidden
                id="portfolio-cursor"
                className="pointer-events-none fixed left-0 top-0 z-[9999] h-0 w-0 opacity-0 mix-blend-difference transition-opacity duration-100 will-change-transform"
            >
                <div
                    id="portfolio-cursor-shape"
                    className="absolute left-0 top-0 bg-white"
                />
                <span
                    id="portfolio-cursor-label"
                    className="absolute left-0 top-0 flex h-12 w-24 items-center justify-center font-mono text-xs font-bold tracking-[0.12em] text-black"
                >
                    VIEW
                </span>
            </div>
        </>
    );
}