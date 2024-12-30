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
import { BACKEND_URL } from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.replace('/');
        }
    }, [session, router]);

    const emailRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: ''
    });

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

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const usernameValue = e.target.value;

        setFormErrors(prev => ({
            ...prev,
            username: usernameValue.length < 3 ? 'Username must be at least 3 characters long' :
                usernameValue.length > 20 ? 'Username must be less than 20 characters' : ''
        }));
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const emailValue = e.target.value;

        setFormErrors(prev => ({
            ...prev,
            email: !isValidEmail(emailValue) ? 'Please enter a valid email address' : ''
        }));
    };

    const checkPasswordStrengthRealTime = (password: string) => {
        let score = 0;
        let message = '';

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        if (password.length >= 12) score++;
        if (/^(?=.*[A-Z].*[A-Z])/.test(password)) score++;
        if (/^(?=.*[!@#$%^&*].*[!@#$%^&*])/.test(password)) score++;

        score = Math.min(5, Math.floor(score * 5 / 8));

        switch (score) {
            case 0:
                message = 'Very weak';
                break;
            case 1:
                message = 'Weak';
                break;
            case 2:
                message = 'Fair';
                break;
            case 3:
                message = 'Medium';
                break;
            case 4:
                message = 'Strong';
                break;
            case 5:
                message = 'Very strong';
                break;
        }

        setPasswordStrength({ score, message });
        setFormErrors(prev => ({
            ...prev,
            password: score < 3 ? 'Password strength is too weak' : ''
        }));

        return score;
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const confirmValue = e.target.value;
        const passwordValue = passRef.current?.value || '';

        setFormErrors(prev => ({
            ...prev,
            confirmPassword: confirmValue !== passwordValue ? 'Passwords do not match' : ''
        }));
    };

    const checkAvailability = async (type: number) => {
        let string;

        (type === 1) ? string = usernameRef.current?.value : string = emailRef.current?.value;

        if (string) {
            try {
                const response = await axios.get(`${BACKEND_URL}/user/exists/${string}`);
                if (response.data.exists) {
                    (type === 1) ?
                        setFormErrors(prev => ({
                            ...prev,
                            username: 'Username is already taken'
                        }))
                        :
                        setFormErrors(prev => ({
                            ...prev,
                            email: 'Email is already taken'
                        }))

                }
            } catch (error) {
                (type === 1) ? console.error('Error checking username availability:', error) : console.error('Error checking email availability:', error);
            }
        }
    };

    const validateForm = () => {
        const username = usernameRef.current?.value || '';
        const email = emailRef.current?.value || '';
        const password = passRef.current?.value || '';
        const confirmPassword = confirmPasswordRef.current?.value || '';

        const newErrors = {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        };

        let isValid = true;

        if (username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters long';
            isValid = false;
        } else if (username.length > 20) {
            newErrors.username = 'Username must be less than 20 characters';
            isValid = false;
        }

        if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        checkAvailability(1);
        checkAvailability(0);

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8;

        if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            newErrors.password = 'Password must contain:';
            const missing = [];

            if (!isLongEnough) missing.push('at least 8 characters');
            if (!hasUpperCase) missing.push('uppercase letter');
            if (!hasLowerCase) missing.push('lowercase letter');
            if (!hasNumbers) missing.push('number');
            if (!hasSpecialChar) missing.push('special character');

            newErrors.password += ' ' + missing.join(', ');
            isValid = false;
        }

        if (passwordStrength.score < 3) {
            newErrors.password = 'Password is too weak. Please make it stronger.';
            isValid = false;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setFormErrors(newErrors);
        return isValid;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const username = usernameRef.current?.value;
        const email = emailRef.current?.value;
        const password = passRef.current?.value;

        try {
            const response = await axios.post(`${BACKEND_URL}/auth/register`, {
                name: username,
                email,
                password
            });
            if (response.data.name) {
                toast.success("Account created successfully. Please login to continue.");
                router.replace("/login");
            }
        } catch (error: any) {
            console.error('Error creating account:', error);
            toast.error(error.response?.data?.message || "An error occurred while creating the account.");
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <Navbar />

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-background to-background/50 -z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-green-500/30 to-blue-500/30 blur-[120px] -z-10" />

            <main className="relative container mx-auto px-2 sm:px-5 min-h-screen flex items-center justify-center py-20">
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
                        className="relative backdrop-blur-sm bg-card/50 border border-card-foreground/10 rounded-2xl py-8 px-2 sm:px-8 shadow-xl"
                        onSubmit={onSubmit}
                    >
                        <motion.div variants={itemVariants} className="text-center mb-8">
                            <h1 className="text-4xl font-bold mb-2">Create Account</h1>
                            <p className="text-muted-foreground">Join our monitoring platform</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input
                                    type="text"
                                    name="username"
                                    placeholder="Fabulosu"
                                    className={`bg-card/50 backdrop-blur-sm border ${formErrors.username ? 'border-red-500' : 'border-card-foreground/10'
                                        } focus:border-green-400/30 focus:ring-green-400/20 transition-all duration-300`}
                                    ref={usernameRef}
                                    required
                                    minLength={3}
                                    maxLength={20}
                                    onChange={handleUsernameChange}
                                    onBlur={() => checkAvailability(1)}
                                />
                                {formErrors.username && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="admin@fabulosu.xyz"
                                    className={`bg-card/50 backdrop-blur-sm border ${formErrors.email ? 'border-red-500' : 'border-card-foreground/10'
                                        } focus:border-green-400/30 focus:ring-green-400/20 transition-all duration-300`}
                                    ref={emailRef}
                                    required
                                    onChange={handleEmailChange}
                                    onBlur={() => checkAvailability(0)}
                                />
                                {formErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="***********"
                                        className={`bg-card/50 backdrop-blur-sm border ${formErrors.password ? 'border-red-500' : 'border-card-foreground/10'
                                            } focus:border-green-400/30 focus:ring-green-400/20 transition-all duration-300`}
                                        ref={passRef}
                                        required
                                        onChange={(e) => checkPasswordStrengthRealTime(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <FaEye />
                                        ) : (
                                            <FaEyeSlash />
                                        )}
                                    </button>
                                </div>
                                {formErrors.password && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                )}
                                <div className="text-xs text-muted-foreground mt-1">
                                    Password must contain:
                                    <ul className="list-disc list-inside pl-2">
                                        <li>At least 8 characters</li>
                                        <li>Uppercase and lowercase letters</li>
                                        <li>Numbers</li>
                                        <li>Special characters (!@#$%^&*)</li>
                                    </ul>
                                </div>
                                {passwordStrength.score > 0 && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ${passwordStrength.score === 5 ? 'bg-green-500' :
                                                        passwordStrength.score === 4 ? 'bg-blue-500' :
                                                            passwordStrength.score === 3 ? 'bg-yellow-500' :
                                                                passwordStrength.score === 2 ? 'bg-orange-500' :
                                                                    'bg-red-500'
                                                        }`}
                                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {passwordStrength.message}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Confirm Password</label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmpassword"
                                        placeholder="***********"
                                        className={`bg-card/50 backdrop-blur-sm border ${formErrors.confirmPassword ? 'border-red-500' : 'border-card-foreground/10'
                                            } focus:border-green-400/30 focus:ring-green-400/20 transition-all duration-300`}
                                        ref={confirmPasswordRef}
                                        required
                                        onChange={handleConfirmPasswordChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showConfirmPassword ? (
                                            <FaEye />
                                        ) : (
                                            <FaEyeSlash />
                                        )}
                                    </button>
                                </div>
                                {formErrors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                                )}
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