"use client";

import { Space_Grotesk } from "next/font/google";
import { motion } from "framer-motion";


const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

import { useEffect, useState } from "react";
import FireBackground from "@/components/FireBackground";
import FloatingFireLinks from "@/components/FLoatingFireLinks";
import FireLinksScene from "@/components/FireLinksScene"
const Hero = () => {

    const [compact, setCompact] = useState(false);
    const [screenWidth, setScreenWidth] = useState(0)

    const getExpandedFontSize = (width) => {
        if (width < 768) {
            return Math.min(Math.max(48, width * 0.20), 128);
        }

        return Math.min(Math.max(64, width * 0.12), 560);
    };

    useEffect(() => {
        const handleResize = () => {
            const nextWidth = window.innerWidth;

            setScreenWidth((previous) =>
                previous === nextWidth ? previous : nextWidth,
            );
        };

        handleResize(); // Set initial width

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    useEffect(() => {
        let rafId = 0;

        const handleScroll = () => {
            cancelAnimationFrame(rafId);

            rafId = requestAnimationFrame(() => {
            const nextCompact = window.scrollY > window.innerHeight * 0.2;

            setCompact(prev =>
                prev === nextCompact ? prev : nextCompact
            );
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return(
        <div className="w-full h-dvh">
            
            <div className="h-dvh relative isolate overflow-hidden">
                <FireBackground speed={3}/>
                <FireLinksScene
                    className="z-10"
                />
                {/* <div className="z-10 relative h-full w-full bg-white/0 backdrop-blur-[7.1px]"></div> */}
                <div className="absolute flex z-20 justify-between h-[50vh] w-[70vw] top-1/2 left-1/2 -translate-1/2">
                    <div className="lines relative line1 h-full w-1 overflow-hidden bg-linear-to-b from-neutral-500/10 via-neutral-500/20 to-transparent"/>
                    <div className="lines relative line3 h-full w-1 overflow-hidden bg-linear-to-b from-neutral-500/10 via-neutral-500/20 to-transparent"/>
                    <div className="lines relative line2 hiden md:inline h-full w-1 overflow-hidden bg-linear-to-b from-neutral-500/10 via-neutral-500/20 to-transparent"/>
                </div>
                
                <motion.h1 
                    initial={false}
                    animate={{
                        top: compact ? 8 : "50%",
                        left: compact ? 20 : "50%",
                        x: compact ? 0 : "-50%",
                        y: compact ? 0 : "-50%",
                        fontSize: compact ? 24 : getExpandedFontSize(screenWidth),
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 28,
                    }}
                    className={`fixed z-40 md:whitespace-nowrap text-center font-bold text-white mix-blend-difference ${spaceGrotesk.className}`}>
                    NEEL//KSH <span className="hidden md:inline">SINGH</span>
                </motion.h1>
                    
                {/* <FloatingFireLinks /> */}
                
            </div>
        </div>
    )
}

export default Hero