"use client";

import { usePathname } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { flushSync } from "react-dom";

/* Edit freely - one is picked at random each time Toopy is hovered. */
const GREETINGS = [
    "Hi there! 👋",
    "Hello, I am Toopy!",
    "Hi, I am Toopy. You Are?",
    "Oh, hi! Enjoy the tour.",
    "Psst... scroll on!",
];

/* Shown while Toopy is being held. */
const HELD_MESSAGES = [
    "Leave me alone!",
    "Put me down!",
    "Hey! Where are we going?",
    "I'm scared of heights!",
];

/* Shown after Toopy is dropped. */
const DROP_MESSAGES = [
    "Oww, that hurt!",
    "Ouch! Rude.",
    "My legs! 😵",
    "Was that necessary?",
];

/* Shown when Toopy lands on a platform. */
const PLATFORM_MESSAGES = [
    "Oh! Higher ground.",
    "Ooh, nice view from up here!",
    "A new place to explore!",
    "Safe and sound!",
];

/* Shown while Toopy hops off the end of a platform. */
const JUMP_MESSAGES = ["Wheee!", "Geronimo!", "Here I go!"];

const TOOPY_WIDTH = 49;
const TOOPY_HEIGHT = 61;
/** Seconds for one floor crossing; platforms reuse the same speed. */
const WALK_SECONDS = 18;
/** Walk margin from each screen edge (px); also feeds --toopy-gutter. */
const GUTTER = 20;
/** Pointer travel (px) before a press becomes a drag, so a click doesn't grab. */
const DRAG_THRESHOLD = 4;
/** Fall acceleration in px/s², tuned for a snappy drop. */
const GRAVITY = 3200;
/** How long Toopy complains after landing before walking again (ms). */
const LANDED_PAUSE = 2200;

/** Hop off a platform edge: height, sideways reach (px), rise time (ms). */
const HOP_RISE = 18;
const HOP_REACH = 26;
const HOP_TIME = 220;
/** Ease-in curve that approximates free fall. */
const GRAVITY_EASE = "cubic-bezier(0.55, 0, 1, 0.45)";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const pickDifferent = (list, current) => {
    if (list.length < 2) return list[0];
    let next = current;
    while (next === current) {
        next = list[Math.floor(Math.random() * list.length)];
    }
    return next;
};

/*
 * Platforms are any elements marked data-toopy-platform. They're measured
 * only when Toopy is dropped: one batch of reads, no observers or listeners.
 * data-toopy-platform="text" uses the first line of text instead of the box,
 * so Toopy stands on the letters rather than the element's padding.
 */
let measureContext = null;

/** Gap between a text line box's top and its tallest glyph. */
function glyphInset(element) {
    measureContext ??= document.createElement("canvas").getContext("2d");
    const style = getComputedStyle(element);
    measureContext.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = measureContext.measureText(element.textContent ?? "");
    return Math.max(0, metrics.fontBoundingBoxAscent - metrics.actualBoundingBoxAscent);
}

/** A platform's walkable top edge in viewport coordinates, or null. */
function measurePlatform(element) {
    if (element.checkVisibility && !element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) {
        return null;
    }

    if (element.dataset.toopyPlatform !== "text") {
        const { left, right, top, width } = element.getBoundingClientRect();
        return width > 0 ? { left, right, top } : null;
    }

    const range = document.createRange();
    range.selectNodeContents(element);
    const rects = [...range.getClientRects()].filter((rect) => rect.width > 0);
    if (rects.length === 0) return null;

    const first = rects.reduce((top, rect) => (rect.top < top.top ? rect : top));
    const line = rects.filter((rect) => rect.top < first.top + first.height / 2);
    return {
        left: Math.min(...line.map((rect) => rect.left)),
        right: Math.max(...line.map((rect) => rect.right)),
        top: first.top + glyphInset(element),
    };
}

/** The first platform under centerX, below feetY and above the floor. */
function findPlatform(centerX, feetY, floorY) {
    let best = null;
    for (const element of document.querySelectorAll("[data-toopy-platform]")) {
        const platform = measurePlatform(element);
        if (!platform || platform.right - platform.left < TOOPY_WIDTH) continue;
        if (centerX < platform.left || centerX > platform.right) continue;
        if (platform.top < feetY - 2 || platform.top >= floorY - 4) continue;
        if (!best || platform.top < best.top) best = platform;
    }
    return best;
}

/** How far (in SVG units) the eyes can shift toward the cursor. */
const LOOK_X = 3;
const LOOK_Y = 2.5;
/** Cursor distance (px) at which the eyes reach their full shift. */
const LOOK_RANGE = 220;
/** Eye centre within the 49x61 SVG, which renders at 1:1 px. */
const EYES_CENTER = { x: 24.5, y: 21 };

/*
 * Points the eyes at the cursor by setting --eye-x / --eye-y on the SVG.
 * Writes go straight to the DOM (no re-render); CSS eases the movement.
 * Toopy also moves while the cursor rests, so the target is re-aimed on a
 * slow interval as well as on pointer moves.
 */
function useEyesFollowPointer(svgRef) {
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let pointer = null;
        let frame = 0;

        const aim = () => {
            frame = 0;
            if (!pointer) return;
            const rect = svg.getBoundingClientRect();
            const dx = pointer.x - (rect.left + EYES_CENTER.x);
            const dy = pointer.y - (rect.top + EYES_CENTER.y);
            const distance = Math.hypot(dx, dy) || 1;
            const reach = Math.min(distance / LOOK_RANGE, 1);
            svg.style.setProperty("--eye-x", `${((dx / distance) * reach * LOOK_X).toFixed(2)}px`);
            svg.style.setProperty("--eye-y", `${((dy / distance) * reach * LOOK_Y).toFixed(2)}px`);
        };

        const scheduleAim = () => {
            if (!frame) frame = requestAnimationFrame(aim);
        };

        const handlePointerMove = (event) => {
            pointer = { x: event.clientX, y: event.clientY };
            scheduleAim();
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        const interval = window.setInterval(scheduleAim, 150);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.clearInterval(interval);
            cancelAnimationFrame(frame);
        };
    }, [svgRef]);
}

const Toopy = () => {
    const trackRef = useRef(null);
    const toopyRef = useRef(null);
    const svgRef = useRef(null);
    const pathname = usePathname();
    const [greeting, setGreeting] = useState(GREETINGS[0]);
    useEyesFollowPointer(svgRef);
    // Open the tooltip toward the side of the screen with more room.
    const [tooltipSide, setTooltipSide] = useState("left");

    /*
     * mode:  walk -> pressed -> held -> falling -> landed -> walk, plus
     *        jumping (hopping off a platform). Everything but "walk" pauses
     *        the walk; held/falling/jumping hand position to inline styles.
     * layer: "floor" is fixed to the screen bottom; "page" is absolute in
     *        document coordinates, so a platform's Toopy scrolls natively.
     * Both are mirrored in refs for callbacks that outlive a render.
     */
    const [mode, setMode] = useState("walk");
    const [layer, setLayer] = useState("floor");
    const modeRef = useRef("walk");
    const layerRef = useRef("floor");
    const [message, setMessage] = useState(HELD_MESSAGES[0]);
    const drag = useRef(null);
    /** 1 = walking right, -1 = walking left; carried across layers. */
    const walkDir = useRef(1);
    const fallAnimation = useRef(null);
    const landedTimer = useRef(0);

    useEffect(
        () => () => {
            window.clearTimeout(landedTimer.current);
            fallAnimation.current?.cancel();
        },
        [],
    );

    /** Switches mode/layer and commits synchronously, so the DOM is ready to measure. */
    const go = (nextMode, nextLayer = layerRef.current) => {
        modeRef.current = nextMode;
        layerRef.current = nextLayer;
        flushSync(() => {
            setMode(nextMode);
            setLayer(nextLayer);
        });
    };

    const place = (x, y) => {
        toopyRef.current.style.translate = `${x}px ${y}px`;
    };

    const floorMaxX = () =>
        Math.max(trackRef.current.clientWidth - TOOPY_WIDTH - GUTTER, GUTTER);

    const updateTooltipSide = (left) => {
        setTooltipSide(left + TOOPY_WIDTH / 2 < window.innerWidth / 2 ? "left" : "right");
    };

    const handleMouseEnter = (event) => {
        setGreeting((current) => pickDifferent(GREETINGS, current));
        updateTooltipSide(event.currentTarget.getBoundingClientRect().left);
    };

    const getFloorWalk = () =>
        toopyRef.current
            .getAnimations()
            .find((animation) => animation.animationName === "toopy-walk");

    /**
     * Runs a gravity fall from `from` to `to` (both in the current layer's
     * coordinates), optionally rising to `peak` first, then a small bounce.
     */
    const fall = (from, to, onDone, peak = null) => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const start = peak ?? from;
        const height = Math.max(to.y - start.y, 0);
        const hopTime = peak && !reduceMotion ? HOP_TIME : 0;
        const fallTime = reduceMotion ? 0 : Math.sqrt((2 * height) / GRAVITY) * 1000;
        const bounceTime = fallTime / 8;
        const bounce = Math.min(height * 0.06, 10);
        const total = hopTime + fallTime + 2 * bounceTime;

        const finish = () => {
            fallAnimation.current = null;
            place(to.x, to.y);
            onDone();
        };
        if (total === 0) {
            finish();
            return;
        }

        const at = (x, y) => `${x}px ${y}px`;
        const keyframes = [{ translate: at(from.x, from.y), easing: peak ? "ease-out" : GRAVITY_EASE }];
        if (hopTime) {
            keyframes.push({ translate: at(peak.x, peak.y), offset: hopTime / total, easing: GRAVITY_EASE });
        }
        keyframes.push(
            { translate: at(to.x, to.y), offset: (hopTime + fallTime) / total, easing: "ease-out" },
            { translate: at(to.x, to.y - bounce), offset: (hopTime + fallTime + bounceTime) / total, easing: "ease-in" },
            { translate: at(to.x, to.y) },
        );

        const animation = toopyRef.current.animate(keyframes, { duration: total, fill: "forwards" });
        fallAnimation.current = animation;
        animation.onfinish = () => {
            finish();
            animation.cancel();
        };
    };

    /** Settles on the floor at x and resumes the floor walk from there. */
    const landOnFloor = (x, messages) => {
        if (messages) setMessage((current) => pickDifferent(messages, current));
        go(messages ? "landed" : "walk", "floor");
        place(x, 0);

        const walk = getFloorWalk();
        if (walk) {
            // Jump the walk timeline to x, keeping Toopy's direction.
            const duration = walk.effect.getTiming().duration;
            const span = Math.max(floorMaxX() - GUTTER, 1);
            const progress = (x - GUTTER) / span;
            walk.currentTime = (walkDir.current > 0 ? progress : 2 - progress) * duration;
        }

        updateTooltipSide(x);
        if (messages) {
            landedTimer.current = window.setTimeout(() => go("walk"), LANDED_PAUSE);
        }
    };

    /** Lands on a platform (document coordinates) and walks it once, then hops off. */
    const landOnPlatform = (at, platform) => {
        const toopy = toopyRef.current;
        const speed = Math.max(floorMaxX() - GUTTER, 1) / (WALK_SECONDS * 1000);
        const toX = walkDir.current > 0 ? platform.right - TOOPY_WIDTH : platform.left;

        toopy.style.setProperty("--walk-from", `${at.x}px`);
        toopy.style.setProperty("--walk-to", `${toX}px`);
        toopy.style.setProperty("--walk-y", `${at.y}px`);
        toopy.style.setProperty("--walk-time", `${Math.abs(toX - at.x) / speed}ms`);

        setMessage((current) => pickDifferent(PLATFORM_MESSAGES, current));
        go("landed", "page");
        updateTooltipSide(at.x - window.scrollX);

        landedTimer.current = window.setTimeout(() => {
            // Without the walk animation there's no animationend, so hop off now.
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) jumpOff();
            else go("walk");
        }, LANDED_PAUSE);
    };

    /** Hops off the end of a platform and falls to the screen floor. */
    const jumpOff = () => {
        const rect = toopyRef.current.getBoundingClientRect();
        const offscreen = rect.bottom < 0 || rect.top > window.innerHeight;
        const landX = clamp(rect.left + walkDir.current * HOP_REACH, GUTTER, floorMaxX());

        if (offscreen) {
            landOnFloor(landX, null);
            return;
        }

        setMessage((current) => pickDifferent(JUMP_MESSAGES, current));
        go("jumping", "floor");
        const floorTop = trackRef.current.getBoundingClientRect().top;
        const from = { x: rect.left, y: rect.top - floorTop };
        place(from.x, from.y);
        updateTooltipSide(from.x);

        const peak = { x: from.x + (walkDir.current * HOP_REACH) / 2, y: from.y - HOP_RISE };
        fall(from, { x: landX, y: 0 }, () => landOnFloor(landX, null), peak);
    };

    /** Quietly puts Toopy back on the floor walk (platform may have moved or gone). */
    const returnToFloor = () => {
        if (layerRef.current !== "page" || drag.current) return;
        fallAnimation.current?.cancel();
        fallAnimation.current = null;
        window.clearTimeout(landedTimer.current);
        const { left } = toopyRef.current.getBoundingClientRect();
        landOnFloor(clamp(left, GUTTER, floorMaxX()), null);
    };

    /** Platform scrolled out of view: Toopy drops in from above the screen to the floor. */
    const dropInFromTop = () => {
        if (layerRef.current !== "page" || drag.current) return;
        window.clearTimeout(landedTimer.current);
        const { left } = toopyRef.current.getBoundingClientRect();
        const landX = clamp(left, GUTTER, floorMaxX());

        setMessage((current) => pickDifferent(JUMP_MESSAGES, current));
        go("jumping", "floor");
        const floorTop = trackRef.current.getBoundingClientRect().top;
        // Start fully above the viewport so the fall covers the whole screen.
        const from = { x: landX, y: -floorTop - TOOPY_HEIGHT };
        place(from.x, from.y);
        updateTooltipSide(landX);
        fall(from, { x: landX, y: 0 }, () => landOnFloor(landX, null));
    };

    const onLeftPlatform = useEffectEvent(returnToFloor);
    const onScrolledOffPlatform = useEffectEvent(dropInFromTop);

    // A platform Toopy scrolled out of view, or a resize that may have moved it.
    useEffect(() => {
        if (layer !== "page") return;

        const observer = new IntersectionObserver(([entry]) => {
            const settled = modeRef.current === "walk" || modeRef.current === "landed";
            if (!entry.isIntersecting && settled) onScrolledOffPlatform();
        });
        observer.observe(toopyRef.current);
        window.addEventListener("resize", onLeftPlatform);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", onLeftPlatform);
        };
    }, [layer]);

    // Platforms belong to the page, so a navigation sends Toopy back down.
    useEffect(() => {
        const frame = requestAnimationFrame(() => onLeftPlatform());
        return () => cancelAnimationFrame(frame);
    }, [pathname]);

    const handleAnimationEnd = (event) => {
        if (event.target === toopyRef.current && event.animationName === "toopy-platform-walk") {
            jumpOff();
        }
    };

    const handlePointerDown = (event) => {
        if (event.button !== 0 || (modeRef.current !== "walk" && modeRef.current !== "landed")) return;
        const toopy = toopyRef.current;
        toopy.setPointerCapture(event.pointerId);
        window.clearTimeout(landedTimer.current);

        if (layerRef.current === "floor") {
            const walk = getFloorWalk();
            if (walk) {
                const duration = walk.effect.getTiming().duration;
                walkDir.current = walk.currentTime % (2 * duration) < duration ? 1 : -1;
            }
        }

        const rect = toopy.getBoundingClientRect();
        drag.current = {
            startX: event.clientX,
            startY: event.clientY,
            left: rect.left,
            top: rect.top,
            floorTop: 0,
            x: rect.left,
            y: 0,
            moved: false,
        };
        go("pressed");
    };

    const handlePointerMove = (event) => {
        const state = drag.current;
        if (!state) return;

        const dx = event.clientX - state.startX;
        const dy = event.clientY - state.startY;

        if (!state.moved) {
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
            state.moved = true;
            setMessage((current) => pickDifferent(HELD_MESSAGES, current));
            // Held Toopy always lives on the screen-fixed layer.
            go("held", "floor");
            state.floorTop = trackRef.current.getBoundingClientRect().top;
        }

        // Keep Toopy on screen; it can be lifted but not pushed below the floor.
        state.x = clamp(state.left + dx, 0, trackRef.current.clientWidth - TOOPY_WIDTH);
        state.y = clamp(state.top + dy - state.floorTop, -state.floorTop, 0);
        place(state.x, state.y);
        updateTooltipSide(state.x);
    };

    const handlePointerUp = () => {
        const state = drag.current;
        if (!state) return;
        drag.current = null;

        if (!state.moved) {
            go("walk");
            return;
        }

        const floorY = state.floorTop + TOOPY_HEIGHT;
        const feetY = state.floorTop + state.y + TOOPY_HEIGHT;
        const platform = findPlatform(state.x + TOOPY_WIDTH / 2, feetY, floorY);

        if (!platform) {
            const landX = clamp(state.x, GUTTER, floorMaxX());
            go("falling", "floor");
            fall({ x: state.x, y: state.y }, { x: landX, y: 0 }, () =>
                landOnFloor(landX, DROP_MESSAGES),
            );
            return;
        }

        // Fall in document coordinates so scrolling mid-fall still hits the card.
        const { scrollX, scrollY } = window;
        const target = {
            left: platform.left + scrollX,
            right: platform.right + scrollX,
            top: platform.top + scrollY,
        };
        const from = { x: state.x + scrollX, y: state.floorTop + state.y + scrollY };
        const to = {
            x: clamp(from.x, target.left, target.right - TOOPY_WIDTH),
            y: target.top - TOOPY_HEIGHT,
        };

        go("falling", "page");
        place(from.x, from.y);
        fall(from, to, () => landOnPlatform(to, target));
    };

    const tooltipText = mode === "walk" || mode === "pressed" ? greeting : message;
    const tooltipForced = mode !== "walk" && mode !== "pressed";

    return (
        // Full-width track; the floor walk distance is measured in cqw from it.
        <div
            ref={trackRef}
            aria-hidden
            className={`toopy-track pointer-events-none inset-x-0 z-100 ${
                layer === "floor" ? "fixed bottom-0" : "absolute top-0"
            }`}
        >
            <div
                ref={toopyRef}
                data-layer={layer}
                data-mode={mode}
                className="toopy group pointer-events-auto relative w-[49px] touch-none select-none"
                onAnimationEnd={handleAnimationEnd}
                onLostPointerCapture={handlePointerUp}
                onMouseEnter={handleMouseEnter}
                onPointerCancel={handlePointerUp}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                    "--toopy-gutter": `${GUTTER}px`,
                    "--toopy-walk-time": `${WALK_SECONDS}s`,
                }}
            >
                <div
                    className={`pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-lg bg-[#F6F4F4] px-3 py-1.5 text-xs font-semibold text-black shadow-lg transition-[opacity,translate] duration-200 ${
                        tooltipForced
                            ? "translate-y-0 opacity-100"
                            : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                    } ${tooltipSide === "left" ? "left-0" : "right-0"}`}
                >
                    {tooltipText}
                    <span
                        className={`absolute top-full h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-[#F6F4F4] ${
                            tooltipSide === "left" ? "left-[18px]" : "right-[18px]"
                        }`}
                    />
                </div>

                <svg
                    ref={svgRef}
                    width="49"
                    height="61"
                    viewBox="0 0 49 61"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="block"
                >
                    <rect id="toopy_body" width="49" height="45" rx="8" fill="#F6F4F4"/>
                    <rect className="toopy-leg" id="toopy_leg_1" x="7.27723" y="33" width="9.70297" height="28" rx="2.85149" fill="#F6F4F4"/>
                    <rect className="toopy-leg" id="toopy_leg_2" x="32.0198" y="33" width="9.70297" height="28" rx="2.85149" fill="#F6F4F4"/>
                    {/* Each eye moves with its eyelid so the blink still covers it. */}
                    <g className="toopy-eye">
                        <ellipse id="toopy_eye_1" cx="14.5545" cy="21" rx="4" ry="4" fill="black"/>
                        <rect className="toopy-eyelid" id="toopy_eyelid_1" x="9.70297" y="8.5" width="10.1881" height="8.5" fill="#F6F4F4"/>
                    </g>
                    <g className="toopy-eye">
                        <ellipse id="toopy_eye_2" cx="33.4752" cy="21" rx="4" ry="4" fill="black"/>
                        <rect className="toopy-eyelid" id="toopy_eyelid_2" x="29.1089" y="8.5" width="10.1881" height="8.5" fill="#F6F4F4"/>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default Toopy;
