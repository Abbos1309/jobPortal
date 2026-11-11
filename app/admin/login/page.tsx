"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/utilis/clientComponents";


export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            if (data?.session) {
                window.location.href="/admin"
                router.refresh();
            }
        } catch (error: any) {
            setErrorMessage(error.message || "An unexpected error occurred during sign-in.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-between items-center p-8 w-full h-full max-w-md mx-auto mt-12">
            <div className="w-full flex flex-col justify-center items-center">
                <div onClick={()=>router.push("/")} className="flex items-center cursor-pointer space-x-2.5 mb-4">
                    <div className="bg-[#0f4c81] text-white cursor-pointer font-bold px-2.5 py-1 rounded text-md tracking-wider">
                        JP
                    </div>
                    <span className="text-xl cursor-pointer font-bold text-slate-900">JobPortal</span>
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-1">
                    Admin Dashboard
                </h1>
                <p className="text-slate-500 text-sm font-medium text-center mb-8">
                    Sign in to manage job postings
                </p>

                <div className="w-full bg-white rounded-xl border border-slate-200/60 shadow-sm p-8">
                    <form onSubmit={handleLogin} className="space-y-5">

                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-xs font-medium">
                                {errorMessage}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full bg-slate-50/50 border border-slate-200/80 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 font-medium text-slate-700 disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full bg-slate-50/50 border border-slate-200/80 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 font-medium text-slate-700 disabled:opacity-60"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0f4c81] hover:bg-[#0c3e69] text-white font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 bg-[#e9e3e6] rounded-lg p-4 border border-zinc-200/40">
                        <p className="text-xs font-bold text-slate-800 mb-1">Demo Credentials:</p>
                        <p className="text-xs text-slate-600 font-medium">
                            Email: admin@jobportal.com<br />Password: admin123
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <Link href="/" className="text-sm font-semibold text-[#0f4c81] hover:underline">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}