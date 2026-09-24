import Footer from "@/components/Footer";
import { Courier_Prime, Space_Grotesk } from "next/font/google";
import { FaLock, FaCodepen, FaMedal, FaPeopleCarry, FaChalkboard } from "react-icons/fa";
import me from "@/public/gallery/me.png"
import Image from "next/image";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const skills = [
  {
    key: "Q",
    title: "Problem Solving",
    description:
      "I enjoy breaking complex problems into smaller pieces and building practical solutions that are simple, reliable, and scalable.",
  },
  {
    key: "W",
    title: "Coding",
    description:
      "I work across frontend and backend systems, with a strong focus on React, Next.js, Node.js, APIs, and performant user experiences.",
  },
  {
    key: "E",
    title: "Teamwork",
    description:
      "I enjoy collaborating with engineers, designers, and product teams to turn ideas into production-ready experiences.",
  },
  {
    key: "R",
    title: "Learning",
    description:
      "I like exploring new technologies, experimenting with ideas, and continuously improving the way I build software.",
  },
];

const education = [
  {
    title: "Bachelor of Engineering",
    institution: "Computer Engineering",
    description:
      "Built a strong foundation in software engineering, algorithms, databases, distributed systems, and web development.",
  },
  {
    title: "Software Engineering",
    institution: "Professional Experience",
    description:
      "Working on production SaaS systems, frontend architecture, backend services, performance optimization, and scalable product workflows.",
  },
  {
    title: "Continuous Learning",
    institution: "Engineering & Creative Tech",
    description:
      "Currently exploring system design, AWS, Three.js, interactive experiences, and modern full-stack engineering.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-black text-white">
      <section className="mx-auto w-full max-w-[1920px] px-5 pb-20 pt-36 md:px-8 lg:px-10 lg:pt-52">
        {/* INTRODUCTION */}
        <div className="flex justify-center gap-10  lg:gap-16">
          <p
            className={`${courierPrime.className} pt-1 text-[11px] uppercase text-neutral-500`}
          >
            [INTRODUCTION]
          </p>

          <p
            className={`${spaceGrotesk.className} max-w-[760px] text-sm font-semibold leading-[1.1] tracking-[-0.03em] text-neutral-100 md:text-[30px] lg:text-[34px]`}
          >
            Hey! I&apos;m Neelaksh. I&apos;m a software engineer who enjoys
            building polished, performant digital experiences. I&apos;m
            especially interested in frontend engineering, interactive web
            experiences, and finding creative ways to turn complex ideas into
            products people actually enjoy using.
          </p>
        </div>

        {/* HUGE HEADING */}
        <h1
          className={`${spaceGrotesk.className} mt-16 whitespace-nowrap text-[clamp(70px,20vw,118rem)] font-bold leading-[0.8] text-center tracking-[-0.085em] text-[#f1f1ef]`}
        >
          //BOUT ME
        </h1>

        {/* PROFILE AREA */}
        <div className="relative mt-20 min-h-[720px] border-b  border-neutral-800 pb-0">
          {/* INFO CARD */}
          <div className="w-fit border border-neutral-700">
            <div className="flex">
              <div
                className={`${courierPrime.className} flex w-8 items-center justify-center bg-neutral-100 text-sm md:text-xl font-bold text-black [writing-mode:vertical-rl] rotate-180`}
              >
                INFO
              </div>

              <div className="px-3 py-1">
                <div
                  className={`${spaceGrotesk.className} flex items-center gap-3 text-3xl font-bold leading-none md:text-[34px]`}
                >
                  NEELAKSH SINGH
                  <span className="text-2xl md:text-3xl text-neutral-400">//</span>
                </div>

                <div
                  className={`${courierPrime.className} mt-3 flex flex-wrap gap-x-1 md:gap-x-4 gap-y-1 text-xs md:text-lg uppercase text-neutral-500`}
                >
                  <span>ROLE: SOFTWARE ENGINEER</span>
                  <span>/</span>
                  <span>LEVEL: SDE-2</span>
                  <span>/</span>
                  <span>LOCATION: INDIA</span>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER CONTENT */}
          <div className="mt-20 lg:mt-40 grid grid-cols-1 items-end gap-12 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.3fr_0.7fr]">
            {/* BIO + SKILLS */}
            <div className="max-w-[940px]">
              {/* BIO */}
              <div>
                <h2
                  className={`${spaceGrotesk.className} border-b border-neutral-800 pb-2 text-xl md:text-3xl font-bold uppercase`}
                >
                  BIO
                </h2>

                <div
                  className={`${courierPrime.className} mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm lg:text-lg uppercase text-neutral-400`}
                >
                  <span>
                    LOCATION:{" "}
                    <strong className="text-neutral-200">INDIA</strong>
                  </span>

                  <span>
                    EXPERIENCE:{" "}
                    <strong className="text-neutral-200">2+ YEARS</strong>
                  </span>

                  <span>
                    FOCUS:{" "}
                    <strong className="text-neutral-200">
                      FULL STACK / FRONTEND
                    </strong>
                  </span>
                </div>
              </div>

              {/* SKILLS */}
              <div className="mt-8 pb-8">
                <h2
                  className={`${spaceGrotesk.className} border-b border-neutral-800 pb-2 text-xl md:text-3xl font-bold uppercase`}
                >
                  SKILL
                </h2>

                <div className="mt-5">
                  {skills.map((skill) => (
                    <div
                      key={skill.key}
                      className="grid grid-cols-[52px_1fr] group border-b border-neutral-900 py-3 gap-3"
                    >
                      <div className="flex items-start justify-center">
                        <div
                          className={`${courierPrime.className} flex h-12 w-12 items-center relative justify-center border border-neutral-700 text-xs md:text-lg text-neutral-300`}
                        >
                            <span className="absolute group-hover:left-[-6px] group-hover:top-[-6px] group-hover:h-4 group-hover:w-4 left-[-1px] top-[-1px] h-2 w-2 border-l border-t border-neutral-300 transition-all" />
                            <span className="absolute group-hover:right-[-6px] group-hover:top-[-6px] group-hover:h-4 group-hover:w-4 right-[-1px] top-[-1px] h-2 w-2 border-r border-t border-neutral-300 transition-all" />
                            <span className="absolute group-hover:left-[-6px] group-hover:bottom-[-6px] group-hover:h-4 group-hover:w-4 bottom-[-1px] left-[-1px] h-2 w-2 border-b border-l border-neutral-300 transition-all" />
                            <span className="absolute group-hover:right-[-6px] group-hover:bottom-[-6px] group-hover:h-4 group-hover:w-4 bottom-[-1px] right-[-1px] h-2 w-2 border-b border-r border-neutral-300 transition-all" />

                            {skill.key === 'Q' ? 
                                <FaMedal className="w-8 h-8"/> 
                            : skill.key === 'W' ? 
                                <FaCodepen className="w-8 h-8"/> 
                            : skill.key === 'E' ? 
                                <FaPeopleCarry className="w-8 h-8"/> 
                            : <FaChalkboard className="w-8 h-8"/>}
                        </div>
                      </div>

                      <div>
                        <h3
                          className={`${spaceGrotesk.className} text-sm  md:text-2xl font-bold text-neutral-100`}
                        >
                          {skill.key}: {skill.title}
                        </h3>

                        <p
                          className={`${courierPrime.className} mt-1 max-w-[760px] text-xs md:text-sm leading-[1.45] text-neutral-500`}
                        >
                          {skill.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className={`${courierPrime.className} mt-4 flex h-12 items-center relative group justify-center border border-neutral-800 text-lg text-neutral-400`}
                >
                    <span className="absolute group-hover:left-[-6px] group-hover:top-[-6px] group-hover:h-4 group-hover:w-4 left-[-1px] top-[-1px] h-2 w-2 border-l border-t border-neutral-300 transition-all" />
                    <span className="absolute group-hover:right-[-6px] group-hover:top-[-6px] group-hover:h-4 group-hover:w-4 right-[-1px] top-[-1px] h-2 w-2 border-r border-t border-neutral-300 transition-all" />
                    <span className="absolute group-hover:left-[-6px] group-hover:bottom-[-6px] group-hover:h-4 group-hover:w-4 bottom-[-1px] left-[-1px] h-2 w-2 border-b border-l border-neutral-300 transition-all" />
                    <span className="absolute group-hover:right-[-6px] group-hover:bottom-[-6px] group-hover:h-4 group-hover:w-4 bottom-[-1px] right-[-1px] h-2 w-2 border-b border-r border-neutral-300 transition-all" />

                    <span className="z-10 w-full h-full flex justify-center items-center">Here To Unlock Other Skills</span>
                    <FaLock 
                    className="
                        absolute
                        left-1/2
                        -translate-x-1/2
                        text-neutral-700
                        w-6
                        h-6" 
                    />
                </div>
              </div>
            </div>

            {/* IMAGE PLACEHOLDER */}
            <div className="relative flex min-h-[520px] items-end justify-center">
              <div className="relative h-[720px] w-full ">
                <Image
                    src={me}
                    alt="Neelaksh Singh"
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 360px"
                    className="object-contain object-bottom"
                />
            </div>
            </div>
          </div>
        </div>

        {/* EDUCATION */}
        <section className="border-b border-neutral-800 py-20">
          <p
            className={`${courierPrime.className} mb-16 text-center text-xs md:text-sm uppercase text-neutral-600`}
          >
            [EDUCATION]
          </p>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-0">
            {education.map((item, index) => (
              <div
                key={item.title}
                className={`
                  relative
                  md:px-8
                  ${index === 0 ? "md:pl-0" : ""}
                  ${index === education.length - 1 ? "md:pr-0" : ""}
                `}
              >
                <h3
                  className={`${spaceGrotesk.className} max-w-[420px] text-2xl md:text-3xl font-semibold leading-[1.02] tracking-[-0.03em] `}
                >
                  {item.title}
                  <br />
                  <span className="text-neutral-300">
                    {item.institution}
                  </span>
                </h3>

                <p
                  className={`${courierPrime.className} mt-5 max-w-[400px] text-xs md:text-sm leading-[1.5] text-neutral-500`}
                >
                  {item.description}
                </p>

                {index !== education.length - 1 && (
                  <span
                    className={`${courierPrime.className} absolute -right-2 top-8 hidden text-4xl font-light text-neutral-600 md:block`}
                  >
                    +
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}