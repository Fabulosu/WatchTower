"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import axios from "axios";
import { BACKEND_URL } from "@/lib/data";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session) {
            router.replace('/');
        }
    }, [session, router]);

    const emailRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const username = usernameRef.current?.value;
        const email = emailRef.current?.value;
        const password = passRef.current?.value;
        const cpass = confirmPasswordRef.current?.value;

        setError(null);

        if (username && email && password && cpass) {
            if (password.length < 8) {
                setError("Password must be at least 8 characters long.");
                return;
            }
            if (password !== cpass) {
                setError("Passwords do not match.");
                return;
            }
            try {
                const response = await axios.post(`${BACKEND_URL}/auth/register`, { name: username, email, password });
                if (response.data.name) {
                    router.replace("/login");
                }
            } catch (error) {
                console.error('Error creating account:', error);
                setError("An error occurred while creating the account. Please try again.");
            }
        } else {
            setError("All fields are required.");
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <Navbar />

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-background to-background/50 -z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-green-500/30 to-blue-500/30 blur-[120px] -z-10" />

            <main className="relative container mx-auto px-5 min-h-screen flex items-center justify-center py-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md relative"
                >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-xl -z-10" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl -z-10" />

                    <motion.form
                        variants={itemVariants}
                        className="relative backdrop-blur-sm bg-card/50 border border-card-foreground/10 rounded-2xl p-8 shadow-xl"
                        onSubmit={onSubmit}
                    >
                        <motion.div variants={itemVariants} className="text-center mb-8">
                            <h1 className="text-4xl font-bold mb-2">Create Account</h1>
                            <p className="text-muted-foreground">Join our monitoring platform</p>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-500 text-sm mt-2 p-2 rounded-lg bg-red-500/10"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input
                                    type="text"
                                    name="username"
                                    placeholder="Fabulosu"
                                    className="bg-card/50 backdrop-blur-sm border border-card-foreground/10 focus:border-green-400/30 focus:ring-green-400/20 transition-all duration-300"
                                    ref={usernameRef}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="admin@fabulosu.xyz"
                                    className="bg-card/50 backdrop-blur-sm border border-card-foreground/10 focus:border-green-400/30 focus:ring-green-400/20 transition-all duration-300"
                                    ref={emailRef}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="***********"
                                    className="bg-card/50 backdrop-blur-sm border border-card-foreground/10 focus:border-green-400/30 focus:ring-green-400/20 transition-all duration-300"
                                    minLength={8}
                                    ref={passRef}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Confirm Password</label>
                                <Input
                                    type="password"
                                    name="confirmpassword"
                                    placeholder="***********"
                                    className="bg-card/50 backdrop-blur-sm border border-card-foreground/10 focus:border-green-400/30 focus:ring-green-400/20 transition-all duration-300"
                                    ref={confirmPasswordRef}
                                    required
                                />
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="pt-4"
                            >
                                <Button
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300"
                                    type="submit"
                                >
                                    Create account
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.form>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}