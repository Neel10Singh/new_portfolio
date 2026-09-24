import Footer from "@/components/Footer";
import { Courier_Prime, Space_Grotesk } from "next/font/google";
import { FaLock, FaCodepen, FaMedal, FaPeopleCarry, FaChalkboard } from "react-icons/fa";
import me from "@/public/gallery/me.png"
import Image from "next/image";
import SelectedWorks, { type SelectedWork } from "@/components/SelectedWorks";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const projects: SelectedWork[] = [
    {
        title: "Orderbook Visualizer",
        href: "https://your-live-demo.com",
        image: "/orderbook.png",
        imageAlt: "Orderbook Visualizer interface",
        tags: ["THREE.JS", "REAL-TIME DATA"],
        info: "A real-time market visualization experience built to make complex orderbook data easier to understand. It transforms bids, asks, trades, and market depth into an interactive interface with a strong focus on clarity, responsiveness, and visual hierarchy. I also used the project to explore Three.js and experiment with presenting financial data in a more immersive and engaging way.",
        meta: "3D MARKET VISUALIZER / 2026",
        external: true,
    },
    {
        title: "Showtime",
        href: "https://your-showtime-demo.com",
        image: "/movietime.png",
        imageAlt: "Showtime movie library interface",
        tags: ["NEXT.JS", "FULL STACK"],
        info: "A full-stack movie library platform built around discovering, organizing, and sharing movies. Users can search for films, create personalized collections, add movies to lists, and share those collections through public URLs. The project focuses heavily on performance, responsive UI, authentication, ownership validation, and creating a smooth experience across the entire application.",
        meta: "MOVIE LIBRARY / 2026",
        external: true,
    },
];


export default function ProjectsPage() {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-black text-white">
        <SelectedWorks
            projects={projects}
            viewAllHref="/projects"
            showAll={true}
        />

      <Footer />
    </main>
  );
}