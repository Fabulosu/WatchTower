"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from "@/components/navbar";

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

    return (
        <>
            <Navbar />
            <main className="w-full h-[90vh] flex justify-center items-center">
                <form className="flex flex-col items-center gap-6 bg-card-foreground w-96 h-96 rounded-lg p-5 drop-shadow-lg" onSubmit={onSubmit}>
                    <h1 className="text-secondary text-xl font-semibold">Sign in</h1>
                    <div className="w-full flex flex-col gap-2">
                        <label className="block text-muted-foreground">Email or Username</label>
                        <Input
                            type="text"
                            name="username"
                            placeholder="admin@fabulosu.xyz"
                            className="focus-visible:ring-0"
                            ref={usernameRef}
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
                            ref={passRef}
                            required
                        />
                    </div>
                    <Button className="w-full bg-chart-1 mt-14">Sign in</Button>
                </form>
            </main>
        </>
    );
}