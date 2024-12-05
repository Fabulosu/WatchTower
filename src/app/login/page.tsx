"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import Footer from "@/components/footer";

type Props = {
    searchParams?: Record<"callbackUrl" | "error", string>;
}

export default function LoginPage(props: Props) {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.replace('/');
        }
    }, [session, router]);

    const usernameRef = useRef<HTMLInputElement>(null);
    const passRef = useRef<HTMLInputElement>(null);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await signIn("credentials", {
            email: usernameRef.current?.value,
            password: passRef.current?.value,
            redirect: true,
            callbackUrl: "http://localhost:3000/"
        });
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
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

    return (
        <div className="relative overflow-hidden">
            <Navbar />

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-background to-background/50 -z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-green-500/30 to-blue-500/30 blur-[120px] -z-10" />

            <main className="relative container mx-auto px-5 min-h-screen flex items-center justify-center">
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
                            <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
                            <p className="text-muted-foreground">Sign in to your monitoring dashboard</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email or Username</label>
                                <Input
                                    type="text"
                                    name="username"
                                    placeholder="admin@fabulosu.xyz"
                                    className="bg-card/50 backdrop-blur-sm border border-card-foreground/10 focus:border-green-400/30 focus:ring-green-400/20 transition-all duration-300"
                                    ref={usernameRef}
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
                                    ref={passRef}
                                    required
                                />
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300"
                                    type="submit"
                                >
                                    Sign in
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