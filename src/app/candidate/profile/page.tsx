"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Sparkles,
  Save,
  Globe,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";

export default function CandidateProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    headline: "",
    summary: "",
    location: "",
    skillsStr: "",
    totalExperienceYears: 0,
    currentCompany: "",
    currentRole: "",
    currentCtc: "",
    expectedCtc: "",
    noticePeriod: "30 Days",
    availability: "Immediate",
    resumeUrl: "",
    resumeFileName: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    searchableByEmployers: false,
    contactableByEmployers: false,
    hideSalaryFromEmployers: true,
  });

  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/candidate/profile");
        if (!res.ok) {
          router.push("/candidate/login");
          return;
        }
        const data = await res.json();
        const p = data.profile || {};
        const u = data.user || {};

        setFormData({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || p.phone || "",
          headline: p.headline || "",
          summary: p.summary || "",
          location: p.location || "",
          skillsStr: Array.isArray(p.skills) ? p.skills.join(", ") : "",
          totalExperienceYears: p.totalExperienceYears || 0,
          currentCompany: p.currentCompany || "",
          currentRole: p.currentRole || "",
          currentCtc: p.currentCtc !== null && p.currentCtc !== undefined ? String(p.currentCtc) : "",
          expectedCtc: p.expectedCtc !== null && p.expectedCtc !== undefined ? String(p.expectedCtc) : "",
          noticePeriod: p.noticePeriod || "30 Days",
          availability: p.availability || "Immediate",
          resumeUrl: p.resumeUrl || "",
          resumeFileName: p.resumeFileName || "",
          portfolioUrl: p.portfolioUrl || "",
          linkedinUrl: p.linkedinUrl || "",
          githubUrl: p.githubUrl || "",
          searchableByEmployers: p.searchableByEmployers ?? false,
          contactableByEmployers: p.contactableByEmployers ?? false,
          hideSalaryFromEmployers: p.hideSalaryFromEmployers ?? true,
        });

        setCompleteness(p.profileCompleteness || 0);
      } catch {
        setErrorMsg("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setUploadingResume(true);
    setErrorMsg("");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("documentType", "RESUME");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMsg(resData.error || "Failed to upload resume.");
        setUploadingResume(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        resumeUrl: resData.url,
        resumeFileName: resData.fileName || file.name,
      }));
    } catch {
      setErrorMsg("Resume upload failed.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const skillsArray = formData.skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/candidate/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          skills: skillsArray,
          totalExperienceYears: parseFloat(String(formData.totalExperienceYears)) || 0,
          currentCtc: formData.currentCtc ? parseFloat(formData.currentCtc) : null,
          expectedCtc: formData.expectedCtc ? parseFloat(formData.expectedCtc) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update profile.");
        setSaving(false);
        return;
      }

      setSuccessMsg("Candidate profile and privacy preferences saved successfully.");
      setCompleteness(data.profileCompleteness || 0);
    } catch {
      setErrorMsg("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-slate-900 pb-16">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/candidate/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Completeness: <span className="text-blue-600">{completeness}%</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Candidate Profile & Privacy
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage your professional credentials, attached resume, and employer visibility settings.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 self-start sm:self-auto disabled:opacity-60"
            >
              <Save size={15} />
              <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
            </button>
          </div>

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* BASIC IDENTITY */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              <span>Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Location (City)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. Senior Full-Stack Engineer | React, Node.js & TypeScript"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Professional Summary</label>
              <textarea
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief summary of your core technical skills, achievements, and career goals..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* PROFESSIONAL EXPERIENCE & COMPENSATION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase size={18} className="text-blue-600" />
              <span>Experience & Compensation</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Role</label>
                <input
                  type="text"
                  value={formData.currentRole}
                  onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                  placeholder="e.g. SDE II"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Company</label>
                <input
                  type="text"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  placeholder="e.g. Infosys"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Experience (Years)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.totalExperienceYears}
                  onChange={(e) => setFormData({ ...formData, totalExperienceYears: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current CTC (₹ LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.currentCtc}
                  onChange={(e) => setFormData({ ...formData, currentCtc: e.target.value })}
                  placeholder="e.g. 12"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected CTC (₹ LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.expectedCtc}
                  onChange={(e) => setFormData({ ...formData, expectedCtc: e.target.value })}
                  placeholder="e.g. 18"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Period</label>
                <select
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="Immediate">Immediate (Serving Notice)</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="45 Days">45 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Skills (Comma-separated)</label>
              <input
                type="text"
                value={formData.skillsStr}
                onChange={(e) => setFormData({ ...formData, skillsStr: e.target.value })}
                placeholder="e.g. React, TypeScript, Node.js, Next.js, PostgreSQL, Docker"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* RESUME UPLOAD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>Resume Document</span>
            </h2>

            {formData.resumeFileName ? (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{formData.resumeFileName}</span>
                    <span className="text-[10px] text-slate-500">Active Resume File</span>
                  </div>
                </div>
                <label className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs">
                  <span>Replace Resume</span>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/30">
                <UploadCloud size={28} className="text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">Upload your Resume (PDF or DOCX)</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Used to pre-fill applications automatically</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
              </label>
            )}
            {uploadingResume && <p className="text-xs text-blue-600 animate-pulse">Uploading resume file...</p>}
          </div>

          {/* PRIVACY & VISIBILITY CONTROLS (MOST PRIVATE DEFAULTS) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck size={18} className="text-purple-600" />
                <span>Privacy & Employer Visibility</span>
              </h2>
              <p className="text-xs text-slate-500">
                JobsGuru defaults to maximum candidate privacy. You control when and how verified companies can find your profile.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Toggle 1 */}
              <label className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Allow verified employers to search my profile
                  </span>
                  <p className="text-[11px] text-slate-500">
                    When enabled, verified recruiters can discover your profile when searching for relevant technical skills.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.searchableByEmployers}
                  onChange={(e) => setFormData({ ...formData, searchableByEmployers: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 mt-1 cursor-pointer"
                />
              </label>

              {/* Toggle 2 */}
              <label className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Allow direct outreach from recruiters
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Allow verified companies to send you job invites and messages directly.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.contactableByEmployers}
                  onChange={(e) => setFormData({ ...formData, contactableByEmployers: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 mt-1 cursor-pointer"
                />
              </label>

              {/* Toggle 3 */}
              <label className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Hide salary expectations from employers (Recommended)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Keeps your current and target compensation confidential until the final offer stage.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.hideSalaryFromEmployers}
                  onChange={(e) => setFormData({ ...formData, hideSalaryFromEmployers: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 mt-1 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2 disabled:opacity-60"
            >
              <Save size={16} />
              <span>{saving ? "Saving Changes..." : "Save Profile & Privacy"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
