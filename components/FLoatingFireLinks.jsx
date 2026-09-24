"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { HiOutlineDocumentText } from "react-icons/hi2";

const linkItems = [
  {
    label: "LeetCode",
    href: "https://leetcode.com/your-profile",
    Icon: SiLeetcode,
    left: "14%",
    size: 76,
    duration: 15,
    delay: 0,
  },
  {
    label: "GitHub",
    href: "https://github.com/your-profile",
    Icon: FaGithub,
    left: "33%",
    size: 86,
    duration: 17,
    delay: 2,
  },
  {
    label: "Resume",
    href: "/resume.pdf",
    Icon: HiOutlineDocumentText,
    left: "67%",
    size: 80,
    duration: 16,
    delay: 1,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/your-profile",
    Icon: FaLinkedin,
    left: "84%",
    size: 90,
    duration: 18,
    delay: 3,
  },
];

function EmberLink({ item }) {
  const { Icon } = item;

  return (
    <motion.div
      className="pointer-events-auto absolute z-50"
      style={{
        left: item.left,
        bottom: "3%",
      }}
      initial={{
        y: "0vh",
        x: 0,
        rotate: -8,
        opacity: 0,
        scale: 0.82,
      }}
      animate={{
        y: ["0vh", "-12vh", "-35vh", "-62vh", "-95vh"],
        x: [0, 18, -12, 24, -16],
        rotate: [-8, 6, -4, 5, -2],
        opacity: [0, 1, 1, 0.85, 0],
        scale: [0.82, 1, 1.04, 0.98, 0.9],
      }}
      transition={{
        duration: item.duration,
        delay: item.delay,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.12, 0.5, 0.78, 1],
      }}
    >
      <a
        href={item.href}
        target={item.href.startsWith("http") ? "_blank" : undefined}
        rel={item.href.startsWith("http") ? "noreferrer" : undefined}
        aria-label={item.label}
        className="group relative block"
      >
        {/* outer heated glow */}
        <div
          className="
            pointer-events-none
            absolute
            -inset-5
            rounded-full
            bg-[radial-gradient(circle,rgba(255,180,100,0.16)_0%,rgba(249,115,22,0.09)_38%,transparent_72%)]
            blur-xl
          "
        />

        {/* ember trail */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[80%]
            h-24
            w-7
            -translate-x-1/2
            rounded-full
            bg-gradient-to-b
            from-orange-300/25
            via-orange-500/10
            to-transparent
            blur-xl
                "
                />

                {/* glass orb */}
                <motion.div
        whileHover={{
            scale: 1.08,
            y: -4,
            rotate: 0,
        }}
        transition={{
            type: "spring",
            stiffness: 260,
            damping: 18,
        }}
        className="relative"
        style={{
            width: item.size,
            height: item.size,
        }}
        >
        {/* warm outer glow */}
        <div
            className="
            pointer-events-none
            absolute
            -inset-5
            blur-xl
            opacity-70
            "
            style={{
            background:
                "radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.08) 35%, transparent 72%)",
            }}
        />

        {/* faceted outer shell */}
        <div
            className="
            relative
            h-full
            w-full
            overflow-hidden
            backdrop-blur-[7px]
            backdrop-saturate-[1.45]
            backdrop-brightness-[1.1]
            backdrop-contrast-[1.08]
            shadow-[0_10px_35px_rgba(0,0,0,0.28),0_0_30px_rgba(249,115,22,0.14)]
            "
            style={{
            clipPath:
                "polygon(22% 6%, 70% 2%, 93% 25%, 88% 70%, 61% 96%, 24% 92%, 5% 60%, 8% 22%)",
            background:
                "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.025) 35%, rgba(0,0,0,0.20) 100%)",
            border: "1px solid rgba(255,255,255,0.22)",
            }}
        >
            {/* soft smoky inner body */}
            <div
            className="pointer-events-none absolute inset-[7%]"
            style={{
                clipPath:
                "polygon(18% 8%, 68% 3%, 91% 24%, 86% 69%, 60% 93%, 24% 89%, 8% 59%, 10% 23%)",
                background:
                "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.07), rgba(255,255,255,0.015) 40%, rgba(0,0,0,0.16) 100%)",
            }}
            />

            {/* facet planes */}
            <div
            className="pointer-events-none absolute inset-[10%]"
            style={{
                clipPath: "polygon(8% 28%, 48% 8%, 60% 46%, 22% 56%)",
                background:
                "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.015))",
            }}
            />
            <div
            className="pointer-events-none absolute inset-[10%]"
            style={{
                clipPath: "polygon(48% 8%, 85% 22%, 72% 54%, 60% 46%)",
                background:
                "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))",
            }}
            />
            <div
            className="pointer-events-none absolute inset-[10%]"
            style={{
                clipPath: "polygon(22% 56%, 60% 46%, 72% 54%, 40% 86%)",
                background:
                "linear-gradient(160deg, rgba(0,0,0,0.10), rgba(255,255,255,0.025))",
            }}
            />

            {/* warm reflection from fire */}
            <div
            className="
                pointer-events-none
                absolute
                -bottom-[6%]
                left-[10%]
                h-[36%]
                w-[78%]
                blur-xl
            "
            style={{
                background:
                "radial-gradient(ellipse at center, rgba(249,115,22,0.35) 0%, rgba(249,115,22,0.14) 45%, transparent 80%)",
            }}
            />

            {/* strong top highlight */}
            <div
            className="
                pointer-events-none
                absolute
                left-[15%]
                top-[10%]
                h-[16%]
                w-[42%]
                -rotate-[18deg]
                rounded-[999px]
                blur-[2px]
            "
            style={{
                background:
                "linear-gradient(to right, rgba(255,255,255,0.55), rgba(255,255,255,0.18), transparent)",
            }}
            />

            {/* tiny specular shine */}
            <div
            className="
                pointer-events-none
                absolute
                left-[26%]
                top-[18%]
                h-[7%]
                w-[10%]
                rounded-full
                bg-white/80
                blur-[1px]
            "
            />

            {/* FACET EDGE LINES */}
            <div className="pointer-events-none absolute inset-0">
            {/* outer edges */}
            <div className="absolute left-[21%] top-[6%] h-[1px] w-[48%] bg-white/45 rotate-[-4deg]" />
            <div className="absolute right-[8%] top-[24%] h-[42%] w-[1px] bg-white/35 rotate-[10deg]" />
            <div className="absolute left-[23%] bottom-[8%] h-[1px] w-[40%] bg-white/35 rotate-[4deg]" />
            <div className="absolute left-[8%] top-[22%] h-[40%] w-[1px] bg-white/35 rotate-[-10deg]" />

            {/* internal facet lines */}
            <div className="absolute left-[30%] top-[16%] h-[1px] w-[33%] bg-white/25 rotate-[24deg]" />
            <div className="absolute left-[44%] top-[18%] h-[36%] w-[1px] bg-white/22 rotate-[-20deg]" />
            <div className="absolute left-[25%] top-[48%] h-[1px] w-[45%] bg-white/22 rotate-[-10deg]" />
            <div className="absolute left-[50%] top-[38%] h-[28%] w-[1px] bg-white/22 rotate-[16deg]" />
            <div className="absolute left-[18%] top-[34%] h-[30%] w-[1px] bg-white/18 rotate-[20deg]" />
            </div>

            {/* icon */}
            <Icon
            className="
                absolute
                left-1/2
                top-1/2
                z-10
                h-[38%]
                w-[38%]
                -translate-x-1/2
                -translate-y-1/2
                text-white/92
                drop-shadow-[0_4px_5px_rgba(0,0,0,0.45)]
                transition-transform
                duration-300
                group-hover:scale-110
            "
            />
        </div>

        {/* hover label */}
        <div
            className="
            pointer-events-none
            absolute
            left-1/2
            top-[calc(100%+12px)]
            -translate-x-1/2
            translate-y-1
            whitespace-nowrap
            rounded-full
            border
            border-white/10
            bg-black/70
            px-3
            py-1.5
            text-[10px]
            uppercase
            tracking-[0.12em]
            text-white/85
            opacity-0
            backdrop-blur-md
            transition-all
            duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
            "
        >
            {item.label}
        </div>
        </motion.div>
      </a>
    </motion.div>
  );
}

export default function FloatingFireLinks() {
  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-50
        overflow-hidden
      "
    >
      {/* decorative sparks */}
      <motion.div
        animate={{
          y: [0, -180, -360],
          x: [0, 12, -8],
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="
          absolute
          bottom-[8%]
          left-[28%]
          h-2
          w-2
          rounded-full
          bg-orange-200
          shadow-[0_0_12px_rgba(255,180,100,0.8)]
          blur-[0.5px]
        "
      />

      <motion.div
        animate={{
          y: [0, -140, -300],
          x: [0, -10, 6],
          opacity: [0, 0.9, 0],
          scale: [0.6, 1, 0.4],
        }}
        transition={{
          duration: 5.5,
          delay: 1.2,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="
          absolute
          bottom-[10%]
          left-[58%]
          h-1.5
          w-1.5
          rounded-full
          bg-orange-300
          shadow-[0_0_10px_rgba(255,150,70,0.8)]
        "
      />

      <motion.div
        animate={{
          y: [0, -170, -340],
          x: [0, 8, -5],
          opacity: [0, 0.8, 0],
          scale: [0.5, 1.2, 0.3],
        }}
        transition={{
          duration: 7,
          delay: 2.1,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="
          absolute
          bottom-[9%]
          left-[76%]
          h-2.5
          w-2.5
          rounded-full
          bg-yellow-200
          shadow-[0_0_14px_rgba(255,210,120,0.8)]
          blur-[0.5px]
        "
      />

      <motion.div
        animate={{
          y: [0, -120, -260],
          x: [0, 6, -10],
          opacity: [0, 0.7, 0],
          scale: [0.4, 1, 0.3],
        }}
        transition={{
          duration: 4.8,
          delay: 3.2,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="
          absolute
          bottom-[6%]
          left-[46%]
          h-1
          w-1
          rounded-full
          bg-orange-100
          shadow-[0_0_8px_rgba(255,190,100,0.9)]
        "
      />

      {linkItems.map((item) => (
        <EmberLink
          key={item.label}
          item={item}
        />
      ))}
    </div>
  );
}