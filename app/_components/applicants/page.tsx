"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/supabase/utilis/clientComponents";

const supabase = createClient();

export default function AdminApplicantsPage() {
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Call the function inside useEffect when the admin page loads
    useEffect(() => {
        getEmployerApplicants();
    }, []);

    // 2. Paste your function here
    const getEmployerApplicants = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Get all job IDs owned by this employer
    const { data: employerJobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id")
        .eq("employer_id", user.id);

    if (jobsError || !employerJobs || employerJobs.length === 0) {
        setApplicants([]);
        return;
    }

    const jobIds = employerJobs.map((j) => j.id);

    // 2. Fetch applications matching those job IDs
    const { data: appsData, error: appsError } = await supabase
        .from("applications")
        .select(`
            id,
            full_name,
            email,
            resume_url,
            created_at,
            job_id,
            jobs (
                id,
                title
            )
        `)
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

    if (appsError) {
        console.error("Error fetching applicants:", appsError.message);
    } else {
        setApplicants(appsData || []);
    }
};

    return (
        <div className="p-8 max-w-6xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-6 text-slate-900">Applicants for My Jobs</h1>

            {loading ? (
                <p className="text-slate-500">Loading applicants...</p>
            ) : applicants.length === 0 ? (
                <p className="text-slate-400">No applicants found for your job postings yet.</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                                <th className="p-4">Applicant</th>
                                <th className="p-4">Job Role</th>
                                <th className="p-4">Applied Date</th>
                                <th className="p-4">Resume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {applicants.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50/50">
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-900">{app.full_name}</p>
                                        <p className="text-xs text-slate-400">{app.email}</p>
                                    </td>
                                    <td className="p-4 font-medium text-[#0f3473]">{app.jobs?.title}</td>
                                    <td className="p-4 text-xs text-slate-500">
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        {app.resume_url ? (
                                            <a 
                                                href={app.resume_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-[#0f3473] font-semibold hover:underline text-xs bg-blue-50 px-3 py-1.5 rounded-md inline-block"
                                            >
                                                View CV
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 text-xs">No CV</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}