"use client";

import React, { useState, useEffect } from "react";
import { Mail, User, Briefcase, Calendar, Search, ShieldCheck, FileText, ExternalLink } from "lucide-react";
import Navbar from "../../_components/Navbar"; // Adjust path if necessary
import { Application } from "@/app/types";
import { createClient } from "@/supabase/utilis/clientComponents";

const supabase = createClient();



export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getApplications();
  }, []);

  const getApplications = async () => {
  setLoading(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isSuperAdmin = user.email === "admin@gmail.com";

    let appsData;

    if (isSuperAdmin) {
      // 👑 Super-admin: Fetch ALL applications directly
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      appsData = data;
    } else {
      // 🏢 Regular Employer: Fetch applications ONLY for jobs they posted
      const { data: employerJobs } = await supabase
        .from("jobs")
        .select("id")
        .eq("employer_id", user.id);

      if (!employerJobs || employerJobs.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const jobIds = employerJobs.map((j) => String(j.id));

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      appsData = data;
    }

    if (appsData && appsData.length > 0) {
      // Fetch associated job titles and companies
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, title, company");

      const formattedApps = appsData.map((app: any) => {
        const matchedJob = jobsData?.find(
          (job) => String(job.id) === String(app.job_id)
        );
        return {
          ...app,
          jobs: matchedJob
            ? { title: matchedJob.title, company: matchedJob.company }
            : null,
        };
      });

      setApplications(formattedApps);
    } else {
      setApplications([]);
    }
  } catch (error: any) {
    console.error("Error fetching applications:", error.message);
  } finally {
    setLoading(false);
  }
};

  const filteredApplications = applications.filter((app) => {
    const matchesName = app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesEmail = app.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesJob = app.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return matchesName || matchesEmail || matchesJob;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-10 grow w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#0f4c81] font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> Admin Dashboard
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Job Applications</h1>
            <p className="text-slate-500 text-sm">Review and manage candidates who applied for open roles.</p>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by name, email, or job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400 shadow-sm"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            Loading applications data...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400 shadow-sm">
            No job applications found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApplications.map((app: any) => {
              const formattedDate = new Date(app.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{app.full_name}</h3>
                        <p className="text-slate-500 text-sm flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5" /> {app.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start md:items-center gap-2.5 md:w-1/3">
                    <div className="bg-blue-50 p-2 rounded-lg text-[#0f4c81] shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Applied For</span>
                      <h4 className="text-sm font-semibold text-slate-800">
                        {app.jobs?.title || "Unknown Position"}
                      </h4>
                      <p className="text-slate-500 text-xs">{app.jobs?.company || "Unknown Company"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Date Received</span>
                      <span className="text-slate-600 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formattedDate}
                      </span>
                    </div>

                    {/* View CV Button Section */}
                    <div>
                      {app.resume_url ? (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#0f4c81] hover:bg-[#0b3860] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                        >
                          <FileText className="w-4 h-4" /> View CV <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg block">
                          No CV Attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}