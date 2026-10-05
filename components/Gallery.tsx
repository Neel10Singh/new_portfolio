"use client";

import Image, { type StaticImageData } from "next/image";
import {
    motion,
    type MotionValue,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useTransform,
} from "framer-motion";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";

export type StripImage = {
    src: string | StaticImageData;
    alt: string;
};

export type FiveStripImages = readonly [
    StripImage,
    StripImage,
    StripImage,
    StripImage,
    StripImage,
];

type StaggeredStripGalleryProps = {
    images: FiveStripImages;
    className?: string;
    ariaLabel?: string;
    priorityCenterImage?: boolean;
};

const REVEAL_END = 0.88;

// The later an image starts, the farther it travels in less scroll distance.
// That makes the adjacent and outer pairs catch the center at the same endpoint.
const REVEAL_TIMINGS = [
    { start: 0.24, fromY: 125 },
    { start: 0.12, fromY: 102 },
    { start: 0, fromY: 52 },
    { start: 0.12, fromY: 102 },
    { start: 0.24, fromY: 125 },
] as const;

/*
 * Phones fit one strip at a time, so the scroll is split in two: the strips
 * rise with the leftmost one in view, then the row slides sideways until the
 * last strip is centred, and only then does the section unpin.
 */
const MOBILE_QUERY = "(max-width: 639px)";
const MOBILE_REVEAL_END = 0.3;
const MOBILE_SLIDE_START = 0.36;
const MOBILE_SLIDE_END = 0.97;
const MOBILE_FROM_Y = [80, 95, 110, 125, 140] as const;

const subscribeMobile = (onChange: () => void) => {
    const query = window.matchMedia(MOBILE_QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
};

function useIsMobile() {
    return useSyncExternalStore(
        subscribeMobile,
        () => window.matchMedia(MOBILE_QUERY).matches,
        () => false,
    );
}

const VISIBILITY_CLASSES = [
    "block",
    "block",
    "block",
    "block",
    "block",
] as const;

function AnimatedStrip({
    image,
    index,
    progress,
    priority,
    isMobile,
}: {
    image: StripImage;
    index: number;
    progress: MotionValue<number>;
    priority: boolean;
    isMobile: boolean;
}) {
    const prefersReducedMotion = useReducedMotion();
    const timing = REVEAL_TIMINGS[index];

    const y = useTransform(
        progress,
        isMobile ? [0, MOBILE_REVEAL_END] : [timing.start, REVEAL_END],
        [`${isMobile ? MOBILE_FROM_Y[index] : timing.fromY}svh`, "0svh"],
        { clamp: true },
    );

    return (
        <motion.figure
            className={`relative m-0 aspect-[864/1821] w-[88vw] max-w-[43svh] shrink-0 overflow-hidden will-change-transform sm:w-[48vw] lg:w-[31vw] 2xl:w-[18.5vw]`}
            style={{ y: prefersReducedMotion ? "0svh" : y }}
        >
            <Image
                fill
                alt={image.alt}
                className="select-none object-cover"
                draggable={false}
                priority={priority}
                sizes="(max-width: 639px) 88vw, (max-width: 1023px) 48vw, (max-width: 1535px) 31vw, 18.5vw"
                src={image.src}
            />
        </motion.figure>
    );
}

export default function Gallery({
    images,
    className = "",
    ariaLabel = "Project image gallery",
    priorityCenterImage = false,
}: StaggeredStripGalleryProps) {
    const sectionRef = useRef<HTMLElement | null>(null);
    const rowRef = useRef<HTMLDivElement | null>(null);
    const isMobile = useIsMobile();

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    // Mobile row geometry (px): x that centres the first strip, and the
    // distance from one strip to the next.
    const firstX = useMotionValue(0);
    const step = useMotionValue(0);

    useLayoutEffect(() => {
        const row = rowRef.current;
        if (!isMobile || !row?.parentElement) return;

        const measure = () => {
            const strip = row.firstElementChild as HTMLElement | null;
            if (!strip) return;
            const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
            firstX.set((row.parentElement!.clientWidth - strip.offsetWidth) / 2);
            step.set(strip.offsetWidth + gap);
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(row.parentElement);
        return () => observer.disconnect();
    }, [isMobile, firstX, step]);

    const rowX = useTransform(
        [scrollYProgress, firstX, step],
        ([progress, first, distance]: number[]) => {
            if (!isMobile) return 0;
            const slide = Math.min(
                Math.max((progress - MOBILE_SLIDE_START) / (MOBILE_SLIDE_END - MOBILE_SLIDE_START), 0),
                1,
            );
            return first - slide * (images.length - 1) * distance;
        },
    );

    return (
        <section
            ref={sectionRef}
            aria-label={ariaLabel}
            className={`relative h-[650svh] w-full sm:h-[300svh] overflow-x-clip bg-black ${className}`}
        >
            <div className="sticky top-0 h-svh overflow-hidden ">
                <motion.div
                    ref={rowRef}
                    className="absolute left-0 top-[4svh] flex w-max items-start gap-3 will-change-transform sm:left-1/2 sm:-translate-x-1/2 md:gap-4 2xl:gap-5"
                    style={{ x: rowX }}
                >
                    {images.map((image, index) => (
                        <AnimatedStrip
                            image={image}
                            index={index}
                            key={`${image.alt}-${index}`}
                            isMobile={isMobile}
                            priority={priorityCenterImage && index === (isMobile ? 0 : 2)}
                            progress={scrollYProgress}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}