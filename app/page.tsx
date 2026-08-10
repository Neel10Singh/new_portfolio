import ExperienceTimeline, { type ExperienceItem } from "@/components/ExperienceTimeline";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import SkillsSection from "@/components/SkillsSection"
import hbwslLogo from "@/public/hbwsl.png";
import CodehopLogo from "@/public/codehop.png";
import SelectedWorks, { type SelectedWork } from "@/components/SelectedWorks";
import Gallery from "@/components/Gallery";

import strip1 from "@/public/gallery/strip-1.png";
import strip2 from "@/public/gallery/strip-2.png";
import strip3 from "@/public/gallery/strip-3.png";
import strip4 from "@/public/gallery/strip-4.png";
import strip5 from "@/public/gallery/strip-5.png";
import Recommendations from "@/components/Recommendations";

const experience: ExperienceItem[] = [
    {
        company: "Hummingbird Web Solutions",
        role: "Software Development Engineer L2",
        period: "July, 2024 — Present",
        location: "Pune, India",
        logo: hbwslLogo,
        responsibilities: [
        "Built and shipped customer-facing React.js SaaS dashboard features with reusable UI components, responsive layouts, pagination, lazy loading, and code-splitting to support large consent, scan, and policy datasets.",
        "Reduced P95 page load latency by 65–70% by optimizing critical frontend and backend flows, improving onboarding and conversion for 1,000+ users/month.",
        "Implemented consent management integrations (Google Consent Mode, IAB TCF v2.2, Google Additional Consent Mode), driving a 15% increase in product installations.",
        "Collaborated with product, design, and engineering stakeholders to translate user requirements into technically feasible, production-ready UI workflows.",
        "Developed scalable backend services and a Puppeteer-based cookie scanning system, leveraging message streaming to manage high concurrency and validated system stability under 1M+ simulated scan requests using load-testing workflows.",
        ],
    },
    {
        company: "Codehop Interfusion",
        role: "Software Development Intern",
        period: "August, 2023 — January, 2024",
        location: "Remote",
        logo: CodehopLogo,
        responsibilities: [
        "Designed and implemented core application workflows, data models, and access control logic for a sales & management system.",
        "Integrated PayPal payments and built role-based access management workflows to strengthen authorization across critical user actions.",
        "Formed a role-based access control system with 120+ granular permissions across the application.",
        "Engineered hybrid server-side and client-side pagination, decreasing table load time by 80%.",
        "Led and managed a team of 6 interns throughout the project lifecycle, provided coaching and mentorship.",
        ],
    },
  // ...
];

const projects: SelectedWork[] = [
    {
        title: "Orderbook Visualizer",
        href: "https://your-live-demo.com",
        image: "/orderbook.png",
        imageAlt: "Orderbook Visualizer interface",
        tags: ["THREE.JS", "REAL-TIME DATA"],
        meta: "3D MARKET VISUALIZER / 2026",
        external: true,
    },
    {
        title: "Showtime",
        href: "https://your-showtime-demo.com",
        image: "/movietime.png",
        imageAlt: "Showtime movie library interface",
        tags: ["NEXT.JS", "FULL STACK"],
        meta: "MOVIE LIBRARY / 2026",
        external: true,
    },
];
export default function Home() {
	return (
		<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <Hero />
            <div 
                style={{
                    background:
                        "radial-gradient(ellipse 1400% 100% at 50% 0%, #f79947 0%, #f07f36 35%, #8b1f03 75%, #000000 100%)",
                }}
                className="h-[150px] w-full relative after:absolute after:w-full after:h-full after:backdrop-blur-[7.1px]"
            />
            <Intro />
            {/* <ProfessionalExperienceTimeline /> */}
            <ExperienceTimeline items={experience} />
            <SkillsSection />
            <SelectedWorks 
                projects={projects}
                viewAllHref="/projects"
            />
            <Gallery
                images={[
                    { src: strip1, alt: "Project view one" },
                    { src: strip2, alt: "Project view two" },
                    { src: strip3, alt: "Project view three" },
                    { src: strip4, alt: "Project view four" },
                    { src: strip5, alt: "Project view five" },
                ]}
            />
            <Recommendations />
        </div>
	);
}
