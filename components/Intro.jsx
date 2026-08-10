import Image from "next/image";
import Neel from "@/public/neel2.png"

import { Courier_Prime } from "next/font/google";
const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const Intro = () => {
    return (
        <div className="flex flex-col gap-5 p-5 2xl:px-60 lg:px-40">
            <h2 className={`text-sm text-neutral-400 font-medium ${courierPrime.className}`}>INTRO</h2>
            <p className="text-white text-3xl max-w-7xl lg:text-4xl font-bold">I'm a software engineer passionate about building scalable, high-performance web applications with React, TypeScript, and Node.js.</p>
            <p className="text-white text-xl md:text-2xl max-w-7xl lg:text-3xl font-bold">Currently working as Software Development Engineer L2 <br />@ Hummingbird web solution, building building production-grade SaaS products with a focus on performance, scalability, and user experience.</p>
            <div className="flex items-center gap-4">
                <Image height={60} width={60} src={Neel} alt="Profile image"/>
                <p className={`text-sm text-neutral-400 font-medium ${courierPrime.className}`}>NEELAKSH SINGH</p>
            </div>
        </div>
    )
}

export default Intro