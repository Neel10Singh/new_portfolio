"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getLenis } from "@/components/SmoothScrollProvider";

const Navbar = () => {
    const [compact, setCompact] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const pathname = usePathname();
    const isRootPage = pathname === "/";

    useEffect(() => {
        let rafId = 0;

        const handleScroll = () => {
        cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            const nextCompact =
            window.scrollY >
            window.innerHeight * 0.2;

            setCompact((prev) =>
            prev === nextCompact
                ? prev
                : nextCompact
            );
        });
        };

        window.addEventListener(
        "scroll",
        handleScroll,
        {
            passive: true,
        }
        );

        handleScroll();

        return () => {
        window.removeEventListener(
            "scroll",
            handleScroll
        );

        cancelAnimationFrame(rafId);
        };
    }, []);

    // Lenis ignores scrollTo while stopped, so restart it right away rather
    // than waiting for the effect below - a section link scrolls immediately.
    const closeMenu = () => {
        setMenuOpen(false);
        getLenis()?.start();
    };

    // While the menu is open: freeze the page, close on Escape, and close if
    // the viewport grows past the mobile breakpoint.
    useEffect(() => {
        if (!menuOpen) return;

        getLenis()?.stop();

        const html = document.documentElement;
        const previousOverflow = html.style.overflow;
        html.style.overflow = "hidden";

        const handleKeyDown = (event) => {
        if (event.key === "Escape") setMenuOpen(false);
        };

        const desktop = window.matchMedia("(min-width: 768px)");

        const handleBreakpoint = (event) => {
        if (event.matches) setMenuOpen(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        desktop.addEventListener("change", handleBreakpoint);

        return () => {
        window.removeEventListener("keydown", handleKeyDown);
        desktop.removeEventListener("change", handleBreakpoint);

        html.style.overflow = previousOverflow;
        getLenis()?.start();
        };
    }, [menuOpen]);

    const handleSectionClick = (
        event,
        sectionId
    ) => {
        event.preventDefault();

        if (isRootPage) {
        const element =
            document.getElementById(sectionId);

        if (!element) return;

        getLenis()?.scrollTo(element, {
            duration: 1.3,
            offset: -70,
        });

        return;
        }

        sessionStorage.setItem(
        "portfolio-scroll-target",
        sectionId
        );

        window.location.assign("/");
    };

    const handleHomeClick = (event) => {
        event.preventDefault();

        sessionStorage.removeItem(
        "portfolio-scroll-target"
        );

        if (isRootPage) {
        getLenis()?.scrollTo(0, {
            duration: 1.3,
        });

        return;
        }

        window.location.assign("/");
    };

    const clearScrollTarget = () => {
        sessionStorage.removeItem(
        "portfolio-scroll-target"
        );
    };

    const links = [
        {
        label: "//BOUT ME",
        href: "/about",
        onClick: clearScrollTarget,
        },
        {
        label: "EXPERIENCE",
        href: isRootPage ? "#experience" : "/",
        onClick: (event) =>
            handleSectionClick(event, "experience"),
        },
        {
        label: "SKILLS",
        href: isRootPage ? "#skills" : "/",
        onClick: (event) =>
            handleSectionClick(event, "skills"),
        },
        {
        label: "PROJECTS",
        href: "/projects",
        onClick: clearScrollTarget,
        },
    ];

    return (
    <>
    <motion.nav
        animate={{
            maxWidth: compact ? 580 : 2000,
        }}
        transition={{
            type: "spring",
            stiffness: 200,
            damping: 22,
        }}
        className="
            fixed
            right-0
            top-0
            z-50
            flex
            w-full
            items-end
            justify-between
            overflow-hidden
            p-5
            text-sm
            text-white
            mix-blend-difference
            3xl:text-lg
        "
        style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
        {!isRootPage && (
            <motion.a
            href="/"
            onClick={(event) => {
                closeMenu();
                handleHomeClick(event);
            }}
            layout
            className="px-4"
            >
            NEEL//KSH
            </motion.a>
        )}

        {links.map((link) => (
            <motion.a
            key={link.label}
            href={link.href}
            onClick={link.onClick}
            layout
            className="hidden px-4 md:block"
            >
            {link.label}
            </motion.a>
        ))}

        <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="relative ml-auto h-6 w-8 md:hidden"
        >
            {/* Two bars that swing into a cross. */}
            <motion.span
            className="absolute left-0 top-1/2 h-0.5 w-full bg-white"
            initial={false}
            animate={
                menuOpen
                ? { y: 0, rotate: 45 }
                : { y: -5, rotate: 0 }
            }
            transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.span
            className="absolute left-0 top-1/2 h-0.5 w-full bg-white"
            initial={false}
            animate={
                menuOpen
                ? { y: 0, rotate: -45 }
                : { y: 5, rotate: 0 }
            }
            transition={{ duration: 0.3, ease: "easeInOut" }}
            />
        </button>
    </motion.nav>

    <AnimatePresence>
        {menuOpen && (
            // Sits just under the nav (z-50) so the cross stays on top.
            <motion.div
            id="mobile-menu"
            key="mobile-menu"
            className="fixed inset-0 z-45 flex items-center justify-center bg-black md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            >
            <nav
                className="flex flex-col items-center gap-2"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
                {links.map((link, index) => (
                <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={(event) => {
                    closeMenu();
                    link.onClick(event);
                    }}
                    className="text-3xl font-bold text-white"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{
                    duration: 0.35,
                    delay: 0.05 + index * 0.06,
                    }}
                >
                    {link.label}
                </motion.a>
                ))}
            </nav>
            </motion.div>
        )}
    </AnimatePresence>
    </>
    );
};

export default Navbar;