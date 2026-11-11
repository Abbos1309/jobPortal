"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/utilis/clientComponents";
import { Camera, User, Loader2, Save, Building2, Briefcase } from "lucide-react";
import { toast } from "react-toastify";

const supabase = createClient();

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState<"user" | "employer" | "admin">("user");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error || !session) {
                    router.push("/login");
                    return;
                }

                const metadata = session.user?.user_metadata || {};
                const fullNameParts = (metadata.full_name || "").split(" ");
                
                setFirstName(metadata.first_name || fullNameParts[0] || "");
                setLastName(metadata.last_name || fullNameParts.slice(1).join(" ") || "");
                setRole(metadata.role || "user");
                setAvatarUrl(metadata.avatar_url || null);
            } catch (err) {
                console.error("Error fetching user session:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // For now, let's keep the existing avatarUrl or a default avatar 
            // to prevent bloating cookies until you set up a Supabase storage bucket.
            const full_name = `${firstName.trim()} ${lastName.trim()}`.trim();
            
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: full_name,
                    role: role,
                    // Do NOT save heavy avatarBase64 strings here to prevent error 431!
                },
            });

            if (updateError) throw updateError;

            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0f3473]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-10">
                <div className="border-b border-gray-100 pb-6 mb-8">
                    <h1 className="text-2xl font-bold text-[#0f3473]">Profile Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your account profile details and role preferences.
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Profile Picture Edit */}
                    <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6 pb-6 border-b border-gray-100">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-50 border-2 border-[#0f3473] flex items-center justify-center shadow-inner">
                                {previewUrl || avatarUrl ? (
                                    <img
                                        src={previewUrl || avatarUrl!}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-[#0f3473]" />
                                )}
                            </div>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-[#0f3473] hover:bg-[#0b2859] text-white p-2 rounded-full cursor-pointer shadow-md transition-transform hover:scale-110"
                            >
                                <Camera className="w-4 h-4" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800">Profile Photo</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG or GIF. Click the camera icon to upload a new picture.
                            </p>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Account Type / Role
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole("user")}
                                className={`flex items-center justify-center gap-2 p-3.5 rounded-lg border text-sm font-semibold transition cursor-pointer ${
                                    role === "user"
                                        ? "border-[#0f3473] bg-blue-50 text-[#0f3473]"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                Job Seeker
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("employer")}
                                className={`flex items-center justify-center gap-2 p-3.5 rounded-lg border text-sm font-semibold transition cursor-pointer ${
                                    role === "employer"
                                        ? "border-[#0f3473] bg-blue-50 text-[#0f3473]"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <Building2 className="w-4 h-4" />
                                Employer
                            </button>
                        </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                placeholder="Enter first name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f3473] text-sm text-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter last name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f3473] text-sm text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0f3473] hover:bg-[#0b2859] text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}