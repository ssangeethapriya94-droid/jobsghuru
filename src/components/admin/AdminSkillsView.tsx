"use client";

import { useState } from "react";
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  Tag,
  Briefcase,
  Layers,
} from "lucide-react";

interface SkillItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  verified: boolean;
  jobCount: number;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  Technology: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/50",
  Design: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200/50",
  Data: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/50",
  Marketing: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200/50",
  Business: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200/50",
};

export default function AdminSkillsView({
  initialSkills,
}: {
  initialSkills: SkillItem[];
}) {
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "Technology",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const categories = Array.from(new Set(skills.map((s) => s.category)));

  const filtered = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === "ALL" || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const toggleVerify = async (skill: SkillItem) => {
    try {
      const res = await fetch("/api/admin/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: skill.id,
          verified: !skill.verified,
          reason: `Admin toggle verification for skill ${skill.name}`,
        }),
      });

      if (!res.ok) throw new Error("Failed to update skill");

      setSkills((prev) =>
        prev.map((s) => (s.id === skill.id ? { ...s, verified: !skill.verified } : s))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSkill.name.trim(),
          category: newSkill.category,
          description: newSkill.description,
          verified: true,
          reason: "Canonical taxonomy addition via Admin Portal",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add skill");
      }

      setSkills((prev) => [
        {
          id: data.skill.id,
          name: data.skill.name,
          category: data.skill.category,
          description: data.skill.description,
          verified: data.skill.verified,
          jobCount: 0,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setIsAdding(false);
      setNewSkill({ name: "", category: "Technology", description: "" });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Taxonomy & Skill Dictionary
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Canonical Skills Graph</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Maintain standardized skills recognized by the JobsGhuru resume parser, AI matching engine, and candidate recommendation algorithms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Canonical Skill
            </button>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills taxonomy or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <button
            onClick={() => setCategoryFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              categoryFilter === "ALL"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            All Disciplines
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((skill) => {
          const catClass =
            categoryColors[skill.category] || "bg-slate-100 text-slate-700 border-slate-200";

          return (
            <div
              key={skill.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {skill.name}
                    </span>
                    {skill.verified ? (
                      <span title="Canonical verified skill" className="text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span title="Custom user-defined skill" className="text-slate-400">
                        <Tag className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${catClass}`}
                  >
                    {skill.category}
                  </span>
                </div>

                {skill.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {skill.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Briefcase className="w-3.5 h-3.5" />
                  {skill.jobCount} Active Listings
                </span>

                <button
                  onClick={() => toggleVerify(skill)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    skill.verified
                      ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  }`}
                >
                  {skill.verified ? "Demote" : "Verify as Canonical"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Skill Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Register Canonical Skill
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js, Kubernetes, Financial Modeling"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100"
                >
                  <option value="Technology">Technology</option>
                  <option value="Data">Data & AI</option>
                  <option value="Design">Product & Design</option>
                  <option value="Marketing">Marketing & Growth</option>
                  <option value="Business">Business & Operations</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Ontology Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Modern React framework for SSR and static generation"
                  value={newSkill.description}
                  onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Save to Taxonomy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
