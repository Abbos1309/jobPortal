"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, DollarSign, ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Navbar from "../_components/Navbar";
import { createClient } from "@/supabase/utilis/clientComponents";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Job {
    id: string;
    title: string;
    company: string;
    description: string;
    category: string;
    job_type: string;
    location: string;
    salary: string;
    requirements: string[];
}

export default function JobPortal() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedJobType, setSelectedJobType] = useState("All Types");
    const [locationFilter, setLocationFilter] = useState("");
    const [requirementFilter, setRequirementFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 5;

    const jobListRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    
    const searchParams = useSearchParams();
    const urlQuery = searchParams.get("query");

    useEffect(() => {
        if (urlQuery) {
            setSearch(urlQuery);
        }
    }, [urlQuery]);

    const fetchJobs = async () => {
        let query = supabase.from("jobs").select("*");

        if (selectedCategory !== "All Categories") {
            query = query.eq("category", selectedCategory);
        }

        const { data, error } = await query;
        if (data) {
            const filtered = data.filter((job: Job) => {
                // Keyword Search
                const matchesSearch = search === "" ||
                    job.title.toLowerCase().includes(search.toLowerCase()) ||
                    job.company.toLowerCase().includes(search.toLowerCase()) ||
                    job.description.toLowerCase().includes(search.toLowerCase());

                // Job Type Filter
                const matchesJobType = selectedJobType === "All Types" || 
                    job.job_type.toLowerCase() === selectedJobType.toLowerCase();

                // Location Filter
                const matchesLocation = locationFilter === "" || 
                    job.location.toLowerCase().includes(locationFilter.toLowerCase());

                // Requirement Filter
                const matchesRequirement = requirementFilter === "" || 
                    job.requirements.some(r => r.toLowerCase().includes(requirementFilter.toLowerCase()));

                return matchesSearch && matchesJobType && matchesLocation && matchesRequirement;
            });

            setJobs(filtered);
            setCurrentPage(1);
        }
    }

    useEffect(() => {
        fetchJobs();
    }, [search, selectedCategory, selectedJobType, locationFilter, requirementFilter]);

    const handleReset = () => {
        setSearch("");
        setSelectedCategory("All Categories");
        setSelectedJobType("All Types");
        setLocationFilter("");
        setRequirementFilter("");
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        jobListRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Pagination calculations
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(jobs.length / jobsPerPage);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col">
            <Navbar />
 
            <main className="max-w-7xl mx-auto px-8 py-10 grow w-full">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Find Your Next Opportunity</h1>
                    <p className="text-slate-500 text-lg">Explore our curated list of job openings and find the perfect match for your career.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <aside className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm sticky top-24 space-y-5">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-[#0f4c81]" /> Filter Jobs
                            </h2>
                        </div>

                        {/* Search by keyword */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Keyword</label>
                            <input
                                type="text"
                                placeholder="Title, company..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Category</label>
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm appearance-none outline-none focus:border-slate-400 text-slate-700 font-medium cursor-pointer"
                                >
                                    <option value="All Categories">All Categories</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Finance">Finance</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Job Type Filter (Full-time / Part-time) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Job Type</label>
                            <div className="relative">
                                <select
                                    value={selectedJobType}
                                    onChange={(e) => setSelectedJobType(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm appearance-none outline-none focus:border-slate-400 text-slate-700 font-medium cursor-pointer"
                                >
                                    <option value="All Types">All Types</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Remote">Remote</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Location</label>
                            <input
                                type="text"
                                placeholder="City or Country..."
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Requirement Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Requirement Skill</label>
                            <input
                                type="text"
                                placeholder="e.g. React, Python..."
                                value={requirementFilter}
                                onChange={(e) => setRequirementFilter(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={handleReset}
                            className="w-full cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg transition-colors pt-2"
                        >
                            Reset All Filters
                        </button>
                    </aside>

                    {/* Job Listings Column */}
                    <section ref={jobListRef} className="lg:col-span-3 space-y-6 scroll-mt-24">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-2xl font-bold text-slate-900">Available Jobs</h2>
                            <span className="text-slate-400 text-sm font-medium">{jobs.length} positions found</span>
                        </div>

                        {currentJobs.map((job) => {
                            const firstLetter = job.title.charAt(0);
                            const visibleRequirements = job.requirements.slice(0, 3);
                            const extraCount = job.requirements.length - 3;

                            return (
                                <div key={job.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{job.title}</h3>
                                            <p className="text-slate-500 font-medium text-sm">{job.company}</p>
                                        </div>
                                        <div className="bg-[#0f4c81] text-white font-bold w-10 h-10 rounded-md flex items-center justify-center text-md shadow-sm">
                                            {firstLetter}
                                        </div>
                                    </div>

                                    <p className="text-slate-600 text-[15px] leading-relaxed mb-4 max-w-3xl">
                                        {job.description}
                                    </p>

                                    <div className="flex items-center space-x-2 mb-4">
                                        <span className="bg-amber-50 text-amber-600 font-semibold text-xs px-2.5 py-1 rounded">
                                            {job.category}
                                        </span>
                                        <span className="bg-emerald-50 text-emerald-600 font-semibold text-xs px-2.5 py-1 rounded">
                                            {job.job_type}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-6 text-slate-400 text-sm font-medium mb-5">
                                        <div className="flex items-center space-x-1">
                                            <MapPin className="w-4 h-4 text-pink-400" />
                                            <span>{job.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <DollarSign className="w-4 h-4 text-amber-500" />
                                            <span>{job.salary}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-50 pt-4 mb-6">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Requirements:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {visibleRequirements.map((req, i) => (
                                                <span key={i} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded font-medium">
                                                    {req}
                                                </span>
                                            ))}
                                            {extraCount > 0 && (
                                                <span className="bg-slate-50 border border-slate-200 text-slate-500 text-xs px-2.5 py-1 rounded font-medium">
                                                    +{extraCount || 0} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link href={`/jobs/${job.id}`}>
                                        <button className="w-full bg-[#0f4c81] hover:bg-[#0c3e69] text-white font-semibold text-sm py-2.5 rounded-lg transition-colors text-center block">
                                            View Details
                                        </button>
                                    </Link>
                                </div>
                            );
                        })}

                        {jobs.length === 0 && (
                            <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400">
                                No job openings match your current search filters.
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center bg-white rounded-xl border border-slate-100 p-4 shadow-sm mt-6">
                                <button
                                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="flex cursor-pointer items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </button>
                                <span className="text-sm font-medium text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="flex cursor-pointer items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <footer className="bg-[#0b0f19] text-slate-400 py-6 text-center text-sm border-t border-slate-800">
                <p>© 2024 JobPortal. All rights reserved.</p>
            </footer>
        </div>
    );
}