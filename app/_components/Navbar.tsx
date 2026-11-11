"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/utilis/clientComponents";
import { User, LogOut } from "lucide-react";

const supabase = createClient();

function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    const userRole = user?.user_metadata?.role;
    const avatarUrl = user?.user_metadata?.avatar_url;
    const displayName = user?.user_metadata?.full_name || user?.email || "Account";

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error("Error fetching session:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push("/login");
    };

    return (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50 shadow-[0_1px_3px_rgba(0,0,0,0.01)] font-sans antialiased">
            <nav className="px-6 py-4 sm:px-16">
                <div className="mx-auto flex max-w-7xl items-center justify-between">

                    {/* Logo Section */}
                    <a onClick={() => router.push("/")} className="group flex items-center gap-3 cursor-pointer">
                        <div className="flex h-9.5 w-9.5 items-center justify-center rounded-lg bg-[#0f3473] font-bold text-white text-xs tracking-wider transition-transform duration-200 ease-out group-hover:scale-105">
                            JP
                        </div>
                        <span className="text-lg font-bold tracking-tight text-[#0f3473] transition-colors duration-200 ease-out group-hover:text-[#0b2859]">
                            JobPortal
                        </span>
                    </a>

                    {/* Navigation Links & Auth Actions */}
                    <div className="flex items-center gap-6 sm:gap-8">
                        <button onClick={() => router.push("/")} className="text-[14px] cursor-pointer font-medium text-gray-700 hover:text-sky-700 transition-colors">
                            Home
                        </button>
                        <a onClick={() => router.push("/jobs")} className="text-[14px] cursor-pointer font-medium text-gray-700 hover:text-sky-700 transition-colors">
                            Jobs
                        </a>

                        {userRole === "admin" && (
                            <button
                                onClick={() => router.push("/admin")}
                                className="rounded-md cursor-pointer bg-[#0f3473] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#0b2859] shadow-sm"
                            >
                                Post a Job
                            </button>
                        )}

                        {!loading && (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        {/* Clickable User Info (Avatar & Name redirects to Profile) */}
                                        <button
                                            onClick={() => router.push("/profile")}
                                            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#0f3473] transition-colors cursor-pointer group"
                                        >
                                            {avatarUrl ? (
                                                <img 
                                                    src={avatarUrl} 
                                                    alt="Profile" 
                                                    className="w-7 h-7 rounded-full object-cover border border-gray-300 group-hover:border-[#0f3473]" 
                                                />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-blue-50 border border-gray-200 flex items-center justify-center group-hover:border-[#0f3473]">
                                                    <User className="w-4 h-4 text-[#0f3473]" />
                                                </div>
                                            )}
                                            <span className="max-w-[150px] truncate">
                                                {displayName}
                                            </span>
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            title="Logout"
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => router.push("/login")}
                                        className="rounded-md cursor-pointer border border-[#0f3473] text-[#0f3473] px-4 py-2 text-[14px] font-semibold transition hover:bg-blue-50"
                                    >
                                        Sign Up
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;