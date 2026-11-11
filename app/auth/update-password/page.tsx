"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/utilis/clientComponents";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const supabase = createClient();

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            toast.success("Password updated successfully!");
            setTimeout(() => {
                router.push("/");
                router.refresh();
            }, 1000);
        } catch (err: any) {
            toast.error(err.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <form onSubmit={handleUpdatePassword} className="w-full max-w-md space-y-4 p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-center">Set New Password</h2>
                
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                    {loading ? <Loader2 className="animate-spin mx-auto h-5 w-5" /> : "Update Password"}
                </button>
            </form>
        </div>
    );
}