"use client"
import { motion, type PanInfo, useReducedMotion } from "framer-motion";
import { Courier_Prime, Space_Grotesk } from "next/font/google";
import { useState } from "react";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["600", "700"],
});

const courierPrime = Courier_Prime({
    subsets: ["latin"],
    weight: ["400", "700"],
});
export type Recommendation = {
    id: string;
    quote: string;
    name: string;
    role: string;
    company?: string;
};

type RecommenderGlowSectionProps = {
    heading?: string;
    labels?: readonly [string, string, string, string];
    recommendations?: readonly Recommendation[];
    className?: string;
};

const recommendations: readonly Recommendation[] = [
    {
        id: "recommendation-one",
        quote:
            "Neelaksh combines strong engineering judgement with genuine ownership. He communicates clearly, learns quickly, and consistently delivers thoughtful, reliable work.",
        name: "Recommender Name",
        role: "SENIOR ENGINEER",
        company: "COMPANY NAME",
    },
    {
        id: "recommendation-two",
        quote:
            "He approaches difficult problems with patience and clarity, supports the people around him, and follows every task through to a dependable result.",
        name: "Recommender Name",
        role: "ENGINEERING MANAGER",
        company: "COMPANY NAME",
    },
    {
        id: "recommendation-three",
        quote:
            "Working with Neelaksh is effortless. He is proactive, technically capable, and always willing to take responsibility when a project needs direction.",
        name: "Recommender Name",
        role: "PRODUCT LEAD",
        company: "COMPANY NAME",
    },
    {
        id: "recommendation-four",
        quote:
            "His combination of curiosity, execution speed, and attention to detail makes him someone I would gladly choose to work with again.",
        name: "Recommender Name",
        role: "TEAM LEAD",
        company: "COMPANY NAME",
    },
];


const SWIPE_THRESHOLD = 105;

const MAX_VISIBLE_CARDS = 6;

const getStackPose = (stackIndex: number) => {
    const depth = Math.min(stackIndex, MAX_VISIBLE_CARDS - 1);

    return {
        x: depth * 8,
        y: 0,
        rotate: depth * 1.5,
        scale: 1 - depth * 0.008,
    };
};

const STACK_SPRING = {
    type: "spring" as const,
    stiffness: 360,
    damping: 38,
    mass: 0.65,
};


function RecommendationDeck() {
    const [frontIndex, setFrontIndex] = useState(0);
    const prefersReducedMotion = useReducedMotion();
    const total = recommendations.length;

    const orderedRecommendations = Array.from({ length: total }, (_, stackIndex) => {
        const sourceIndex = (frontIndex + stackIndex) % total;
        return {
            recommendation: recommendations[sourceIndex],
            stackIndex,
        };
    });

    const moveFrontCardToBack = () => {
        if (total < 2) return;
        setFrontIndex((current) => (current + 1) % total);
    };

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const distance = Math.hypot(info.offset.x, info.offset.y);
        if (distance >= SWIPE_THRESHOLD) moveFrontCardToBack();
    };

    if (total === 0) return null;

    return (
        <div className="relative z-20  px-4 pb-28 pt-20 sm:px-8 sm:pb-36 sm:pt-28">
            <p
                className={`${courierPrime.className} text-center text-xs font-bold tracking-[0.1em] text-orange-100/55 sm:text-sm`}
            >
                [DRAG TO SWIPE]
            </p>

            <div className="relative mx-auto mt-14 h-160 w-80 md:w-[min(88vw,72rem)] md:mt-16 md:h-[24rem]">
                {orderedRecommendations.map(
                    ({ recommendation, stackIndex }) => {
                        const isFront = stackIndex === 0;
                        const pose = getStackPose(stackIndex);;

                        return (
                            <motion.article
                                key={recommendation.id}
                                aria-label={`${recommendation.name} recommendation`}
                                animate={{
                                    x: pose.x,
                                    y: pose.y,
                                    rotate: pose.rotate,
                                    scale: pose.scale,
                                    opacity: stackIndex < MAX_VISIBLE_CARDS ? 1 : 0,
                                }}
                                className={`absolute inset-0 overflow-hidden rounded-xl   text-black shadow-[0_24px_70px_rgba(0,0,0,0.48)] ${
                                    isFront ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
                                }`}
                                drag={isFront && total > 1}
                                dragConstraints={{
                                    bottom: 220,
                                    left: -260,
                                    right: 260,
                                    top: -220,
                                }}
                                dragElastic={0.16}
                                dragMomentum={false}
                                dragSnapToOrigin
                                dragTransition={{
                                    bounceDamping: 40,
                                    bounceStiffness: 420,
                                }}
                                initial={false}
                                onDragEnd={handleDragEnd}
                                onKeyDown={(event) => {
                                    if (!isFront || total < 2) return;
                                    if (
                                        event.key === "ArrowLeft" ||
                                        event.key === "ArrowRight" ||
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();
                                        moveFrontCardToBack();
                                    }
                                }}
                                style={{
                                    touchAction: isFront ? "none" : "auto",
                                    zIndex: total - stackIndex,
                                }}
                                tabIndex={isFront ? 0 : -1}
                                transition={
                                    prefersReducedMotion ? { duration: 0 } : STACK_SPRING
                                }
                                whileDrag={{ scale: 1.012 }}
                            >
                                <div className="grid h-full grid-cols-1 grid-rows-[minmax(0,1.25fr)_minmax(0,1.00fr)] md:grid-cols-[minmax(0,1.8fr)_minmax(15rem,0.95fr)] md:grid-rows-1">
                                    <div className="min-h-0 p-2.5 sm:p-3 border-white/80 bg-[#f3f1f0] rounded-2xl border border-r-black md:border-r-[#f3f1f0]">
                                        <div className="flex h-full items-center rounded-md border border-zinc-500 px-7 py-10 sm:px-10 md:px-12">
                                            <blockquote
                                                className={`${spaceGrotesk.className} text-[clamp(1.15rem,2vw,1.75rem)] font-semibold leading-[1.28] tracking-[-0.035em]`}
                                            >
                                                “{recommendation.quote}”
                                            </blockquote>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center border-t  border-white/80 border border-r-black bg-[#f3f1f0] rounded-2xl px-8 py-8 h-80 md:h-auto  md:border-t-0 md:px-9">
                                        <p
                                            className={`${courierPrime.className} text-xs font-bold uppercase leading-[1.35] tracking-[-0.035em] text-zinc-500 sm:text-sm`}
                                        >
                                            {recommendation.role}
                                            {recommendation.company ? (
                                                <>
                                                    <br />
                                                    {recommendation.company}
                                                </>
                                            ) : null}
                                        </p>

                                        <h3
                                            className={`${spaceGrotesk.className} mt-4 text-4xl md:text-3xl lg:text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-black`}
                                        >
                                            {recommendation.name}
                                        </h3>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    },
                )}
            </div>
        </div>
    );
}

export default function RecommenderGlowSection({
    heading = "RECOMMENDER",
    labels = ["WHAT", "OTHERS", "SAYS", "ABOUT ME"],
    className = "",
}: RecommenderGlowSectionProps) {
    return (
        <section
            aria-labelledby="recommender-heading"
            className={`relative isolate w-full overflow-x-clip  text-white ${className}`}
        >
                <svg
                    aria-hidden
                    className="pointer-events-none absolute -left-[8%] top-12 z-20 h-80 w-[116%] overflow-visible blur-[32px]"
                    preserveAspectRatio="none"
                    viewBox="0 0 1600 760"
                >
                    <defs>
                        <linearGradient
                            id="recommender-orange-field"
                            x1="50%"
                            y1="0%"
                            x2="50%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="#3b0000" stopOpacity="0" />
                            <stop offset="5%" stopColor="#7f0000" stopOpacity="0.9" />
                            <stop offset="12%" stopColor="#b91c1c" />
                            <stop offset="20%" stopColor="#dc2626" />
                            <stop offset="28%" stopColor="#f4511e" />
                            <stop offset="36%" stopColor="#fb923c" />

                            <stop offset="64%" stopColor="#fb923c" />
                            <stop offset="72%" stopColor="#f4511e" />
                            <stop offset="80%" stopColor="#dc2626" />
                            <stop offset="88%" stopColor="#b91c1c" />
                            <stop offset="95%" stopColor="#7f0000" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#3b0000" stopOpacity="0" />
                        </linearGradient>

                        <filter
                            id="recommender-wide-blur"
                            x="-20%"
                            y="-30%"
                            width="140%"
                            height="160%"
                        >
                            <feGaussianBlur stdDeviation="42" />
                        </filter>

                        <filter
                            id="recommender-soft-blur"
                            x="-12%"
                            y="-18%"
                            width="124%"
                            height="136%"
                        >
                            <feGaussianBlur stdDeviation="16" />
                        </filter>
                    </defs>

                    <path
                    d="M -120 170
                        C 80 -45 285 205 475 42
                        C 665 -95 845 215 1025 28
                        C 1220 -90 1415 215 1720 38
                        L 1720 555
                        C 1490 835 1315 495 1110 725
                        C 905 905 750 475 540 740
                        C 315 920 105 475 -120 770
                        Z"
                        fill="url(#recommender-orange-field)"
                        filter="url(#recommender-wide-blur)"
                        opacity="0.92"
                    />

                    <path
                    d="M -120 170
                        C 80 -45 285 205 475 42
                        C 665 -95 845 215 1025 28
                        C 1220 -90 1415 215 1720 38
                        L 1720 555
                        C 1490 835 1315 495 1110 725
                        C 905 905 750 475 540 740
                        C 315 920 105 475 -120 770
                        Z"
                        fill="url(#recommender-orange-field)"
                        filter="url(#recommender-soft-blur)"
                        opacity="0.98"
                    />

                    <path
                    d="M -120 170
                        C 80 -45 285 205 475 42
                        C 665 -95 845 215 1025 28
                        C 1220 -90 1415 215 1720 38
                        L 1720 555
                        C 1490 835 1315 495 1110 725
                        C 905 905 750 475 540 740
                        C 315 920 105 475 -120 770
                        Z"
                        fill="url(#recommender-orange-field)"
                        opacity="0.72"
                    />
                </svg>
                {/* <div className="absolute top-0 left-0 w-full h-[450px]  backdrop-blur-xl z-30" /> */}

                <div className="relative z-10 flex pt-80 w-full flex-col justify-end  pb-7  sm:pb-9 lg:pb-11">
                    <h2
                        id="recommender-heading"
                        className={`${spaceGrotesk.className} whitespace-nowrap bg-gradient-to-b from-orange-600 via-white to-zinc-100 bg-clip-text text-center text-[clamp(3.15rem,15vw,17rem)] font-bold tracking-[-0.085em] text-transparent`}
                    >
                        {heading}
                    </h2>

                    <div
                        className={`${courierPrime.className} mt-5 grid grid-cols-4 items-center text-center text-xs md:text-sm xl:text-lg font-bold uppercase tracking-[-0.04em] text-orange-100/75 sm:mt-7`}
                    >
                        {labels.map((label) => (
                            <span key={label}>{label}</span>
                        ))}
                    </div>
                </div>
                <div className="absolute flex z-10 justify-between h-620 w-[50vw] top-80 left-1/2 -translate-x-1/2 rotate-180">
                        <div className="lines1 relative line11 h-full w-0.5 overflow-hidden bg-linear-to-b from-neutral-500/5 via-neutral-500/10 to-neutral-300/30"/>
                        <div className="lines1 relative line31 h-full w-0.5 overflow-hidden bg-linear-to-b from-neutral-500/5 via-neutral-500/10 to-neutral-300/30"/>
                        <div className="lines1 relative line21 hiden md:inline h-full w-0.5 overflow-hidden bg-linear-to-b from-neutral-500/5 via-neutral-500/10 to-neutral-300/30"/>
                </div>
                <div >
                        <RecommendationDeck />

                </div>
        </section>
    );
}