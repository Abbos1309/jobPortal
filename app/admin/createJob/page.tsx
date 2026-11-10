"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/supabase/utilis/clientComponents";

const supabase = createClient();

export default function CreateJob() {
    const router = useRouter();
    const [authLoading, setAuthLoading] = useState(true);
    const [employerId, setEmployerId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        salary: "",
        category: "Technology",
        job_type: "Full-time",
        description: "",
        requirements: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Verify logged-in employer session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                router.push("/login");
                return;
            }

            setEmployerId(session.user.id);
            setAuthLoading(false);
        };

        checkAuth();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleReset = () => {
        setFormData({
            title: "",
            company: "",
            location: "",
            salary: "",
            category: "Technology",
            job_type: "Full-time",
            description: "",
            requirements: "",
        });
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!employerId) {
            setMessage({ type: "error", text: "Error: You must be logged in as an employer." });
            setLoading(false);
            return;
        }

        const requirementsArray = formData.requirements
            .split(",")
            .map((req) => req.trim())
            .filter((req) => req !== "");

        const { error } = await supabase.from("jobs").insert([
            {
                title: formData.title,
                company: formData.company,
                location: formData.location,
                salary: formData.salary || "Not Specified",
                category: formData.category,
                job_type: formData.job_type,
                description: formData.description,
                requirements: requirementsArray,
                employer_id: employerId, // 👈 Links the job to this specific logged-in employer
            },
        ]);

        setLoading(false);

        if (error) {
            setMessage({ type: "error", text: `Error: ${error.message}` });
        } else {
            setMessage({ type: "success", text: "Job posted successfully!" });
            handleReset();
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0f4c81]" />
                <p className="text-slate-500 font-medium text-sm">Verifying access...</p>
            </div>
        );
    }

    return (
        <div className="p-12 max-w-5xl w-full mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin"
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow-sm"
                >
                    ← Back to Jobs
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Create New Job</h1>
                <p className="text-slate-500 text-sm">Fill in the form below to create a new job posting</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-8">Add New Job</h2>

                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg text-sm font-semibold ${
                            message.type === "success"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Job Title *</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Senior Frontend Engineer"
                                className="w-full bg-slate-50/50 border border-slate-200/80 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-slate-400 text-slate-700 placeholder:text-slate-400 font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Company *</label>
                            <input
                                type="text"
                                name="company"
                                required
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="e.g., TechCorp"
                                className="w-full bg-slate-50/50 border border-slate-200/80 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-slate-400 text-slate-700 placeholder:text-slate-400 font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Location *</label>
                            <input
                                type="text"
                                name="location"
                                required
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g., San Francisco, CA"
                                className="w-full bg-slate-50/50 border border-slate-200/80 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-slate-400 text-slate-700 placeholder:text-slate-400 font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Salary (Optional)</label>
                            <input
                                type="text"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder="e.g., $100,000 - $150,000"
                                className="w-full bg-slate-50/50 border border-slate-200/80 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-slate-400 text-slate-700 placeholder:text-slate-400 font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Category</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200/80 rounded-lg px-4 py-2.5 text-sm appearance-none outline-none focus:border-slate-400 text-slate-700 font-medium cursor-pointer"
                                >
                                    <option value="Technology">Technology</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Finance">Finance</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Job Type</label>
                            <div className="relative">
                                <select
                                    name="job_type"
                                    value={formData.job_type}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200/80 rounded-lg px-4 py-2.5 text-sm appearance-none outline-none focus:border-slate-400 text-slate-700 font-medium cursor-pointer"
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Remote">Remote</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Description *</label>
                        <textarea
                            name="description"
                            required
                            rows={5}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Job description and responsibilities..."
                            className="w-full bg-slate-50/50 border border-slate-200/80 rounded-lg p-4 text-sm outline-none focus:border-slate-400 text-slate-700 placeholder:text-slate-400 font-medium resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Requirements (comma-separated)</label>
                        <input
                            type="text"
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleChange}
                            placeholder="e.g., React, TypeScript, 5+ years experience, Node.js"
                            className="w-full bg-slate-50/50 border border-slate-200/80 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-slate-400 text-slate-700 placeholder:text-slate-400 font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0f4c81] hover:bg-[#0c3e69] text-white font-bold text-sm py-2.5 rounded-lg transition-colors text-center disabled:opacity-50 shadow-sm cursor-pointer"
                        >
                            {loading ? "Adding..." : "Add Job"}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 rounded-lg transition-colors text-center shadow-sm cursor-pointer"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}