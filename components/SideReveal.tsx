"use client";

import { motion, useReducedMotion } from "framer-motion";

/** How far off to the side the element starts, and its starting tilt. */
const OFFSET_X = 120;
const TILT = 6;

/**
 * Slides its content in from the left or right with a slight tilt the first
 * time it scrolls into view. The parent should clip horizontal overflow so
 * the offset start position never widens the page.
 */
export default function SideReveal({
    from,
    id,
    className,
    children,
}: {
    from: "left" | "right";
    id?: string;
    className?: string;
    children: React.ReactNode;
}) {
    const reduceMotion = useReducedMotion();
    const direction = from === "left" ? -1 : 1;

    return (
        <motion.article
            id={id}
            className={className}
            initial={
                reduceMotion
                    ? false
                    : {
                          opacity: 0,
                          x: direction * OFFSET_X,
                          // Top edge leans away from the side it enters from.
                          rotate: direction * TILT,
                      }
            }
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
                x: { type: "spring", stiffness: 90, damping: 18 },
                rotate: { type: "spring", stiffness: 90, damping: 14 },
                opacity: { duration: 0.5, ease: "easeOut" },
            }}
        >
            {children}
        </motion.article>
    );
}
