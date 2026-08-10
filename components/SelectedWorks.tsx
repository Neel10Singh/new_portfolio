import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Courier_Prime, Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const courierPrime = Courier_Prime({
    subsets: ["latin"],
    weight: ["400", "700"],
});

export type SelectedWork = {
    title: string;
    href: string;
    tags: string[];
    image?: string | StaticImageData;
    imageAlt?: string;
    meta?: string;
    external?: boolean;
    /** Used by the generated artwork when image is omitted. */
    accent?: string;
};

type SelectedWorksProps = {
    projects?: SelectedWork[];
    viewAllHref?: string;
    heading?: string;
};

const DEFAULT_PROJECTS: SelectedWork[] = [
    {
        title: "Orderbook Visualizer",
        href: "/projects/orderbook-visualizer",
        tags: ["THREE.JS", "REAL-TIME DATA"],
        meta: "3D MARKET VISUALIZER / 2026",
        accent: "#f97316",
    },
    {
        title: "Showtime",
        href: "/projects/showtime",
        tags: ["NEXT.JS", "FULL STACK"],
        meta: "MOVIE LIBRARY / 2026",
        accent: "#60a5fa",
    },
];

function ProjectArtwork({
    project,
    index,
}: {
    project: SelectedWork;
    index: number;
}) {
    if (project.image) {
        return (
            <Image
                fill
                alt={project.imageAlt ?? `${project.title} project preview`}
                className="object-cover transition-transform duration-700 ease-out group-hover/project:scale-[1.035]"
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={project.image}
            />
        );
    }

    const accent = project.accent ?? "#f97316";

    return (
        <div
            aria-label={`${project.title} abstract project preview`}
            className="absolute inset-0 overflow-hidden bg-[#0a0a0a]"
            role="img"
            style={{
                background: `
                    radial-gradient(circle at 74% 22%, ${accent}33, transparent 32%),
                    radial-gradient(circle at 22% 78%, ${accent}1f, transparent 34%),
                    linear-gradient(135deg, #151515 0%, #070707 60%, #111111 100%)
                `,
            }}
        >
            <div
                className="absolute left-1/2 top-1/2 aspect-square w-[47%] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[24%] border transition-transform duration-700 ease-out group-hover/project:rotate-[20deg] group-hover/project:scale-105"
                style={{
                    borderColor: `${accent}66`,
                    boxShadow: `0 0 80px ${accent}24, inset 0 0 50px ${accent}10`,
                }}
            />
            <div
                className="absolute left-1/2 top-1/2 aspect-square w-[31%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border transition-transform duration-700 ease-out group-hover/project:-rotate-[24deg] group-hover/project:scale-110"
                style={{ borderColor: `${accent}99` }}
            />
            <div
                className={`${spaceGrotesk.className} absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(4rem,10vw,9rem)] font-bold tracking-[-0.08em] text-white/90`}
            >
                {String(index + 1).padStart(2, "0")}
            </div>
            <div
                className="absolute inset-x-0 bottom-0 h-1/3 opacity-40"
                style={{
                    background: `linear-gradient(to top, ${accent}40, transparent)`,
                }}
            />
        </div>
    );
}

function ProjectCard({
    project,
    index,
}: {
    project: SelectedWork;
    index: number;
}) {
    return (
        <article id={`selected-work-card-${index}`}>
            <Link
                aria-label={`View ${project.title}`}
                className="group/project block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                href={project.href}
                rel={project.external ? "noreferrer" : undefined}
                target={project.external ? "_blank" : undefined}
            >
                <div className="relative aspect-[16/11] overflow-hidden bg-zinc-950">
                    <ProjectArtwork index={index} project={project} />

                    <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover/project:bg-black/10" />

                    <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex flex-wrap gap-2 sm:inset-x-6 sm:bottom-6">
                        {project.tags.map((tag) => (
                            <span
                                className={`${courierPrime.className} rounded-md border border-white/10 bg-black/75 px-3 py-1.5 text-[0.65rem] font-bold tracking-[-0.02em] text-zinc-100 sm:text-xs`}
                                key={tag}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <span
                        aria-hidden
                        className={`${courierPrime.className} pointer-events-none absolute right-5 top-5 z-10 grid h-11 w-11 translate-y-2 place-items-center rounded-full border border-white/20 bg-black/75 text-lg text-white opacity-0 transition-[opacity,transform] duration-300 group-focus-visible/project:translate-y-0 group-focus-visible/project:opacity-100`}
                    >
                        &nearr;
                    </span>
                </div>

                <div className="pt-5 sm:pt-6">
                    <h3
                        className={`${spaceGrotesk.className} text-[clamp(2rem,4vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-white transition-colors duration-300 group-hover/project:text-orange-400`}
                    >
                        {project.title}
                    </h3>
                    {project.meta ? (
                        <p
                            className={`${courierPrime.className} mt-3 text-[0.68rem] font-bold tracking-[0.08em] text-zinc-500 sm:text-xs`}
                        >
                            {project.meta}
                        </p>
                    ) : null}
                </div>
            </Link>
        </article>
    );
}

export default function SelectedWorksRoundCursorV3({
    projects = DEFAULT_PROJECTS,
    viewAllHref = "/projects",
    heading = "SELECTED WORKS",
}: SelectedWorksProps) {
    return (
        <section
            aria-labelledby="selected-works-heading"
            className="relative w-full bg-black px-5 py-24 text-white md:px-10 md:py-32 xl:px-16"
        >

            <div className="mx-auto max-w-[1600px]">
                <header className="flex flex-col gap-8 md:justify-between md:gap-12">
                    <div>
                        <h2
                            id="selected-works-heading"
                            className={`${spaceGrotesk.className} text-[clamp(4rem,12.5vw,12.5rem)] font-bold leading-[0.78] tracking-[-0.08em] text-zinc-50`}
                        >
                            {heading}
                        </h2>
                    </div>

                    <Link
                        className={`${courierPrime.className} group/view-all mb-1 inline-flex w-fit shrink-0 self-end items-center gap-3 rounded-full border border-orange-400/70 px-5 py-3 text-xs font-bold tracking-[0.08em] text-orange-300 transition-colors duration-300 hover:bg-orange-500 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black md:mb-2 md:px-6 md:py-3.5 md:text-sm`}
                        href={viewAllHref}
                    >
                        VIEW ALL
                        <span
                            aria-hidden
                            className="transition-transform duration-300 group-hover/view-all:translate-x-1"
                        >
                            &rarr;
                        </span>
                    </Link>
                </header>

                <div className="mt-20 grid gap-x-5 gap-y-20 md:mt-28 lg:grid-cols-2 lg:gap-y-28">
                    {projects.map((project, index) => (
                        <ProjectCard
                            index={index}
                            key={`${project.title}-${index}`}
                            project={project}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}