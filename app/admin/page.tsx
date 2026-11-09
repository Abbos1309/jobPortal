"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Briefcase, Loader2 } from "lucide-react";
import { createClient } from "@/supabase/utilis/clientComponents";

// Import shadcn/ui Dialog components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const supabase = createClient();

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    category: string;
    job_type: string;
    description: string;
    requirements: string[];
    created_at?: string;
}

const INITIAL_FORM_STATE = {
    title: "",
    company: "",
    location: "",
    salary: "",
    category: "Technology",
    job_type: "Full-time",
    description: "",
    requirements: "",
};

export default function JobsCRUD() {
    const router = useRouter();

    // Security & Authorization States
    const [authLoading, setAuthLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingJobId, setEditingJobId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // 1. Check Admin Permission and Session on Mount
    useEffect(() => {
        const checkAdminAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            // If not logged in at all, redirect to login page
            if (!session) {
                router.push("/login");
                return;
            }

            // Check if user metadata has role === "admin"
            const userRole = session.user.user_metadata?.role;

            if (userRole !== "admin") {
                router.push("/");
                return;
            }

            setIsAdmin(true);
            setAuthLoading(false);
            getJobs();
        };

        checkAdminAccess();
    }, [router]);

    const getJobs = async () => {
        setFetchLoading(true);
        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            setMessage({ type: "error", text: `Failed to load jobs: ${error.message}` });
        } else {
            setJobs(data || []);
        }
        setFetchLoading(false);
    };

    const openCreateModal = () => {
        resetForm();
        setModalMode("create");
        setIsModalOpen(true);
    };

    const openEditModal = (job: Job) => {
        setEditingJobId(job.id);
        setFormData({
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary === "Not Specified" ? "" : job.salary,
            category: job.category,
            job_type: job.job_type,
            description: job.description,
            requirements: job.requirements ? job.requirements.join(", ") : "",
        });
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        resetForm();
        setIsModalOpen(false);
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE);
        setEditingJobId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const requirementsArray = formData.requirements
            .split(",")
            .map((req) => req.trim())
            .filter((req) => req !== "");

        const payload = {
            title: formData.title,
            company: formData.company,
            location: formData.location,
            salary: formData.salary || "Not Specified",
            category: formData.category,
            job_type: formData.job_type,
            description: formData.description,
            requirements: requirementsArray,
        };

        if (modalMode === "create") {
            const { error } = await supabase.from("jobs").insert([payload]);
            setLoading(false);

            if (error) {
                setMessage({ type: "error", text: `Error creating job: ${error.message}` });
            } else {
                setMessage({ type: "success", text: "Job posted successfully!" });
                closeModal();
                getJobs();
            }
        } else if (modalMode === "edit" && editingJobId) {
            const { error } = await supabase
                .from("jobs")
                .update(payload)
                .eq("id", editingJobId);
            setLoading(false);

            if (error) {
                setMessage({ type: "error", text: `Error updating job: ${error.message}` });
            } else {
                setMessage({ type: "success", text: "Job updated successfully!" });
                closeModal();
                getJobs();
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this job posting?")) return;

        const { error } = await supabase.from("jobs").delete().eq("id", id);

        if (error) {
            setMessage({ type: "error", text: `Error deleting job: ${error.message}` });
        } else {
            setMessage({ type: "success", text: "Job deleted successfully!" });
            getJobs();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Show a clean loader while checking admin rights
    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0f3473]" />
                <p className="text-slate-500 font-medium text-sm">Verifying admin permissions...</p>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="crud-container">
            {/* Top Dashboard Row */}
            <div className="crud-header-row">
                <div>
                    <h1 className="crud-title">Internal Job Board</h1>
                    <p className="crud-subtitle">Manage, create, modify, and track public job vacancies</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <Plus size={16} /> Add New Job
                </button>
            </div>

            {/* Notification Messages */}
            {message && (
                <div className={`alert-message ${message.type === "success" ? "alert-success" : "alert-error"}`}>
                    {message.text}
                </div>
            )}

            {/* Main Listings Data Table View */}
            <div className="table-wrapper">
                {fetchLoading ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
                        Gathering available job listings...
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="empty-state">
                        <Briefcase className="empty-state-icon" />
                        <h3 style={{ fontSize: "1rem", color: "#334155", margin: "0 0 0.25rem 0" }}>No vacancies compiled yet</h3>
                        <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0" }}>Get started by creating your very first post configuration profile.</p>
                    </div>
                ) : (
                    <table className="crud-table">
                        <thead>
                            <tr>
                                <th>Job Info</th>
                                <th>Requirements</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Compensation</th>
                                <th style={{ textAlign: "right" }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id}>
                                    <td>
                                        <div className="job-title-cell">{job.title}</div>
                                        <div className="job-meta-cell">{job.company} — {job.location}</div>
                                    </td>
                                    <td>
                                        {job.requirements && job.requirements.length > 0 ? (
                                            <ul className="requirements-list-inline">
                                                {job.requirements.map((req, idx) => (
                                                    <li key={idx} className="req-pill">{req}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>None</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="badge badge-gray">{job.category}</span>
                                    </td>
                                    <td>
                                        <span className="badge badge-blue w-18">{job.job_type}</span>
                                    </td>
                                    <td style={{ fontWeight: 500, color: "#475569" }}>{job.salary}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <button onClick={() => openEditModal(job)} className="btn-icon btn-icon-edit" title="Modify Entry">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(job.id)} className="btn-icon btn-icon-delete" title="Drop Listing">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* shadcn/ui Dialog Component */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[650px] bg-white p-6">
                    <DialogHeader className="border-b pb-4 mb-6">
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            {modalMode === "create" ? "Add New Job Listing" : "Modify Listing Details"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid-2">
                            <div>
                                <label className="form-label">Job Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Senior Frontend Engineer"
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="form-label">Company *</label>
                                <input
                                    type="text"
                                    name="company"
                                    required
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="e.g., TechCorp"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div>
                                <label className="form-label">Location *</label>
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., San Francisco, CA"
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="form-label">Salary (Optional)</label>
                                <input
                                    type="text"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g., $100,000 - $150,000"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div>
                                <label className="form-label">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                                    <option value="Technology">Technology</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Finance">Finance</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Job Type</label>
                                <select name="job_type" value={formData.job_type} onChange={handleChange} className="form-select">
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Job description and responsibilities..."
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Requirements (comma-separated)</label>
                            <input
                                type="text"
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                placeholder="e.g., React, TypeScript, 5+ years experience"
                                className="form-input"
                            />
                        </div>

                        <div className="form-actions-grid">
                            <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: "center" }}>
                                {loading ? "Processing..." : modalMode === "create" ? "Add Job" : "Update Details"}
                            </button>
                            <button type="button" onClick={closeModal} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}