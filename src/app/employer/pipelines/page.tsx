"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  MoveUp,
  MoveDown,
  AlertTriangle,
  Clock,
  Sparkles,
  GitBranch,
  Settings,
  ChevronRight,
  Briefcase,
  Users,
} from "lucide-react";

export default function EmployerPipelinesPage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState<any | null>(null);
  const [editingStages, setEditingStages] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showNewPipelineModal, setShowNewPipelineModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = () => {
    setLoading(true);
    fetch("/api/employer/pipelines")
      .then((res) => res.json())
      .then((d) => {
        if (d.success && d.pipelines?.length) {
          setPipelines(d.pipelines);
          const active = d.pipelines[0];
          setSelectedPipeline(active);
          const currentVersion = active.versions?.[0];
          setEditingStages(currentVersion?.stages || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSelectPipeline = (p: any) => {
    setSelectedPipeline(p);
    const currentVersion = p.versions?.[0];
    setEditingStages(currentVersion?.stages || []);
    setHasChanges(false);
  };

  const handleAddStage = () => {
    const newStage = {
      name: "New Interview Round",
      stageType: "INTERVIEW",
      interviewSubtype: "TECHNICAL",
      requiresFeedback: true,
      orderIndex: editingStages.length,
    };
    setEditingStages([...editingStages, newStage]);
    setHasChanges(true);
  };

  const handleRemoveStage = (index: number) => {
    if (editingStages.length <= 2) {
      alert("A pipeline must have at least 2 stages (e.g. Screening and Offer).");
      return;
    }
    const updated = editingStages.filter((_, i) => i !== index);
    setEditingStages(updated);
    setHasChanges(true);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editingStages.length) return;

    const copy = [...editingStages];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setEditingStages(copy);
    setHasChanges(true);
  };

  const handleStageFieldChange = (index: number, field: string, value: any) => {
    const copy = [...editingStages];
    copy[index] = { ...copy[index], [field]: value };
    setEditingStages(copy);
    setHasChanges(true);
  };

  const handleInitiateSave = () => {
    const currentVersion = selectedPipeline?.versions?.[0];
    const activeCandidateCount = currentVersion?._count?.applications || 0;

    if (activeCandidateCount > 0) {
      // Prompt user with Section 13 requirement:
      // "This change may affect candidates currently in this hiring process."
      setShowWarningModal(true);
    } else {
      executeSave(false);
    }
  };

  const executeSave = async (notifyAffectedCandidates: boolean) => {
    setSaving(true);
    setShowWarningModal(false);
    try {
      const res = await fetch(`/api/employer/pipelines/${selectedPipeline.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stages: editingStages,
          notifyAffectedCandidates,
        }),
      });

      const d = await res.json();
      if (res.ok) {
        setSuccessMsg(
          notifyAffectedCandidates
            ? "Pipeline version updated and affected active candidates were notified."
            : "Pipeline version updated successfully."
        );
        setHasChanges(false);
        fetchPipelines();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/employer/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
        }),
      });

      if (res.ok) {
        setShowNewPipelineModal(false);
        setNewTitle("");
        setNewDescription("");
        fetchPipelines();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentVersion = selectedPipeline?.versions?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 mb-2">
            <GitBranch size={13} className="text-blue-600" />
            Dynamic Stage Engine & Versioning
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Custom Hiring Pipelines</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure custom hiring stages, add assessments or technical rounds, and safely version active candidate workflows.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewPipelineModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} /> Create New Pipeline
        </button>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div className="h-64 rounded-3xl bg-slate-200 animate-pulse"></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Pipelines Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Company Pipelines ({pipelines.length})
            </div>

            <div className="space-y-2">
              {pipelines.map((p) => {
                const isSelected = selectedPipeline?.id === p.id;
                const v = p.versions?.[0];
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPipeline(p)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{p.title}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        v{v?.version || 1}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1">
                      {v?.stages?.length || 0} stages configured • {v?._count?.applications || 0} candidates
                    </div>

                    {p.jobs?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.jobs.slice(0, 2).map((j: any) => (
                          <span
                            key={j.id}
                            className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600"
                          >
                            {j.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Visual Stage Editor & Version Controls */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      {selectedPipeline?.title}
                    </h2>
                    <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-xs font-bold">
                      Version {currentVersion?.version || 1} Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentVersion?._count?.applications || 0} applications currently progressing through this pipeline.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddStage}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus size={14} /> Add Stage
                  </button>

                  <button
                    type="button"
                    disabled={!hasChanges || saving}
                    onClick={handleInitiateSave}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving ? "Saving..." : "Save Pipeline"}
                  </button>
                </div>
              </div>

              {/* Stage Flow Items */}
              <div className="space-y-3">
                {editingStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>

                      <div className="space-y-1">
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => handleStageFieldChange(idx, "name", e.target.value)}
                          className="font-bold text-xs text-slate-900 bg-white rounded-lg border border-slate-200 px-2.5 py-1 focus:outline-none focus:border-blue-600"
                        />

                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <select
                            value={stage.stageType}
                            onChange={(e) => handleStageFieldChange(idx, "stageType", e.target.value)}
                            className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                          >
                            <option value="SCREENING">Screening</option>
                            <option value="PHONE_SCREEN">Phone Screen</option>
                            <option value="ASSESSMENT">Assessment / Test</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="ASSIGNMENT">Take-Home Assignment</option>
                            <option value="PORTFOLIO">Portfolio Review</option>
                            <option value="OFFER">Offer</option>
                            <option value="CUSTOM">Custom Round</option>
                          </select>

                          {stage.stageType === "INTERVIEW" && (
                            <select
                              value={stage.interviewSubtype || "TECHNICAL"}
                              onChange={(e) => handleStageFieldChange(idx, "interviewSubtype", e.target.value)}
                              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700"
                            >
                              <option value="HR">HR Interview</option>
                              <option value="TECHNICAL">Technical Interview</option>
                              <option value="MANAGERIAL">Manager Interview</option>
                              <option value="CULTURE_FIT">Culture Fit</option>
                              <option value="LEADERSHIP">Leadership Round</option>
                              <option value="FINAL">Final Executive Round</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Move Up/Down, Remove */}
                    <div className="flex items-center gap-1.5 self-end md:self-auto">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                        title="Move round earlier"
                      >
                        <MoveUp size={13} />
                      </button>

                      <button
                        type="button"
                        disabled={idx === editingStages.length - 1}
                        onClick={() => handleMove(idx, "down")}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                        title="Move round later"
                      >
                        <MoveDown size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50"
                        title="Delete stage"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Section 13 Safe Versioning Notification Warning */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Pipeline Modification Confirmation
                </h3>
                <p className="text-xs text-amber-700 font-semibold mt-0.5">
                  This change may affect candidates currently in this hiring process.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are updating a hiring pipeline with active candidates. A new pipeline version (Version {(currentVersion?.version || 1) + 1}) will be published. Please decide whether to dispatch an update notification to affected candidates.
            </p>

            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => executeSave(false)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Save Without Notifying
              </button>

              <button
                type="button"
                onClick={() => executeSave(true)}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
              >
                Save & Notify Affected Candidates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create New Pipeline */}
      {showNewPipelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Create Custom Pipeline</h3>
              <button
                onClick={() => setShowNewPipelineModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewPipeline} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pipeline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Leadership Track"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Explain who this recruitment flow applies to..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPipelineModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  Create Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
