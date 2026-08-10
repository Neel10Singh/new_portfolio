import { useState } from "react";
import { ExperienceItem } from "./ExperienceTimeline";
import { Courier_Prime } from "next/font/google";
const courierPrime = Courier_Prime({
    subsets: ["latin"],
    weight: ["400", "700"],
});
export default function GlassCard({ item, active, i, uid, cardRefs }: { item: ExperienceItem; active: boolean; i: number; uid: string; cardRefs: React.RefObject<(HTMLDivElement | null)[]> }) {
    
    
    const [hovered, setHovered] = useState(false);
    const [mouse, setMouse] = useState({ x: 50, y: 50 });
    return (
        <div
            ref={(el) => {
                cardRefs.current[i] = el;
            }}
            className="min-w-0 flex-1 card rounded-2xl"
            style={{
                opacity: active ? 1 : 0,
                transition: "opacity 700ms ease, transform 700ms cubic-bezier(.2,.8,.2,1)",
            }}
            
            >
            <div
                className="relative group media-object bg-black overflow-hidden border border-white/15 rounded-2xl p-5  md:p-7"
                style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 24px 60px -24px rgba(0,0,0,0.65)",
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 700ms ease, transform 700ms cubic-bezier(.2,.8,.2,1)",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setMouse({ x, y });
                }}
            >
                
                <div
                    className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
                        hovered ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                        background: `radial-gradient(
                            80px circle at ${mouse.x}% ${mouse.y}%,
                            rgba(125, 211, 252, 0.2),
                            transparent 75%
                        ),
                        radial-gradient(
                            130px circle at ${mouse.x}% ${mouse.y}%,
                            rgba(56, 189, 248, 0.2),
                            transparent 70%
                        ),
                        radial-gradient(
                            240px circle at ${mouse.x}% ${mouse.y}%,
                            rgba(37, 99, 235, 0.4),
                            transparent 72%
                        )
                        `,
                    }}
                />

                
                {/* top sheen + corner bloom */}
                <span className="pointer-events-none sheen transition-opacity absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/60 to-transparent" />
                <span className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

                <div className="relative flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                    <h3 className="text-2xl font-semibold leading-tight text-white md:text-3xl lg:text-4xl ">{item.company}</h3>
                    <p className={`text-lg text-neutral-400 font-medium ${courierPrime.className}`}>
                    {item.role}
                    </p>
                    <span className={`text-lg text-neutral-400 font-medium ${courierPrime.className}`}>
                    {item.period}
                    </span>
                </div>
                <div className="text-right">
                    
                    {item.location && (
                    <p className={`text-sm text-neutral-400 font-medium ${courierPrime.className}`}>
                        {item.location}
                    </p>
                    )}
                </div>
                </div>

                <ul className="relative mt-5 space-y-2.5">
                {item.responsibilities.map((r, j) => (
                    <li key={j} className="flex gap-3 text-lg items-center text-white/75">
                    <span className=" h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-sky-300 to-orange-400" />
                    <span className="min-w-0">{r}</span>
                    </li>
                ))}
                </ul>

                
            </div>
        </div>
    );
}