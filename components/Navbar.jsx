"use client"

import { motion } from "framer-motion";

const Navbar = ({compact}) => {

    return (
        <motion.nav
            animate={{
            maxWidth: compact ? 580 : 2000,
            }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 22,
            }}
            
            className={`fixed top-0 right-0 z-50 w-full flex items-end justify-between overflow-hidden p-5 text-sm text-white 3xl:text-lg `}
        >
            <motion.button layout className="px-4">
                //BOUT ME
            </motion.button>
            <motion.button layout className="px-4">
                EXPERIENCE
            </motion.button>
            <motion.button layout className="px-4">
                SKILLS
            </motion.button>
            <motion.button layout className="px-4">
                PROJECTS
            </motion.button>
        </motion.nav>
    )
}

export default Navbar