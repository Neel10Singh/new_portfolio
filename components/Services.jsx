"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const services = [
    {
        title: "User Research",
        image: "/gallery/im1.avif",
    },
    {
        title: "UX/UI Design",
        image: "/gallery/im2.avif",
    },
    {
        title: "Website Design",
        image: "/gallery/im3.avif",
    },
    {
        title: "3D Development",
        image: "/gallery/im4.png",
    },
    {
        title: "Graphic Design",
        image: "/gallery/im5.avif",
    },
];

export default function Services() {
    const sectionRef = useRef(null);
    const imageWindowRef = useRef(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isImageVisible, setIsImageVisible] = useState(false);
    const [windowY, setWindowY] = useState(0);

    const handleEnter = (event, index) => {
        if (!sectionRef.current || !imageWindowRef.current) return;

        const sectionRect =
            sectionRef.current.getBoundingClientRect();

        const itemRect =
            event.currentTarget.getBoundingClientRect();

        const imageHeight =
            imageWindowRef.current.offsetHeight;

        const itemCenter =
            itemRect.top -
            sectionRect.top +
            itemRect.height / 2;

        let targetY = itemCenter - imageHeight / 2;

        const maxY =
            sectionRect.height - imageHeight;

        targetY = Math.max(
            0,
            Math.min(targetY, maxY)
        );

        setWindowY(targetY);

        // Swap image, but DO NOT hide the window.
        setActiveIndex(index);
        setIsImageVisible(true);
    };

  return (
    <section
      ref={sectionRef}
      className="
        relative
        grid
        min-h-[720px]
        grid-cols-[minmax(150px,0.4fr)_minmax(500px,1.5fr)_minmax(280px,0.8fr)]
        gap-[60px]
        overflow-hidden
        bg-transparent
        px-[22px]
        max-w-full
        py-12

        max-[1100px]:grid-cols-[130px_minmax(400px,1fr)_230px]
        max-[1100px]:gap-[30px]

        max-[800px]:block
        max-[800px]:min-h-0
        max-[800px]:px-5
      "
    >
      {/* LEFT LABEL */}
      <div
        className="
            pt-[18px]
            font-[family-name:var(--font-courier-prime)]
            text-sm
            font-bold
            tracking-[0.04em]
            text-neutral-400
            max-w-32
            max-[800px]:mb-12
            max-[800px]:pt-0
            inline
            max-[1100px]:hidden
        "
      >
        WHAT I CAN DO
      </div>

      {/* HEADINGS */}
      {/* HEADINGS HOVER AREA */}
        <div
            className="
                relative
                z-10
                self-center
                w-full
                py-2
            "
            onMouseLeave={() => setIsImageVisible(false)}
        >
        {services.map((service, index) => (
            <div
            key={service.title}
            onMouseEnter={(event) => handleEnter(event, index)}
            className="
                group
                w-fit
                cursor-pointer
                text-[#747170]
                transition-colors
                duration-200
                hover:text-[#f4f3f1]
            "
            >
            <div className="h-[4.12em] sm:h-[4.62em] overflow-hidden">
                <div
                className="
                    flex
                    flex-col

                    font-[family-name:var(--font-space-grotesk)]
                    text-[4.12em]
                    font-semibold
                    leading-[1.12]

                    transition-transform
                    duration-[420ms]
                    ease-[cubic-bezier(0.76,0,0.24,1)]

                    will-change-transform
                    group-hover:-translate-y-1/2

                    max-[800px]:text-[clamp(38px,9vw,64px)]
                    motion-reduce:transition-none
                "
                >
                <span className="h-fit shrink-0 whitespace-nowrap">
                    {service.title}
                </span>

                <span
                    aria-hidden="true"
                    className="h-fit shrink-0 whitespace-nowrap"
                >
                    {service.title}
                </span>
                </div>
            </div>
            </div>
        ))}
        </div>

        {/* FLOATING IMAGE WINDOW */}
        <div
            ref={imageWindowRef}
            style={{
                transform: `translate3d(0, ${windowY}px, 0)`,
            }}
            className={`
                pointer-events-none
                absolute
                right-[22px]
                top-0

                h-[330px]
                w-[min(320px,22vw)]

                overflow-hidden

                transition-[transform,opacity]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]

                will-change-transform

                max-[1100px]:h-[280px]
                max-[1100px]:w-[230px]

                max-[800px]:hidden

                motion-reduce:transition-none

                ${isImageVisible ? "opacity-100" : "opacity-0"}
            `}
            >
            {/* ALL IMAGES LIVE INSIDE THIS STRIP */}
            <div
                style={{
                height: `${services.length * 100}%`,
                transform: `translate3d(
                    0,
                    -${activeIndex * (100 / services.length)}%,
                    0
                )`,
                }}
                className="
                flex
                w-full
                flex-col

                transition-transform
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]

                will-change-transform
                motion-reduce:transition-none
                "
            >
                {services.map((service) => (
                <div
                    key={service.title}
                    style={{
                    height: `${100 / services.length}%`,
                    }}
                    className="relative w-full shrink-0"
                >
                    <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1100px) 230px, 320px"
                    className="object-cover"
                    />
                </div>
                ))}
            </div>
        </div>
        </section>
    );
}