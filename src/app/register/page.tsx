"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from "@/components/navbar";
import axios from "axios";
import { BACKEND_URL } from "@/lib/data";

type Props = {
    searchParams?: Record<"callbackUrl" | "error", string>;
}

export default function RegisterPage(props: Props) {

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

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const username = usernameRef.current?.value;
        const email = emailRef.current?.value;
        const password = passRef.current?.value;
        const cpass = confirmPasswordRef.current?.value;

        // Reset error on each submission
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
        <>
            <Navbar />
            <main className="w-full h-[90vh] flex justify-center items-center">
                <form className="flex flex-col items-center gap-2 bg-card-foreground w-96 h-[28rem] rounded-lg p-5 drop-shadow-lg" onSubmit={onSubmit}>
                    <div className="text-center">
                        <h1 className="text-secondary text-xl font-semibold">Create account</h1>
                        {error && <p className="text-red-500 text-sm -mb-4">{error}</p>}
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        <label className="block text-muted-foreground">Username</label>
                        <Input
                            type="text"
                            name="username"
                            placeholder="Fabulosu"
                            className="focus-visible:ring-0"
                            ref={usernameRef}
                            required
                        />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        <label className="block text-muted-foreground">Email</label>
                        <Input
                            type="email"
                            name="email"
                            placeholder="admin@fabulosu.xyz"
                            className="focus-visible:ring-0"
                            ref={emailRef}
                            required
                        />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        <label className="block text-muted-foreground">Password</label>
                        <Input
                            type="password"
                            name="password"
                            placeholder="***********"
                            className="focus-visible:ring-0"
                            minLength={8}
                            ref={passRef}
                            required
                        />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        <label className="block text-muted-foreground">Confirm Password</label>
                        <Input
                            type="password"
                            name="confirmpassword"
                            placeholder="***********"
                            className="focus-visible:ring-0"
                            ref={confirmPasswordRef}
                            required
                        />
                    </div>
                    <Button className="w-full bg-chart-1 mt-4">Create account</Button>
                </form>
            </main>
        </>
    );
}