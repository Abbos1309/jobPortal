"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/utilis/clientComponents";
import { Lock, Mail, User as UserIcon, ArrowLeft, Loader2, Briefcase, UserCheck } from "lucide-react";
import { toast } from "react-toastify";

const supabase = createClient();

export default function LoginPage() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<"user" | "admin">("user"); // "user" = Job Seeker, "admin" = Employer
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            role: role,
                        },
                    },
                });

                if (error) throw error;

                toast.success("Registration successful! You can now sign in.");
                setIsSignUp(false);
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                toast.success("Logged in successfully!");

                const userRole = data.user?.user_metadata?.role;

                setTimeout(() => {
                    if (userRole === "admin") {
                        router.push("/admin");
                    } else {
                        router.push("/");
                    }
                    router.refresh();
                }, 1000);

                return;
            }
        } catch (err: any) {
            const message = err.message || "An error occurred during authentication.";
            setErrorMsg(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error("Google login error:", error.message);
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });

            if (error) throw error;

            toast.success("Password reset email sent! Check your inbox.");
        } catch (err: any) {
            const message = err.message || "Failed to send reset email.";
            setErrorMsg(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col justify-center items-center px-4 relative py-12">
            <button
                onClick={() => router.push("/")}
                className="absolute top-6 left-6 flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-8 space-y-6">

                <div className="text-center space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f3473] font-bold text-white text-base tracking-wider shadow-md">
                        JP
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {isForgotPassword ? "Reset Password" : isSignUp ? "Create an Account" : "Welcome Back"}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isForgotPassword 
                            ? "Enter your email to receive a password reset link" 
                            : isSignUp 
                            ? "Choose your role and register your profile" 
                            : "Enter your credentials to access your account"}
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                        {errorMsg}
                    </div>
                )}

                {isForgotPassword ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-[#0f3473] focus:bg-white transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0f3473] hover:bg-[#0b2859] text-white font-semibold text-sm py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Send Reset Link
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsForgotPassword(false);
                                    setErrorMsg("");
                                }}
                                className="text-sm font-semibold text-[#0f3473] hover:underline cursor-pointer"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignUp && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                    <div className="relative flex items-center">
                                        <UserIcon className="absolute left-3.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-[#0f3473] focus:bg-white transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">I want to:</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setRole("user")}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                                                role === "user"
                                                    ? "border-[#0f3473] bg-blue-50/50 text-[#0f3473] shadow-sm"
                                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            <UserCheck className="w-4 h-4" /> Find Jobs
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole("admin")}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                                                role === "admin"
                                                    ? "border-[#0f3473] bg-blue-50/50 text-[#0f3473] shadow-sm"
                                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            <Briefcase className="w-4 h-4" /> Post Jobs (Employer)
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-[#0f3473] focus:bg-white transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                {!isSignUp && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPassword(true);
                                            setErrorMsg("");
                                        }}
                                        className="text-xs font-semibold text-[#0f3473] hover:underline cursor-pointer"
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-[#0f3473] focus:bg-white transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0f3473] hover:bg-[#0b2859] text-white font-semibold text-sm py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </button>
                    </form>
                )}

                {!isForgotPassword && (
                    <div className="text-center pt-2 border-t border-slate-100 space-y-4">
                        <p className="text-sm text-slate-600">
                            {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setErrorMsg("");
                                }}
                                className="font-semibold text-[#0f3473] hover:underline cursor-pointer"
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </p>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.15v3.14C3.15 21.32 7.21 24 12 24z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.62H1.15C.42 8.1 0 9.71 0 12s.42 3.9 1.15 5.38l4.12-3.14z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.21 0 3.15 2.68 1.15 6.62l4.12 3.14c.95-2.85 3.6-4.96 6.73-4.96z"
                                />
                            </svg>
                            {loading ? "Connecting to Google..." : "Continue with Google"}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}