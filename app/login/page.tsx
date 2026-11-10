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

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            if (isSignUp) {
                // Sign Up flow
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            role: role, // Saves selected role into metadata
                        },
                    },
                });

                if (error) throw error;

                toast.success("Registration successful! You can now sign in.");
                setIsSignUp(false);
            } else {
                // Sign In flow
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                toast.success("Logged in successfully!");
                
                // Check role to redirect employers to admin dashboard or seekers to home
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
            if (!isSignUp) return;
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col justify-center items-center px-4 relative py-12">
            {/* Back to Home Button */}
            <button
                onClick={() => router.push("/")}
                className="absolute top-6 left-6 flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-8 space-y-6">
                
                {/* Header Branding */}
                <div className="text-center space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f3473] font-bold text-white text-base tracking-wider shadow-md">
                        JP
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {isSignUp ? "Create an Account" : "Welcome Back"}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isSignUp ? "Choose your role and register your profile" : "Enter your credentials to access your account"}
                    </p>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                        {errorMsg}
                    </div>
                )}

                {/* Form */}
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

                            {/* Role Selector Tabs */}
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
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
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

                {/* Toggle between Sign In and Sign Up */}
                <div className="text-center pt-2 border-t border-slate-100">
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
                </div>

            </div>
        </div>
    );
}