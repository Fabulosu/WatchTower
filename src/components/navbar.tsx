"use client";
import { cn } from '@/lib/utils';
import { LuRadioTower } from "react-icons/lu";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { buttonVariants } from './ui/button';
import { FiMenu, FiX } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const navItems = ["Products", "Solutions", "Community", "Resources", "Pricing", "Contact"];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={cn(
                'fixed w-full z-50 transition-all duration-300',
                scrolled
                    ? 'bg-card-foreground/90 backdrop-blur-lg shadow-lg'
                    : 'bg-card-foreground'
            )}
        >
            <div className='max-w-7xl mx-auto flex items-center justify-between px-6 py-4 h-20 text-secondary'>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className='flex items-center gap-3'
                >
                    <Link href="/" className='flex gap-3 items-center'>
                        <LuRadioTower size={30} className="text-white" />
                        <p className='text-xl font-bold text-white'>
                            WatchTower
                        </p>
                    </Link>
                </motion.div>

                <div className='hidden lg:flex gap-6'>
                    {navItems.map((item) => (
                        <motion.div
                            key={item}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href="#"
                                className={cn(
                                    buttonVariants({ variant: "ghost" }),
                                    "rounded-full hover:bg-transparent relative group"
                                )}
                            >
                                {item}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className='hidden lg:flex gap-3 items-center'>
                    {session ? (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                className={cn(buttonVariants({ variant: "secondary" }), "rounded-full")}
                                href="/pages"
                            >
                                Dashboard
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    className={cn(
                                        buttonVariants({ variant: "outline" }),
                                        "rounded-full hover:bg-primary/10 text-black"
                                    )}
                                    href="/login"
                                >
                                    Sign In
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    className={cn(
                                        buttonVariants({ variant: "secondary" }),
                                        "rounded-full bg-primary hover:bg-primary/90 text-white"
                                    )}
                                    href="/register"
                                >
                                    Register
                                </Link>
                            </motion.div>
                        </>
                    )}
                </div>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    className='lg:hidden text-white p-2 rounded-full hover:bg-primary/10'
                    onClick={toggleMenu}
                >
                    {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </motion.button>
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden bg-card-foreground/95 backdrop-blur-lg"
                    >
                        <div className='flex flex-col items-center gap-4 py-6'>
                            {navItems.map((item) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Link
                                        href="#"
                                        className={cn(
                                            buttonVariants({ variant: "ghost" }),
                                            "rounded-full w-48 justify-center bg-secondary"
                                        )}
                                    >
                                        {item}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className='flex flex-col gap-3 w-48'
                            >
                                {session ? (
                                    <Link
                                        className={cn(buttonVariants({ variant: "secondary" }), "rounded-full")}
                                        href="/pages"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            className={cn(
                                                buttonVariants({ variant: "outline" }),
                                                "rounded-full justify-center"
                                            )}
                                            href="/login"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            className={cn(
                                                buttonVariants({ variant: "secondary" }),
                                                "rounded-full justify-center"
                                            )}
                                            href="/register"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

export default Navbar;