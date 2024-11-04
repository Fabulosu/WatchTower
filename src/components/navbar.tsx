"use client";
import { cn } from '@/lib/utils';
import { LuRadioTower } from "react-icons/lu";
import Link from 'next/link';
import React, { useState } from 'react';
import { buttonVariants } from './ui/button';
import { FiMenu, FiX } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

const Navbar = () => {
    const { data: session } = useSession();

    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <nav className='flex items-center justify-between px-6 py-4 bg-card-foreground h-20 text-secondary relative'>
            <div className='flex items-center gap-3 w-[300px]'>
                <Link href="/" className='flex gap-3 items-center'>
                    <LuRadioTower size={30} />
                    <p className='text-xl font-bold'>WatchTower</p>
                </Link>
            </div>

            <div className='hidden lg:flex gap-6'>
                {["Products", "Solutions", "Community", "Resources", "Pricing", "Contact"].map((item) => (
                    <Link key={item} href="#" className={cn(buttonVariants({ variant: "ghost" }), "rounded-full")}>
                        {item}
                    </Link>
                ))}
            </div>

            <div className='hidden lg:flex gap-3 lg:mr-6 w-[300px] justify-end'>
                {session ? (
                    <Link
                        className={cn(buttonVariants({ variant: "secondary" }), "rounded-full w-30")}
                        href="/manage"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <>
                        <Link
                            className={cn(buttonVariants({ variant: "outline" }), "bg-transparent hover:bg-secondary hover:text-foreground rounded-full w-60")}
                            href="/login"
                        >
                            Sign In
                        </Link>
                        <Link
                            className={cn(buttonVariants({ variant: "secondary" }), "rounded-full w-60")}
                            href="/register"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>

            <button className='lg:hidden text-white' onClick={toggleMenu}>
                {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            <div
                className={`absolute top-full left-0 right-0 bg-card-foreground lg:hidden flex flex-col items-center gap-4 py-4 z-10 shadow-lg transition-transform duration-500 ${menuOpen ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0'
                    }`}
            >
                {menuOpen && ["Products", "Solutions", "Community", "Resources", "Pricing", "Contact"].map((item) => (
                    <Link key={item} href="#" className={cn(buttonVariants({ variant: "ghost" }))}>
                        {item}
                    </Link>
                ))}
                {menuOpen && (
                    <div className='flex gap-3'>
                        {session ? (
                            <Link
                                className={cn(buttonVariants({ variant: "secondary" }))}
                                href="/dashboard"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    className={cn(buttonVariants({ variant: "outline" }), "bg-transparent")}
                                    href="/login"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    className={cn(buttonVariants({ variant: "secondary" }))}
                                    href="/register"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;