"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { StaticImageData } from "next/image";
import GlassCard from "./GlassCard";

import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

export type ExperienceItem = {
	company: string;
	role: string;
	period: string;
	location?: string;
	/** /public path or remote URL. Swap for next/image if you prefer. */
	logo?: StaticImageData;
	responsibilities: string[];
	tags?: string[];
};

type Node = { bx: number; by: number; turnY: number };

const CORNER = 24;

const closeEnough = (a: number, b: number, tolerance = 0.25) =>
	Math.abs(a - b) < tolerance;

const sameNodes = (current: Node[], next: Node[]) =>
	current.length === next.length &&
	current.every(
		(node, index) =>
			closeEnough(node.bx, next[index].bx) &&
			closeEnough(node.by, next[index].by) &&
			closeEnough(node.turnY, next[index].turnY),
	);

function buildPath(nodes: Node[]): string {
	if (nodes.length === 0) return "";
	let d = `M ${nodes[0].bx} ${nodes[0].by}`;

	for (let i = 0; i < nodes.length; i++) {
		const cur = nodes[i];
		const next = nodes[i + 1];

		if (!next) {
		d += ` L ${cur.bx} ${cur.turnY}`; // tail below the last card
		break;
		}

		const dir = Math.sign(next.bx - cur.bx); // +1 → right, -1 → left, 0 → same rail

		if (dir === 0) {
		d += ` L ${cur.bx} ${next.by}`; // mobile: one straight rail
		continue;
		}

		const ty = cur.turnY;
		const r = Math.max(
		0,
		Math.min(CORNER, Math.abs(next.bx - cur.bx) / 2, Math.abs(ty - cur.by), Math.abs(next.by - ty)),
		);

		d += ` L ${cur.bx} ${ty - r}`;                              // down the rail
		d += ` Q ${cur.bx} ${ty} ${cur.bx + dir * r} ${ty}`;        // corner out
		d += ` L ${next.bx - dir * r} ${ty}`;                       // across
		d += ` Q ${next.bx} ${ty} ${next.bx} ${ty + r}`;            // corner down
		d += ` L ${next.bx} ${next.by}`;                            // down to next bubble
	}
	return d;
}

const initials = (s: string) =>
  s
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function ExperienceTimeline({
	items,
	heading = "EXPERIENCE",
}: {
	items: ExperienceItem[];
	heading?: string;
}) {
	const uid = useId().replace(/:/g, "");
	const wrapRef = useRef<HTMLDivElement | null>(null);
	const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);
	const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
	const pathRef = useRef<SVGPathElement | null>(null);
	const lenRef = useRef(0);

	const [size, setSize] = useState({ w: 0, h: 0 });
	const [nodes, setNodes] = useState<Node[]>([]);
	const [len, setLen] = useState(0);
	const [prog, setProg] = useState({ drawn: 0, tipX: 0, tipY: -1 });

	/* ---------- measure real layout -> path geometry ---------- */
	const measure = useCallback(() => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		const cr = wrap.getBoundingClientRect();
		const next: Node[] = [];

		for (let i = 0; i < items.length; i++) {
		const b = bubbleRefs.current[i]?.getBoundingClientRect();
		const c = cardRefs.current[i]?.getBoundingClientRect();
		if (!b || !c) return;

		const cardBottom = c.bottom - cr.top;
		const nc = cardRefs.current[i + 1]?.getBoundingClientRect();
		const turnY = nc ? (cardBottom + (nc.top - cr.top)) / 2 : cardBottom;

		next.push({
			bx: b.left - cr.left + b.width / 2,
			by: b.top - cr.top + b.height / 2,
			turnY,
		});
		}

			setSize((previous) =>
				closeEnough(previous.w, cr.width) && closeEnough(previous.h, cr.height)
					? previous
					: { w: cr.width, h: cr.height },
			);
			setNodes((previous) => (sameNodes(previous, next) ? previous : next));
	}, [items.length]);

	useEffect(() => {
		measure();
		const wrap = wrapRef.current;
		if (!wrap) return;
		const ro = new ResizeObserver(measure);
		ro.observe(wrap);
		// late-loading fonts/logos reflow the cards
		document.fonts?.ready.then(measure).catch(() => {});
		return () => ro.disconnect();
	}, [measure]);

	useEffect(() => {
			if (!pathRef.current || nodes.length === 0) return;
			const total = pathRef.current.getTotalLength();
			if (closeEnough(lenRef.current, total)) return;
			lenRef.current = total;
			setLen(total);
		}, [nodes]);

	/* ---------- scroll-driven reveal ---------- */
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		setProg({ drawn: 1, tipX: 0, tipY: Number.POSITIVE_INFINITY });
		return;
		}

		let raf = 0;
		const update = () => {
		raf = 0;
		const wrap = wrapRef.current;
		if (!wrap) return;

		const r = wrap.getBoundingClientRect();
		const trigger = window.innerHeight * 0.72; // line tip tracks this screen line
		const drawn = Math.min(1, Math.max(0, (trigger - r.top) / Math.max(r.height, 1)));

			const path = pathRef.current;
			const total = lenRef.current;
			const nextProg = path && total > 0
				? (() => {
					const pt = path.getPointAtLength(total * drawn);
					return { drawn, tipX: pt.x, tipY: pt.y };
				})()
				: { drawn, tipX: 0, tipY: -1 };

			setProg((previous) =>
				closeEnough(previous.drawn, nextProg.drawn, 0.0001) &&
				closeEnough(previous.tipX, nextProg.tipX) &&
				closeEnough(previous.tipY, nextProg.tipY)
					? previous
					: nextProg,
			);
			};

		const onScroll = () => {
		if (!raf) raf = requestAnimationFrame(update);
		};

		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
		window.removeEventListener("scroll", onScroll);
		window.removeEventListener("resize", onScroll);
		if (raf) cancelAnimationFrame(raf);
		};
	}, [len]);

	const d = buildPath(nodes);
	const offset = len * (1 - prog.drawn);

	return (
		<div id="experience" className="overflow-x-clip px-5 py-24 2xl:px-60 lg:px-40 md:py-32 w-full flex flex-col items-center">
		<h2 className={`mb-14 text-center font-bold text-white mix-blend-difference ${spaceGrotesk.className} text-[clamp(4rem,16vw,40rem)] md:mb-20`}>
			{heading}
		</h2>
		<section className="relative  w-full max-w-7xl  ">
			<style>{`
			@keyframes ${uid}float {
				0%, 100% { transform: translateY(0) }
				50%      { transform: translateY(-5px) }
			}
			`}</style>

			

			<div ref={wrapRef} className="relative">
			{size.w > 0 && (
				<svg
				aria-hidden
				className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
				viewBox={`0 0 ${size.w} ${size.h}`}
				>
				<defs>
					<linearGradient id={`${uid}g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={size.h}>
					<stop offset="0%" stopColor="#22b0f2" />
					<stop offset="40%" stopColor="#206ab0" />
					<stop offset="50%" stopColor="#22b0f2" />
					<stop offset="78%" stopColor="#22b0f2" />
					<stop offset="100%" stopColor="#22b0f2" />
					</linearGradient>
					<filter id={`${uid}glow`} x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="6" />
					</filter>
				</defs>

				{/* unfilled track */}
				<path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={2} strokeLinecap="round" />
				{/* bloom */}
				<path
					d={d}
					fill="none"
					stroke={`url(#${uid}g)`}
					strokeWidth={8}
					strokeLinecap="round"
					opacity={0.45}
					filter={`url(#${uid}glow)`}
					strokeDasharray={len}
					strokeDashoffset={offset}
				/>
				{/* core */}
				<path
					ref={pathRef}
					d={d}
					fill="none"
					stroke={`url(#${uid}g)`}
					strokeWidth={2.5}
					strokeLinecap="round"
					strokeDasharray={len || undefined}
					strokeDashoffset={len ? offset : undefined}
				/>
				{/* travelling tip */}
				{prog.drawn > 0.001 && prog.drawn < 0.999 && (
					<>
					<circle cx={prog.tipX} cy={prog.tipY} r={7} fill="#fed7aa" opacity={0.7} filter={`url(#${uid}glow)`} />
					<circle cx={prog.tipX} cy={prog.tipY} r={3} fill="#fff" />
					</>
				)}
				</svg>
			)}

			{items.map((item, i) => {
				const flip = i % 2 === 1; // odd rows: bubble right, card left
				const active = prog.drawn > 0.001 && prog.tipY >= (nodes[i]?.by ?? Number.POSITIVE_INFINITY) - 4;

				return (
				<div
					key={`${item.company}-${i}`}
					className={`relative flex items-start gap-4 md:gap-10 ${flip ? "md:flex-row-reverse" : ""} ${
					i > 0 ? "mt-12 md:mt-20" : ""
					}`}
				>
					{/* ---------- rail + water bubble ---------- */}
					<div className="flex w-14 shrink-0 justify-center md:w-24">
					{/* static wrapper — measured, never transformed */}
					<div
						ref={(el) => {
						bubbleRefs.current[i] = el;
						}}
						className="relative h-14 w-14 md:h-[68px] md:w-[68px]"
					>
						<div
						className="absolute inset-0 rounded-full"
						style={{
							animation: `${uid}float ${6 + (i % 3)}s ease-in-out ${i * 0.45}s infinite`,
							backdropFilter: "blur(6px) saturate(170%)",
							WebkitBackdropFilter: "blur(6px) saturate(170%)",
							background:
							"radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 34%, rgba(255,255,255,0.01) 58%, rgba(255,255,255,0.1) 100%)",
							boxShadow: [
							"inset 0 1.5px 1px rgba(255,255,255,0.3)",
							"inset 0 -10px 18px rgba(255,255,255,0.02)",
							"inset 0 10px 22px rgba(0,0,0,0.20)",
							"0 0 0 1px rgba(255,255,255,0.10)",
							"0 12px 30px rgba(0,0,0,0.40)",
							active ? "0 0 28px 5px rgba(251,146,60,0.15)" : "0 0 0 0 rgba(251,146,60,0)",
							].join(", "),
							opacity: active ? 1 : 0.4,
							transition: "opacity 700ms ease, box-shadow 700ms ease",
						}}
						>
						{/* specular highlight */}
						<span className="pointer-events-none absolute left-[17%] top-[11%] h-[24%] w-[33%] rounded-full bg-white/25 blur-[3px]" />
						{/* refracted rim light from below */}
						<span
							className="pointer-events-none absolute inset-0 rounded-full"
							style={{
							background: "radial-gradient(58% 38% at 50% 108%, rgba(255,255,255,0.25), transparent 70%)",
							}}
						/>
						<span className="absolute inset-0 grid place-items-center">
							{item.logo ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={item.logo.src}
								alt=""
								className="h-1/2 w-1/2 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
							/>
							) : (
							<span className="font-mono text-xs font-bold text-white md:text-sm">
								{initials(item.company)}
							</span>
							)}
						</span>
						</div>
					</div>
					</div>

					{/* ---------- glass card ---------- */}
					<GlassCard item={item} active={active} i={i} uid={uid} cardRefs={cardRefs} />
				</div>
				);
			})}
			</div>
		</section>
		</div>
	);
}