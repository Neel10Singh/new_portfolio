"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { SimpleIcon } from "simple-icons";
import {
    siApachekafka,
    siBlender,
    siC,
    siCplusplus,
    siCss,
    siDocker,
    siExpress,
    siGit,
    siGithub,
    siGraphql,
    siHtml5,
    siJavascript,
    siLinux,
    siMongodb,
    siMysql,
    siNextdotjs,
    siNodedotjs,
    siPagespeedinsights,
    siPhp,
    siPython,
    siReact,
    siRedux,
    siTailwindcss,
    siThealgorithms,
    siThreedotjs,
    siTypescript,
    siVuedotjs,
    siWebpack,
    siWordpress,
} from "simple-icons";
import { Courier_Prime, Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const courierPrime = Courier_Prime({
    subsets: ["latin"],
    weight: ["400", "700"],
});

type SymbolKind = "lock" | "devices" | "network" | "stack" | "blocks";

type Skill = {
    name: string;
    icon?: SimpleIcon;
    symbol?: SymbolKind;
    /** Optional visual override, useful for black brand marks on a black card. */
    color?: string;
};

type SkillGroup = {
    title: string;
    skills: Skill[];
};

/* Exact headings and skills from the supplied resume. */
const SKILL_GROUPS: SkillGroup[] = [
    {
        title: "Languages",
        skills: [
            { name: "C++", icon: siCplusplus },
            { name: "JavaScript", icon: siJavascript },
            { name: "TypeScript", icon: siTypescript },
            { name: "Python", icon: siPython },
            { name: "C", icon: siC },
            { name: "PHP", icon: siPhp },
        ],
    },
    {
        title: "Frontend",
        skills: [
            { name: "React.js", icon: siReact },
            { name: "Next.js", icon: siNextdotjs, color: "#f5f5f5" },
            { name: "Three.js", icon: siThreedotjs, color: "#f5f5f5" },
            { name: "Vue.js", icon: siVuedotjs },
            { name: "HTML5", icon: siHtml5 },
            { name: "CSS3", icon: siCss },
            { name: "Redux", icon: siRedux },
            { name: "Tailwind CSS", icon: siTailwindcss },
            { name: "Responsive UI", symbol: "devices", color: "#38bdf8" },
            {
                name: "Frontend Performance Optimization",
                icon: siPagespeedinsights,
            },
            { name: "Webpack", icon: siWebpack },
        ],
    },
    {
        title: "Backend",
        skills: [
            { name: "Node.js", icon: siNodedotjs },
            { name: "Express.js", icon: siExpress, color: "#f5f5f5" },
            { name: "NextAuth", symbol: "lock", color: "#a78bfa" },
            { name: "GraphQL", icon: siGraphql },
            { name: "REST API", symbol: "network", color: "#fb923c" },
            { name: "WordPress", icon: siWordpress },
        ],
    },
    {
        title: "Databases",
        skills: [
            { name: "MySQL", icon: siMysql },
            { name: "MongoDB", icon: siMongodb },
        ],
    },
    {
        title: "Tools & Systems",
        skills: [
            { name: "Docker", icon: siDocker },
            { name: "Blender", icon: siBlender },
            { name: "Linux", icon: siLinux },
            { name: "Kafka", icon: siApachekafka, color: "#f5f5f5" },
            { name: "Git", icon: siGit },
            { name: "GitHub", icon: siGithub, color: "#f5f5f5" },
            { name: "Webpack", icon: siWebpack },
        ],
    },
    {
        title: "CS Fundamentals",
        skills: [
            { name: "System Design", symbol: "network", color: "#fb923c" },
            { name: "Data Structures", symbol: "stack", color: "#60a5fa" },
            { name: "Algorithms", icon: siThealgorithms, color: "#f5f5f5" },
            {
                name: "Object-Oriented Design (OOP)",
                symbol: "blocks",
                color: "#c084fc",
            },
        ],
    },
];

const GROUP_OFFSETS = SKILL_GROUPS.map((_, groupIndex) =>
    SKILL_GROUPS.slice(0, groupIndex).reduce(
        (total, group) => total + group.skills.length,
        0,
    ),
);

/*
 * A tiny generated matcap keeps the component self-contained: no lights,
 * environment maps, or extra texture request. Every logo reuses this texture.
 */
function createMatcapTexture(size = 64) {
    const pixels = new Uint8Array(size * size * 4);

    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            const nx = (x / (size - 1)) * 2 - 1;
            const ny = (y / (size - 1)) * 2 - 1;
            const radius = Math.min(1, Math.hypot(nx, ny));
            const dome = Math.sqrt(Math.max(0, 1 - radius * radius));
            const highlight = Math.exp(
                -((nx + 0.34) ** 2 + (ny - 0.38) ** 2) * 9,
            );
            const edge = Math.pow(1 - dome, 2);
            const value = Math.min(
                255,
                Math.round(58 + dome * 142 + highlight * 68 + edge * 18),
            );
            const offset = (y * size + x) * 4;

            pixels[offset] = value;
            pixels[offset + 1] = value;
            pixels[offset + 2] = value;
            pixels[offset + 3] = 255;
        }
    }

    const texture = new THREE.DataTexture(
        pixels,
        size,
        size,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

const SHARED_MATCAP = createMatcapTexture();
const ICON_GEOMETRY_CACHE = new Map<string, THREE.ExtrudeGeometry[]>();

function getIconGeometries(icon: SimpleIcon) {
    const cached = ICON_GEOMETRY_CACHE.get(icon.slug);
    if (cached) return cached;

    const loader = new SVGLoader();
    const svg = loader.parse(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${icon.path}" /></svg>`,
    );
    const geometries: THREE.ExtrudeGeometry[] = [];

    for (const path of svg.paths) {
        for (const shape of SVGLoader.createShapes(path)) {
            geometries.push(
                new THREE.ExtrudeGeometry(shape, {
                    depth: 3,
                    steps: 1,
                    curveSegments: 3,
                    bevelEnabled: true,
                    bevelSegments: 2,
                    bevelSize: 0.28,
                    bevelThickness: 0.42,
                }),
            );
        }
    }

    const bounds = new THREE.Box3();
    bounds.makeEmpty();
    for (const geometry of geometries) {
        geometry.computeBoundingBox();
        if (geometry.boundingBox) bounds.union(geometry.boundingBox);
    }

    if (!bounds.isEmpty()) {
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const scale = 1.72 / Math.max(size.x, size.y, 1);

        for (const geometry of geometries) {
            geometry.translate(-center.x, -center.y, -center.z);
            geometry.scale(scale, scale, scale);
            // SVG coordinates grow downward; this keeps brand marks upright.
            geometry.rotateX(Math.PI);
            geometry.computeVertexNormals();
        }
    }

    ICON_GEOMETRY_CACHE.set(icon.slug, geometries);
    return geometries;
}

function brandColor(skill: Skill) {
    if (skill.color) return skill.color;
    return skill.icon ? `#${skill.icon.hex}` : "#fb923c";
}

function MatcapMaterial({ color }: { color: string }) {
    return (
        <meshMatcapMaterial
            attach="material"
            color={color}
            matcap={SHARED_MATCAP}
        />
    );
}

function BrandMark({ icon, color }: { icon: SimpleIcon; color: string }) {
    const geometries = useMemo(() => getIconGeometries(icon), [icon]);

    return (
        <group>
            {geometries.map((geometry, index) => (
                <mesh
                    // The geometry cache is shared by duplicate resume entries.
                    dispose={null}
                    geometry={geometry}
                    key={`${icon.slug}-${index}`}
                >
                    <MatcapMaterial color={color} />
                </mesh>
            ))}
        </group>
    );
}

function LockSymbol({ color }: { color: string }) {
    return (
        <group scale={0.9}>
            <mesh position={[0, -0.22, 0]} scale={[1.25, 0.88, 0.38]}>
                <boxGeometry args={[1, 1, 1]} />
                <MatcapMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.36, 0]}>
                <torusGeometry args={[0.48, 0.13, 10, 28, Math.PI]} />
                <MatcapMaterial color={color} />
            </mesh>
        </group>
    );
}

function DevicesSymbol({ color }: { color: string }) {
    return (
        <group>
            <mesh position={[-0.16, 0.1, 0]} scale={[1.35, 0.88, 0.14]}>
                <boxGeometry args={[1, 1, 1]} />
                <MatcapMaterial color={color} />
            </mesh>
            <mesh position={[-0.16, -0.52, 0]} scale={[0.55, 0.13, 0.2]}>
                <boxGeometry args={[1, 1, 1]} />
                <MatcapMaterial color={color} />
            </mesh>
            <mesh position={[0.63, -0.18, 0.16]} scale={[0.4, 0.82, 0.2]}>
                <boxGeometry args={[1, 1, 1]} />
                <MatcapMaterial color="#fdba74" />
            </mesh>
        </group>
    );
}

function NetworkSymbol({ color }: { color: string }) {
    const nodePositions: [number, number, number][] = [
        [-0.74, 0, 0],
        [0.74, 0, 0],
        [0, 0.66, 0],
        [0, -0.66, 0],
    ];

    return (
        <group>
            <mesh scale={[1.35, 0.12, 0.12]}>
                <boxGeometry args={[1, 1, 1]} />
                <MatcapMaterial color={color} />
            </mesh>
            <mesh scale={[0.12, 1.2, 0.12]}>
                <boxGeometry args={[1, 1, 1]} />
                <MatcapMaterial color={color} />
            </mesh>
            <mesh>
                <sphereGeometry args={[0.24, 18, 12]} />
                <MatcapMaterial color="#fed7aa" />
            </mesh>
            {nodePositions.map((position) => (
                <mesh key={position.join("-")} position={position}>
                    <sphereGeometry args={[0.18, 16, 10]} />
                    <MatcapMaterial color={color} />
                </mesh>
            ))}
        </group>
    );
}

function StackSymbol({ color }: { color: string }) {
    return (
        <group rotation={[0.08, 0, -0.08]}>
            {[-0.48, 0, 0.48].map((y, index) => (
                <mesh
                    key={y}
                    position={[index * 0.08 - 0.08, y, index * 0.08]}
                    scale={[1.25, 0.3, 0.72]}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <MatcapMaterial color={index === 1 ? "#fdba74" : color} />
                </mesh>
            ))}
        </group>
    );
}

function BlocksSymbol({ color }: { color: string }) {
    const blocks: [number, number, number][] = [
        [-0.48, -0.38, 0],
        [0.48, -0.38, 0],
        [0, 0.42, 0],
    ];

    return (
        <group>
            {blocks.map((position, index) => (
                <mesh
                    key={position.join("-")}
                    position={position}
                    rotation={[0.1, index * 0.2, 0]}
                    scale={0.62}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <MatcapMaterial color={index === 2 ? "#fb923c" : color} />
                </mesh>
            ))}
        </group>
    );
}

function ProceduralMark({ kind, color }: { kind: SymbolKind; color: string }) {
    switch (kind) {
        case "lock":
            return <LockSymbol color={color} />;
        case "devices":
            return <DevicesSymbol color={color} />;
        case "network":
            return <NetworkSymbol color={color} />;
        case "stack":
            return <StackSymbol color={color} />;
        case "blocks":
            return <BlocksSymbol color={color} />;
    }
}

function RotatingLogo({
    skill,
    index,
    animate,
}: {
    skill: Skill;
    index: number;
    animate: boolean;
}) {
    const logoRef = useRef<THREE.Group>(null);
    const { invalidate } = useThree();
    const color = brandColor(skill);

    useEffect(() => {
        // Ensures a final static frame when animation is paused.
        invalidate();
    }, [animate, invalidate]);

    useFrame((state, delta) => {
        if (!animate || !logoRef.current) return;

        logoRef.current.rotation.y += delta * (0.5 + (index % 4) * 0.035);
        logoRef.current.rotation.x =
            Math.sin(state.clock.elapsedTime * 0.65 + index * 0.4) * 0.09;
    });

    return (
        <group ref={logoRef} rotation={[0, index * 0.23, 0]}>
            {skill.icon ? (
                <BrandMark color={color} icon={skill.icon} />
            ) : skill.symbol ? (
                <ProceduralMark color={color} kind={skill.symbol} />
            ) : null}
        </group>
    );
}

function LogoScene({
    skill,
    index,
    animate,
}: {
    skill: Skill;
    index: number;
    animate: boolean;
}) {
    return (
        <>
            <PerspectiveCamera makeDefault fov={32} position={[0, 0, 5]} />
            <RotatingLogo animate={animate} index={index} skill={skill} />
        </>
    );
}

function useAnimationState(sectionRef: React.RefObject<HTMLElement | null>) {
    const [sectionIsNear, setSectionIsNear] = useState(false);
    const [pageIsVisible, setPageIsVisible] = useState(true);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => setSectionIsNear(entry.isIntersecting),
            { rootMargin: "300px 0px" },
        );
        observer.observe(section);
        return () => observer.disconnect();
    }, [sectionRef]);

    useEffect(() => {
        const updateVisibility = () =>
            setPageIsVisible(document.visibilityState === "visible");
        updateVisibility();
        document.addEventListener("visibilitychange", updateVisibility);
        return () =>
            document.removeEventListener("visibilitychange", updateVisibility);
    }, []);

    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updateMotionPreference = () => setReduceMotion(query.matches);
        updateMotionPreference();
        query.addEventListener("change", updateMotionPreference);
        return () => query.removeEventListener("change", updateMotionPreference);
    }, []);

    return sectionIsNear && pageIsVisible && !reduceMotion;
}

function SkillCard({
    skill,
    viewIndex,
    animate,
}: {
    skill: Skill;
    viewIndex: number;
    animate: boolean;
}) {
    return (
        <article className="group relative isolate h-40 overflow-hidden rounded-2xl border border-white/10 bg-[#090909] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-orange-400/50 hover:shadow-[0_18px_50px_rgba(249,115,22,0.10)]">
            <div
                aria-hidden
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        "radial-gradient(220px circle at 50% 18%, rgba(251,146,60,0.16), rgba(234,88,12,0.06) 42%, transparent 72%)",
                }}
            />

            <View
                className="pointer-events-none absolute inset-x-0 top-2 h-[112px]"
                index={viewIndex}
            >
                <LogoScene animate={animate} index={viewIndex} skill={skill} />
            </View>

            <p
                className={`${courierPrime.className} absolute inset-x-3 bottom-4 z-30 text-center text-xs font-bold leading-snug text-zinc-300 transition-colors duration-300 group-hover:text-orange-100 sm:text-sm`}
            >
                {skill.name}
            </p>
        </article>
    );
}

export default function SkillsSection() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const shouldAnimate = useAnimationState(sectionRef);

    return (
        <section
            ref={sectionRef}
            aria-labelledby="skills-heading"
            className="relative isolate w-full bg-black px-5 py-24 pt-12 text-white md:px-10 md:py-32  md:pt-12 xl:px-16"
        >
            <div className="relative mx-auto max-w-[1600px]">
                
                <h2
                    id="skills-heading"
                    className={`${spaceGrotesk.className} text-[clamp(4rem,13vw,12rem)] font-bold leading-[0.82] tracking-[-0.075em] text-white`}
                >
                    SKILLS<span className="text-orange-500">.</span>
                </h2>

                <div className="mt-20 space-y-24 md:mt-28 md:space-y-32">
                    {SKILL_GROUPS.map((group, groupIndex) => (
                        <div key={group.title}>
                            <h3
                                className={`${spaceGrotesk.className} mb-8 flex items-center gap-3 text-3xl font-semibold tracking-[-0.035em] text-white md:mb-10 md:text-5xl`}
                            >
                                {group.title}
                                <span aria-hidden className="text-orange-500">
                                    &rarr;
                                </span>
                            </h3>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                {group.skills.map((skill, skillIndex) => {
                                    const absoluteIndex =
                                        GROUP_OFFSETS[groupIndex] + skillIndex;

                                    return (
                                        <SkillCard
                                            animate={shouldAnimate}
                                            key={`${group.title}-${skill.name}`}
                                            skill={skill}
                                            viewIndex={absoluteIndex + 1}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/*
             * View.Port draws every card into this one transparent WebGL canvas.
             * A separate Canvas per card would create too many WebGL contexts.
             */}
            <Canvas
                aria-hidden
                dpr={[1, 1.5]}
                frameloop={shouldAnimate ? "always" : "demand"}
                gl={{
                    alpha: true,
                    antialias: true,
                    powerPreference: "high-performance",
                }}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 20,
                    width: "100vw",
                    height: "100vh",
                    pointerEvents: "none",
                }}
            >
                <View.Port />
            </Canvas>
        </section>
    );
}
