"use client";

import Image, { type StaticImageData } from "next/image";
import {
    motion,
    type MotionValue,
    useReducedMotion,
    useScroll,
    useTransform,
} from "framer-motion";
import { useRef } from "react";

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
}: {
    image: StripImage;
    index: number;
    progress: MotionValue<number>;
    priority: boolean;
}) {
    const prefersReducedMotion = useReducedMotion();
    const timing = REVEAL_TIMINGS[index];

    const y = useTransform(
        progress,
        [timing.start, REVEAL_END],
        [`${timing.fromY}svh`, "0svh"],
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

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    return (
        <section
            ref={sectionRef}
            aria-label={ariaLabel}
            className={`relative h-[300svh] w-full overflow-x-clip bg-black ${className}`}
        >
            <div className="sticky top-0 h-svh overflow-hidden ">
                <div className="absolute left-1/2 top-[4svh] flex w-max -translate-x-1/2 items-start gap-3 md:gap-4 2xl:gap-5">
                    {images.map((image, index) => (
                        <AnimatedStrip
                            image={image}
                            index={index}
                            key={`${image.alt}-${index}`}
                            priority={priorityCenterImage && index === 2}
                            progress={scrollYProgress}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}