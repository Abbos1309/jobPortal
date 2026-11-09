"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, DollarSign, Briefcase, ArrowLeft, X, Upload } from "lucide-react";
import Navbar from "../../_components/Navbar";
import { createClient } from "@/supabase/utilis/clientComponents";

const supabase = createClient();

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

export default function JobDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null); // NEW: CV state
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchJobDetails = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setJob(data);
      }
      setLoading(false);
    };

    fetchJobDetails();
  }, [id]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Get current user (if logged in)
      const { data: { user } } = await supabase.auth.getUser();

      let resumePath = null;

      // 2. Handle CV file upload to Supabase Storage
      if (cvFile) {
        const fileExt = cvFile.name.split(".").pop();
        const userFolder = user?.id || "guest";
        const filePath = `${userFolder}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resumes") // Ensure you have a 'resumes' bucket in Supabase Storage
          .upload(filePath, cvFile);

        if (uploadError) {
          throw new Error(`CV Upload failed: ${uploadError.message}`);
        }

        resumePath = uploadData.path;
      }

      // 3. Save application data (including resume path) to Database
      const { error: dbError } = await supabase
        .from("applications")
        .insert([
          {
            job_id: id,
            full_name: fullName,
            email: email,
            resume_url: resumePath, 
            user_id: user?.id || null,
          },
        ]);

      if (dbError) {
        throw dbError;
      }

      alert(`Successfully applied for ${job?.title}!`);
      setIsModalOpen(false);
      setFullName("");
      setEmail("");
      setCvFile(null);
    } catch (error: any) {
      console.error("Error submitting application:", error.message || error);
      alert(error.message || "Something went wrong while submitting your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-600 font-semibold">Job position not found.</p>
        <button onClick={() => router.push("/jobs")} className="text-[#0f4c81] font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col relative">
      <Navbar />

      <main className="max-w-5xl mx-auto px-8 py-10 w-full grow space-y-6">
        <button
          onClick={() => router.push("/jobs")}
          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>

        <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm flex justify-between items-start relative">
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">{job.title}</h1>
              <p className="text-[#0f4c81] text-xl font-bold">{job.company}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-50 text-blue-600 font-semibold text-xs px-3 py-1.5 rounded">
                {job.category}
              </span>
              <span className="bg-slate-100 text-slate-600 font-semibold text-xs px-3 py-1.5 rounded">
                {job.location}
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0f4c81] hover:bg-[#0c3e69] text-white font-bold text-sm px-8 py-3 rounded-lg transition-colors shadow-md"
            >
              Apply Now
            </button>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-amber-700 block">{job.salary}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Job Description</h2>
              <p className="text-slate-600 leading-relaxed text-[15px]">{job.description}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 text-[15px]">
                {job.requirements.map((req, index) => (
                  <li key={index} className="pl-1">{req}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Job Details</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-bold block">Location</span>
                <span className="text-slate-800 font-medium text-sm flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block">Job Type</span>
                <span className="text-slate-800 font-medium text-sm flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-4 h-4 text-slate-400" /> {job.job_type || "Full-time"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block">Category</span>
                <span className="text-slate-800 font-medium text-sm block mt-0.5">{job.category}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block">Salary</span>
                <span className="text-amber-700 font-bold text-sm flex items-center gap-1.5 mt-0.5">
                  <DollarSign className="w-4 h-4 text-amber-600" /> {job.salary}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block">Company</span>
                <span className="text-slate-800 font-medium text-sm block mt-0.5">{job.company}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Apply for Position</h2>
            <p className="text-slate-600 text-sm mb-6">
              Apply to: <span className="font-bold text-slate-900">{job.title}</span>
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {/* NEW: CV Upload Input Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Upload CV / Resume (PDF or Doc)</label>
                <div className="relative border border-slate-200 bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600 truncate">
                    {cvFile ? cvFile.name : "Choose a file..."}
                  </span>
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0f4c81] hover:bg-[#0c3e69] text-white font-semibold text-sm py-3 rounded-lg transition-colors text-center block mt-2 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}