import { Space_Grotesk, Courier_Prime } from "next/font/google";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Footer() {
  return (
    <footer
      className="
        relative
        flex
        min-h-[700px]
        w-full
        flex-col
        items-center
        bg-black
        px-6
        pb-8
        pt-16
        text-white
        md:px-12
      "
    >
      {/* END LABEL */}
      <p
        className={`
          ${courierPrime.className}
          mb-9
          text-sm
          text-neutral-500
        `}
      >
        [END]
      </p>

      {/* MAIN TEXT */}
      <h2
        className={`
          ${spaceGrotesk.className}
          text-center
          text-[clamp(30px,3.1vw,48px)]
          font-semibold
          leading-[1.02]
          tracking-[-0.03em]
          text-neutral-100
        `}
      >
        I am always open to new projects, professional connections,
        <br className="hidden lg:block" /> and design feedback. If you have an
        opportunity in mind or
        <br className="hidden lg:block" /> just want to talk about design, I
        would love to hear from you.
      </h2>

      {/* CTA */}
      <a
        href="#contact"
        className={`
          ${courierPrime.className}
          mt-16
          rounded-full
          border
          border-neutral-300
          px-7
          py-3.5
          text-sm
          font-bold
          transition-colors
          duration-200
          relative
          after:absolute
          after:content-['']
          after:-bottom-13
          after:w-full
          after:left-0
          after:pointer-events-none
          overflow-hidden
          after:z-0
          after:h-12
          after:bg-white
          after:transition-all
          hover:after:bottom-0
          hover:text-black
        `}
      >
        <span className="relative z-10">LET&apos;S CHAT</span>
      </a>

      {/* SOCIAL AREA */}
      <div className="mt-24 flex flex-col items-center">
        <p
          className={`
            ${courierPrime.className}
            mb-8
            text-sm
            uppercase
            text-neutral-600
          `}
        >
          MORE ABOUT ME?
        </p>

        <div className="flex items-center gap-12 sm:gap-16 md:gap-20">
          {/* LEETCODE */}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            aria-label="LeetCode"
            className="
                group
                relative
                block
                h-11
                w-11
                md:h-14
                md:w-14
            "
            >
            {/* Base icon */}
            <SiLeetcode
                className="
                absolute
                inset-0
                h-full
                w-full
                text-neutral-800
                "
            />

            {/* White fill */}
            <SiLeetcode
                className="
                absolute
                inset-0
                h-full
                w-full
                text-white

                [clip-path:inset(100%_0_0_0)]
                transition-[clip-path]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]

                group-hover:[clip-path:inset(0%_0_0_0)]
                "
            />
            </a>

          {/* LINKEDIN */}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="
                group
                relative
                block
                h-11
                w-11
                md:h-14
                md:w-14
            "
          >
            <FaLinkedin className="
                absolute
                inset-0
                h-full
                w-full
                text-neutral-800" />
            <FaLinkedin className="
                absolute
                inset-0
                h-full
                w-full
                text-white

                [clip-path:inset(100%_0_0_0)]
                transition-[clip-path]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]

                group-hover:[clip-path:inset(0%_0_0_0)]" />
          </a>

          {/* GITHUB */}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="
                group
                relative
                block
                h-11
                w-11
                md:h-14
                md:w-14
            "
          >
            <FaGithub className="
                absolute
                inset-0
                h-full
                w-full
                text-neutral-800
            " />
            <FaGithub className="
                absolute
                inset-0
                h-full
                w-full
                text-white

                [clip-path:inset(100%_0_0_0)]
                transition-[clip-path]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]

                group-hover:[clip-path:inset(0%_0_0_0)]
            " />
          </a>
        </div>
      </div>

      {/* BOTTOM */}
      <div
        className={`
          ${courierPrime.className}
          mt-auto
          flex
          w-full
          items-end
          justify-between
          pt-20
          text-xs
          uppercase
          tracking-wide
          text-neutral-600
          sm:text-sm
        `}
      >
        <p>2026 © Neelaksh Singh</p>

        <a
          href="#"
          className="
            transition-colors
            duration-200
            hover:text-white
          "
        >
          Back to Top ↑
        </a>
      </div>
    </footer>
  );
}