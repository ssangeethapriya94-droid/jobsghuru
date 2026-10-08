"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  ArrowRight,
  Clock,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  Search,
  Filter,
  Trash2,
  Edit3,
  Archive,
  Eye,
  FileSpreadsheet,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Radio,
  FileText,
  Code,
  Lock,
  Sparkles,
  HelpCircle,
  Save,
  RotateCcw,
} from "lucide-react";

export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "CODE";

interface QuestionItem {
  id?: string;
  question: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer?: string;
  points: number;
  negativePoints: number;
  scoringMode?: "ALL_OR_NOTHING" | "PARTIAL";
  orderIndex: number;
  explanation?: string;
}

export default function EmployerAssessmentsPage() {
  // Main state
  const [activeTab, setActiveTab] = useState<"assessments" | "reviews">("assessments");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [assessments, setAssessments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("RECRUITER");

  // Modals
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<any | null>(null);

  // Editor Form State
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editDuration, setEditDuration] = useState(30);
  const [editPassingScore, setEditPassingScore] = useState(70);
  const [editMaxAttempts, setEditMaxAttempts] = useState(1);
  const [editIsRandomized, setEditIsRandomized] = useState(false);
  const [editQuestions, setEditQuestions] = useState<QuestionItem[]>([]);
  const [editorActiveTab, setEditorActiveTab] = useState<"settings" | "questions">("settings");
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Assign Form State
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [assignDaysValid, setAssignDaysValid] = useState(7);
  const [assignedLink, setAssignedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // CSV Import State
  const [csvText, setCsvText] = useState("");
  const [csvImportResult, setCsvImportResult] = useState<any | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);

  // Preview State
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);
  const [previewScore, setPreviewScore] = useState<{ earned: number; total: number; pct: number } | null>(null);

  // Grading State
  const [manualGrades, setManualGrades] = useState<Record<string, { marks: number; notes: string }>>({});
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Permissions
  const canEdit = currentUserRole === "COMPANY_ADMIN" || currentUserRole === "RECRUITER";
  const isHiringManager = currentUserRole === "HIRING_MANAGER";

  useEffect(() => {
    fetchSession();
    fetchAssessments();
    fetchApplications();
    fetchReviews();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/employer/auth/session");
      const d = await res.json();
      if (d.user?.role) {
        setCurrentUserRole(d.user.role);
      }
    } catch {
      // fallback
    }
  };

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/assessments");
      const d = await res.json();
      if (d.success && Array.isArray(d.assessments)) {
        setAssessments(d.assessments);
        if (d.assessments.length > 0 && !selectedAssessment) {
          setSelectedAssessment(d.assessments[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/employer/applications");
      const d = await res.json();
      if (d.success) setApplications(d.applications || []);
    } catch {}
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch("/api/employer/assessments/reviews");
      const d = await res.json();
      if (d.success) setReviews(d.reviews || []);
    } catch {}
    finally {
      setReviewsLoading(false);
    }
  };

  // Filtered assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((ass) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ARCHIVED" ? ass.isArchived || ass.status === "ARCHIVED" : ass.status === statusFilter && !ass.isArchived);
      const matchesSearch =
        ass.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ass.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ass.skills || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [assessments, statusFilter, searchQuery]);

  // Open editor for new or existing
  const handleOpenEditor = (assessment?: any) => {
    setEditorError(null);
    if (assessment) {
      setEditingAssessmentId(assessment.id);
      setEditTitle(assessment.title || "");
      setEditDescription(assessment.description || "");
      setEditSkills((assessment.skills || []).join(", "));
      setEditDuration(assessment.durationMinutes || 30);
      setEditPassingScore(assessment.passingScore || 70);
      setEditMaxAttempts(assessment.maxAttempts || 1);
      setEditIsRandomized(assessment.isRandomized || false);
      setEditQuestions(
        (assessment.questions || []).map((q: any, i: number) => ({
          id: q.id,
          question: q.question,
          questionType: q.questionType || "SINGLE_CHOICE",
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
          points: q.points || 10,
          negativePoints: q.negativePoints || 0,
          orderIndex: q.orderIndex !== undefined ? q.orderIndex : i,
          explanation: q.explanation || "",
        }))
      );
    } else {
      setEditingAssessmentId(null);
      setEditTitle("");
      setEditDescription("");
      setEditSkills("JavaScript, React, TypeScript");
      setEditDuration(30);
      setEditPassingScore(70);
      setEditMaxAttempts(1);
      setEditIsRandomized(false);
      setEditQuestions([
        {
          question: "What is the primary advantage of immutable state management?",
          questionType: "SINGLE_CHOICE",
          options: [
            "Reduces memory consumption to zero",
            "Enables predictable state transitions and easy time-travel debugging",
            "Eliminates the need for JavaScript engines",
            "Forces components to mutate global variables",
          ],
          correctAnswer: "Enables predictable state transitions and easy time-travel debugging",
          points: 10,
          negativePoints: 0,
          orderIndex: 0,
          explanation: "Immutability allows state change history tracking and pure reducer execution.",
        },
      ]);
    }
    setEditorActiveTab("settings");
    setShowEditorModal(true);
  };

  // Add a new question to the editor
  const handleAddQuestion = (type: QuestionType = "SINGLE_CHOICE") => {
    const newQ: QuestionItem = {
      question: "",
      questionType: type,
      options:
        type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE"
          ? ["Option A", "Option B", "Option C", "Option D"]
          : type === "TRUE_FALSE"
          ? ["True", "False"]
          : [],
      correctAnswer: type === "TRUE_FALSE" ? "True" : "",
      points: 10,
      negativePoints: 0,
      scoringMode: "ALL_OR_NOTHING",
      orderIndex: editQuestions.length,
      explanation: "",
    };
    setEditQuestions([...editQuestions, newQ]);
  };

  // Duplicate question
  const handleDuplicateQuestion = (index: number) => {
    const q = editQuestions[index];
    const clone: QuestionItem = {
      ...q,
      id: undefined,
      question: `${q.question} (Copy)`,
      orderIndex: editQuestions.length,
    };
    setEditQuestions([...editQuestions, clone]);
  };

  // Remove question
  const handleRemoveQuestion = (index: number) => {
    const updated = editQuestions.filter((_, i) => i !== index).map((q, idx) => ({ ...q, orderIndex: idx }));
    setEditQuestions(updated);
  };

  // Reorder questions
  const handleMoveQuestion = (index: number, direction: "UP" | "DOWN") => {
    if ((direction === "UP" && index === 0) || (direction === "DOWN" && index === editQuestions.length - 1)) {
      return;
    }
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const updated = [...editQuestions];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setEditQuestions(updated.map((q, idx) => ({ ...q, orderIndex: idx })));
  };

  // Save Assessment (Draft or Published)
  const handleSaveAssessment = async (publish: boolean = false) => {
    if (!editTitle.trim()) {
      setEditorError("Assessment title is required.");
      return;
    }
    if (editQuestions.length === 0) {
      setEditorError("Please add at least one question.");
      return;
    }

    setSavingAssessment(true);
    setEditorError(null);

    const payload = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      skills: editSkills,
      durationMinutes: editDuration,
      passingScore: editPassingScore,
      maxAttempts: editMaxAttempts,
      isRandomized: editIsRandomized,
      status: publish ? "PUBLISHED" : "DRAFT",
      questions: editQuestions.map((q, idx) => ({
        id: q.id,
        question: q.question,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: Number(q.points) || 10,
        negativePoints: Number(q.negativePoints) || 0,
        scoringMode: q.scoringMode || "ALL_OR_NOTHING",
        orderIndex: idx,
        explanation: q.explanation,
      })),
    };

    try {
      const url = editingAssessmentId
        ? `/api/employer/assessments/${editingAssessmentId}`
        : "/api/employer/assessments";
      const method = editingAssessmentId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const d = await res.json();
      if (!res.ok) {
        throw new Error(d.error || "Failed to save assessment.");
      }

      setShowEditorModal(false);
      await fetchAssessments();
    } catch (err: any) {
      setEditorError(err.message || "An error occurred while saving.");
    } finally {
      setSavingAssessment(false);
    }
  };

  // Duplicate assessment
  const handleDuplicateAssessment = async (id: string) => {
    try {
      const res = await fetch(`/api/employer/assessments/${id}/duplicate`, {
        method: "POST",
      });
      const d = await res.json();
      if (res.ok) {
        await fetchAssessments();
      } else {
        alert(d.error || "Failed to duplicate assessment.");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Archive assessment
  const handleArchiveAssessment = async (id: string) => {
    if (!confirm("Are you sure you want to delete or archive this assessment?")) return;
    try {
      const res = await fetch(`/api/employer/assessments/${id}`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (res.ok) {
        await fetchAssessments();
      } else {
        alert(d.error || "Failed to delete/archive assessment.");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Assign Assessment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment || !selectedAppId) return;

    setAssigning(true);
    setAssignError(null);
    try {
      const res = await fetch("/api/employer/assessments/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: selectedAssessment.id,
          applicationId: selectedAppId,
          daysValid: assignDaysValid,
        }),
      });

      const d = await res.json();
      if (!res.ok) {
        throw new Error(d.error || "Failed to assign assessment.");
      }

      setAssignedLink(d.secureUrl);
      fetchAssessments();
    } catch (e: any) {
      setAssignError(e.message);
    } finally {
      setAssigning(false);
    }
  };

  // CSV Import handler
  const handleCsvImport = async () => {
    if (!selectedAssessment || !csvText.trim()) return;
    setCsvImporting(true);
    setCsvImportResult(null);
    try {
      const res = await fetch(`/api/employer/assessments/${selectedAssessment.id}/import-csv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvContent: csvText }),
      });
      const d = await res.json();
      setCsvImportResult(d);
      if (res.ok) {
        fetchAssessments();
      }
    } catch (e: any) {
      setCsvImportResult({ error: e.message });
    } finally {
      setCsvImporting(false);
    }
  };

  // Preview runner
  const handleOpenPreview = (assessment: any) => {
    setSelectedAssessment(assessment);
    setPreviewAnswers({});
    setPreviewSubmitted(false);
    setPreviewScore(null);
    setShowPreviewModal(true);
  };

  const handlePreviewSubmit = () => {
    if (!selectedAssessment) return;
    let earned = 0;
    let total = 0;

    selectedAssessment.questions?.forEach((q: any) => {
      total += q.points || 10;
      const ans = previewAnswers[q.id];

      if (q.questionType === "SINGLE_CHOICE" || q.questionType === "TRUE_FALSE") {
        if (ans && q.correctAnswer && ans.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          earned += q.points || 10;
        } else if (ans && q.negativePoints > 0) {
          earned = Math.max(0, earned - q.negativePoints);
        }
      } else if (q.questionType === "MULTIPLE_CHOICE") {
        const correctSet = new Set((q.correctAnswer || "").split(",").map((s: string) => s.trim().toLowerCase()));
        const userSet = new Set(Array.isArray(ans) ? ans.map((s: string) => s.trim().toLowerCase()) : []);
        let correctCount = 0;
        let wrongCount = 0;
        userSet.forEach((item) => {
          if (correctSet.has(item)) correctCount++;
          else wrongCount++;
        });
        const totalCorrect = correctSet.size || 1;
        const totalWrong = Math.max(1, (q.options || []).length - totalCorrect);
        const p = (q.points || 10) * ((correctCount / totalCorrect) - (wrongCount / totalWrong));
        earned += Math.max(0, p);
      } else {
        // Text / Code simulated full
        earned += q.points || 10;
      }
    });

    const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
    setPreviewScore({ earned, total, pct });
    setPreviewSubmitted(true);
  };

  // Open Grading Modal
  const handleOpenReview = (item: any) => {
    setSelectedReviewItem(item);
    const initial: Record<string, { marks: number; notes: string }> = {};
    const answers = item.answers || {};
    item.questionsSnapshot?.forEach((q: any) => {
      const qAns = answers[q.id] || {};
      initial[q.id] = {
        marks: qAns.marksAwarded !== undefined ? qAns.marksAwarded : 0,
        notes: qAns.feedback || "",
      };
    });
    setManualGrades(initial);
    setShowReviewModal(true);
  };

  // Submit manual grade
  const handleSubmitGrade = async () => {
    if (!selectedReviewItem) return;
    setSubmittingGrade(true);
    try {
      const questionGrades = Object.entries(manualGrades).map(([qId, data]) => ({
        questionId: qId,
        marksAwarded: Number(data.marks) || 0,
        feedback: data.notes,
      }));

      const res = await fetch(`/api/employer/assessments/reviews/${selectedReviewItem.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionGrades }),
      });

      const d = await res.json();
      if (!res.ok) {
        throw new Error(d.error || "Failed to submit grading.");
      }

      setShowReviewModal(false);
      fetchReviews();
      fetchAssessments();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 mb-2">
            <Award size={13} className="text-blue-600" />
            Skills & Screening Assessment Studio
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Assessments Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Build standardized tests, automate grading for choice questions, review code submissions, and bind results to Candidate 360.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEditor()}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              <Plus size={14} /> Create Assessment
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("assessments")}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "assessments"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Award size={14} />
          <span>Assessments ({assessments.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("reviews");
            fetchReviews();
          }}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "reviews"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <CheckSquare size={14} />
          <span>Review Queue ({reviews.filter((r) => r.status === "PENDING_REVIEW").length})</span>
        </button>
      </div>

      {activeTab === "assessments" ? (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-blue-600"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      statusFilter === st ? "bg-white text-blue-700 shadow-xs font-bold" : "hover:text-slate-900"
                    }`}
                  >
                    {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing {filteredAssessments.length} assessment{filteredAssessments.length === 1 ? "" : "s"}
            </div>
          </div>

          {loading ? (
            <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: Assessments List */}
              <div className="lg:col-span-5 space-y-3">
                {filteredAssessments.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
                    <Award size={32} className="mx-auto text-slate-300" />
                    <h3 className="font-bold text-sm text-slate-800">No assessments found</h3>
                    <p className="text-xs text-slate-500">
                      {statusFilter !== "ALL"
                        ? `No assessments with status ${statusFilter}.`
                        : "Create your first assessment to begin screening candidates."}
                    </p>
                    {canEdit && (
                      <button
                        onClick={() => handleOpenEditor()}
                        className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition inline-flex items-center gap-1"
                      >
                        <Plus size={12} /> Create Assessment
                      </button>
                    )}
                  </div>
                ) : (
                  filteredAssessments.map((ass) => {
                    const isSelected = selectedAssessment?.id === ass.id;
                    return (
                      <div
                        key={ass.id}
                        onClick={() => setSelectedAssessment(ass)}
                        className={`cursor-pointer rounded-2xl border p-4 transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 line-clamp-1">{ass.title}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              ass.status === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-800"
                                : ass.status === "DRAFT"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {ass.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {ass.description || "Automated skills screening test."}
                        </p>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          <span>
                            {ass.questions?.length || 0} questions • {ass.durationMinutes}m • Pass {ass.passingScore}%
                          </span>
                          <span className="font-semibold text-blue-700">
                            {ass.assignments?.length || 0} candidate{ass.assignments?.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* RIGHT: Selected Assessment Details & Candidate Attempts */}
              <div className="lg:col-span-7 space-y-6">
                {selectedAssessment ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-lg font-bold text-slate-900">{selectedAssessment.title}</h2>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              selectedAssessment.status === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-800"
                                : selectedAssessment.status === "DRAFT"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {selectedAssessment.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {selectedAssessment.questions?.length || 0} Questions • {selectedAssessment.durationMinutes}{" "}
                          Minutes • Pass Mark {selectedAssessment.passingScore}% • Max Attempts:{" "}
                          {selectedAssessment.maxAttempts || 1}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleOpenPreview(selectedAssessment)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                        >
                          <Eye size={13} /> Preview
                        </button>

                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleOpenEditor(selectedAssessment)}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                            >
                              <Edit3 size={13} /> Edit
                            </button>

                            <button
                              onClick={() => handleDuplicateAssessment(selectedAssessment.id)}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                              title="Clone assessment"
                            >
                              <Copy size={13} />
                            </button>

                            <button
                              onClick={() => setShowCsvModal(true)}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                              title="Import Questions via CSV"
                            >
                              <FileSpreadsheet size={13} /> CSV
                            </button>

                            <button
                              onClick={() => handleArchiveAssessment(selectedAssessment.id)}
                              className="rounded-xl border border-rose-200 text-rose-600 px-3 py-1.5 text-xs font-bold hover:bg-rose-50 transition flex items-center gap-1"
                              title="Delete or Archive"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}

                        {canEdit && selectedAssessment.status === "PUBLISHED" && (
                          <button
                            onClick={() => {
                              setShowAssignModal(true);
                              setAssignedLink(null);
                              setAssignError(null);
                            }}
                            className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-1.5"
                          >
                            <Send size={13} /> Assign
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Skills Covered */}
                    {selectedAssessment.skills?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400 mr-1">Skills:</span>
                        {selectedAssessment.skills.map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Candidate Assignments Table */}
                    <div>
                      <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Candidate Submissions ({selectedAssessment.assignments?.length || 0})
                      </h3>

                      {selectedAssessment.assignments?.length > 0 ? (
                        <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                                <th className="py-2.5 px-3">Candidate</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-center">Score</th>
                                <th className="py-2.5 px-3 text-right">Result</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {selectedAssessment.assignments.map((asg: any) => (
                                <tr key={asg.id} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-slate-900">
                                      {asg.application?.candidateName || asg.candidateEmail}
                                    </div>
                                    <div className="text-[10px] text-slate-400">{asg.candidateEmail}</div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                        asg.status === "COMPLETED"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : asg.status === "PENDING_REVIEW"
                                          ? "bg-amber-100 text-amber-800"
                                          : asg.status === "IN_PROGRESS"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-slate-100 text-slate-700"
                                      }`}
                                    >
                                      {asg.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold">
                                    {asg.score !== null ? `${asg.score}%` : "—"}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {asg.passed === true ? (
                                      <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                                        Passed
                                      </span>
                                    ) : asg.passed === false ? (
                                      <span className="rounded-full bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-bold">
                                        Below Threshold
                                      </span>
                                    ) : asg.status === "PENDING_REVIEW" ? (
                                      canEdit ? (
                                        <button
                                          onClick={() => handleOpenReview(asg)}
                                          className="text-amber-700 font-bold text-[10px] underline hover:text-amber-800"
                                        >
                                          Grade Text/Code
                                        </button>
                                      ) : (
                                        <span className="text-amber-600 text-[10px] font-bold">Needs Review</span>
                                      )
                                    ) : (
                                      <span className="text-slate-400 text-[10px]">Awaiting Test</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center text-xs text-slate-400">
                          No candidate assignments created yet for this assessment.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
                    Select an assessment on the left to view details and candidate results.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* REVIEWS QUEUE TAB */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Candidate Manual Review Queue</h2>
              <p className="text-xs text-slate-500">
                Assessments containing short answer, long text, or coding questions waiting for recruiter evaluation.
              </p>
            </div>
            <button
              onClick={fetchReviews}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw size={12} /> Refresh
            </button>
          </div>

          {reviewsLoading ? (
            <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ) : reviews.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-800">Review Queue Empty</h3>
              <p className="text-xs text-slate-500">All submitted candidate assessments have been graded.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900">
                        {rev.application?.candidateName || rev.candidateEmail}
                      </span>
                      <p className="text-xs text-slate-500">{rev.assessment?.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Submitted {rev.submittedAt ? new Date(rev.submittedAt).toLocaleString() : "Recently"}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rev.status === "PENDING_REVIEW"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {rev.status === "PENDING_REVIEW" ? "Needs Grading" : "Graded"}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600">
                    <div>
                      Job Application: <strong>{rev.application?.job?.title || "Direct Assignment"}</strong>
                    </div>
                    <div>
                      Auto-scored base score: <strong>{rev.score !== null ? `${rev.score}%` : "Pending"}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {canEdit ? (
                      <button
                        onClick={() => handleOpenReview(rev)}
                        className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                      >
                        {rev.status === "PENDING_REVIEW" ? "Open Grading Rubric" : "View Feedback"}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Read-only view</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ASSESSMENT BUILDER / EDITOR MODAL */}
      {/* ========================================================================= */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-display text-base font-black text-slate-900">
                  {editingAssessmentId ? "Edit Assessment" : "Create New Assessment"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure settings, marks, negative marking, explanations, and question structure.
                </p>
              </div>
              <button
                onClick={() => setShowEditorModal(false)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="px-6 border-b border-slate-100 flex items-center gap-4 bg-white">
              <button
                onClick={() => setEditorActiveTab("settings")}
                className={`py-3 text-xs font-bold border-b-2 transition ${
                  editorActiveTab === "settings"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                1. General Settings
              </button>
              <button
                onClick={() => setEditorActiveTab("questions")}
                className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                  editorActiveTab === "questions"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>2. Questions Builder</span>
                <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                  {editQuestions.length}
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {editorError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{editorError}</span>
                </div>
              )}

              {editorActiveTab === "settings" ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assessment Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer (React & TypeScript) Screening"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Explain the scope and purpose of this technical evaluation..."
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Skills (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="React, TypeScript, CSS Architecture, Next.js"
                      value={editSkills}
                      onChange={(e) => setEditSkills(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={editDuration}
                        onChange={(e) => setEditDuration(parseInt(e.target.value, 10) || 30)}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Passing Score (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={editPassingScore}
                        onChange={(e) => setEditPassingScore(parseInt(e.target.value, 10) || 70)}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Max Attempts Allowed</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editMaxAttempts}
                        onChange={(e) => setEditMaxAttempts(parseInt(e.target.value, 10) || 1)}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-blue-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsRandomized}
                        onChange={(e) => setEditIsRandomized(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-700">Randomize question order per candidate</span>
                    </label>
                  </div>
                </div>
              ) : (
                /* QUESTIONS TAB */
                <div className="space-y-6 text-xs">
                  {/* Action row to add questions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-700">Add Question by Type:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddQuestion("SINGLE_CHOICE")}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition"
                      >
                        + Single Choice
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuestion("MULTIPLE_CHOICE")}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition"
                      >
                        + Multiple Choice
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuestion("TRUE_FALSE")}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition"
                      >
                        + True / False
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuestion("SHORT_TEXT")}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition"
                      >
                        + Short Text
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuestion("LONG_TEXT")}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition"
                      >
                        + Long Text
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuestion("CODE")}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition"
                      >
                        + Code Review
                      </button>
                    </div>
                  </div>

                  {/* Questions List */}
                  {editQuestions.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                      No questions added yet. Click one of the buttons above to add a question.
                    </div>
                  ) : (
                    editQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs relative"
                      >
                        {/* Question Card Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">
                              {idx + 1}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              {q.questionType.replace("_", " ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(idx, "UP")}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(idx, "DOWN")}
                              disabled={idx === editQuestions.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestion(idx)}
                              className="p-1 text-slate-400 hover:text-blue-600"
                              title="Duplicate Question"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Delete Question"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Question Prompt */}
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Question Prompt *</label>
                          <textarea
                            rows={2}
                            value={q.question}
                            onChange={(e) => {
                              const updated = [...editQuestions];
                              updated[idx].question = e.target.value;
                              setEditQuestions(updated);
                            }}
                            placeholder="Enter question text here..."
                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-blue-600"
                          />
                        </div>

                        {/* Type-Specific Answer Setup */}
                        {(q.questionType === "SINGLE_CHOICE" || q.questionType === "MULTIPLE_CHOICE") && (
                          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            <label className="block font-bold text-slate-700">
                              Options (Check correct answer{q.questionType === "MULTIPLE_CHOICE" ? "s" : ""})
                            </label>
                            {q.questionType === "MULTIPLE_CHOICE" && (
                              <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-2.5 text-[11px] text-blue-900 space-y-2">
                                <div className="flex items-center gap-4">
                                  <span className="font-bold text-slate-800">Scoring Mode:</span>
                                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                                    <input
                                      type="radio"
                                      name={`scoring_mode_${idx}`}
                                      value="ALL_OR_NOTHING"
                                      checked={q.scoringMode !== "PARTIAL"}
                                      onChange={() => {
                                        const updated = [...editQuestions];
                                        updated[idx].scoringMode = "ALL_OR_NOTHING";
                                        setEditQuestions(updated);
                                      }}
                                      className="text-blue-600"
                                    />
                                    <span>All or Nothing (Default)</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                                    <input
                                      type="radio"
                                      name={`scoring_mode_${idx}`}
                                      value="PARTIAL"
                                      checked={q.scoringMode === "PARTIAL"}
                                      onChange={() => {
                                        const updated = [...editQuestions];
                                        updated[idx].scoringMode = "PARTIAL";
                                        setEditQuestions(updated);
                                      }}
                                      className="text-blue-600"
                                    />
                                    <span>Partial Credit</span>
                                  </label>
                                </div>
                                <p className="text-[10px] text-blue-800">
                                  {q.scoringMode === "PARTIAL"
                                    ? "Partial Credit: Points are awarded per correct option. When Negative Marks is 0, selecting wrong choices proportionally deducts points so ticking all options awards 0. When Negative Marks > 0, wrong options deduct that penalty."
                                    : "All or Nothing: Full marks awarded only if all correct choices and zero incorrect choices are selected. Ticking every option awards 0 marks."}
                                </p>
                              </div>
                            )}
                            {q.options.map((opt, optIdx) => {
                              const isChecked =
                                q.questionType === "SINGLE_CHOICE"
                                  ? q.correctAnswer === opt
                                  : (q.correctAnswer || "")
                                      .split(",")
                                      .map((s) => s.trim())
                                      .includes(opt);

                              return (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type={q.questionType === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                                    name={`q_correct_${idx}`}
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const updated = [...editQuestions];
                                      if (q.questionType === "SINGLE_CHOICE") {
                                        updated[idx].correctAnswer = opt;
                                      } else {
                                        const current = (updated[idx].correctAnswer || "")
                                          .split(",")
                                          .map((s) => s.trim())
                                          .filter(Boolean);
                                        if (e.target.checked) {
                                          current.push(opt);
                                        } else {
                                          const pos = current.indexOf(opt);
                                          if (pos > -1) current.splice(pos, 1);
                                        }
                                        updated[idx].correctAnswer = current.join(", ");
                                      }
                                      setEditQuestions(updated);
                                    }}
                                    className="rounded text-blue-600"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const updated = [...editQuestions];
                                      const oldVal = updated[idx].options[optIdx];
                                      updated[idx].options[optIdx] = e.target.value;
                                      if (updated[idx].correctAnswer === oldVal) {
                                        updated[idx].correctAnswer = e.target.value;
                                      }
                                      setEditQuestions(updated);
                                    }}
                                    className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...editQuestions];
                                      updated[idx].options.splice(optIdx, 1);
                                      setEditQuestions(updated);
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-1"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...editQuestions];
                                updated[idx].options.push(`Option ${String.fromCharCode(65 + q.options.length)}`);
                                setEditQuestions(updated);
                              }}
                              className="text-[11px] font-bold text-blue-600 hover:underline pt-1 block"
                            >
                              + Add Option
                            </button>
                          </div>
                        )}

                        {q.questionType === "TRUE_FALSE" && (
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                            <label className="block font-bold text-slate-700">Select Correct Answer:</label>
                            <div className="flex items-center gap-6">
                              {["True", "False"].map((opt) => (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold">
                                  <input
                                    type="radio"
                                    name={`tf_correct_${idx}`}
                                    checked={q.correctAnswer === opt}
                                    onChange={() => {
                                      const updated = [...editQuestions];
                                      updated[idx].correctAnswer = opt;
                                      setEditQuestions(updated);
                                    }}
                                    className="text-blue-600"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {q.questionType === "SHORT_TEXT" && (
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                            <label className="block font-bold text-slate-700">
                              Expected Keyword / Exact Match Value *
                            </label>
                            <input
                              type="text"
                              value={q.correctAnswer || ""}
                              onChange={(e) => {
                                const updated = [...editQuestions];
                                updated[idx].correctAnswer = e.target.value;
                                setEditQuestions(updated);
                              }}
                              placeholder="e.g. O(log n) or shallow comparison (Exact/Keyword match only, no regex)"
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white"
                            />
                            <p className="text-[10px] text-slate-400">
                              Candidate response will be matched case-insensitively against keywords.
                            </p>
                          </div>
                        )}

                        {(q.questionType === "LONG_TEXT" || q.questionType === "CODE") && (
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                            <label className="block font-bold text-slate-700">
                              Reviewer Rubric & Expected Answer Guide
                            </label>
                            <textarea
                              rows={2}
                              value={q.correctAnswer || ""}
                              onChange={(e) => {
                                const updated = [...editQuestions];
                                updated[idx].correctAnswer = e.target.value;
                                setEditQuestions(updated);
                              }}
                              placeholder="Key concepts or code structure the reviewer should verify during manual grading..."
                              className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white"
                            />
                          </div>
                        )}

                        {/* Marks, Negative Marks, and Recruiter Explanation */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Marks Awarded</label>
                            <input
                              type="number"
                              min="1"
                              value={q.points}
                              onChange={(e) => {
                                const updated = [...editQuestions];
                                updated[idx].points = parseInt(e.target.value, 10) || 10;
                                setEditQuestions(updated);
                              }}
                              className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Negative Marking (Penalty)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={q.negativePoints}
                              onChange={(e) => {
                                const updated = [...editQuestions];
                                updated[idx].negativePoints = parseFloat(e.target.value) || 0;
                                setEditQuestions(updated);
                              }}
                              className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Explanation (Recruiter Only)
                            </label>
                            <input
                              type="text"
                              value={q.explanation || ""}
                              onChange={(e) => {
                                const updated = [...editQuestions];
                                updated[idx].explanation = e.target.value;
                                setEditQuestions(updated);
                              }}
                              placeholder="Confidential explanation..."
                              className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={savingAssessment}
                  onClick={() => handleSaveAssessment(false)}
                  className="rounded-xl border border-blue-600 text-blue-600 px-4 py-2 text-xs font-bold hover:bg-blue-50 transition disabled:opacity-50"
                >
                  {savingAssessment ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  type="button"
                  disabled={savingAssessment}
                  onClick={() => handleSaveAssessment(true)}
                  className="rounded-xl bg-blue-600 text-white px-5 py-2 text-xs font-bold hover:bg-blue-700 transition shadow-xs disabled:opacity-50"
                >
                  {savingAssessment ? "Publishing..." : "Publish Assessment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ASSIGN MODAL */}
      {/* ========================================================================= */}
      {showAssignModal && selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-black text-slate-900">Assign Assessment</h3>
                <p className="text-xs text-slate-500">{selectedAssessment.title}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {assignError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{assignError}</span>
              </div>
            )}

            {!assignedLink ? (
              <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Candidate Application *</label>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-blue-600"
                  >
                    <option value="">Select Candidate...</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.candidateName} ({app.candidateEmail}) - {app.job?.title || "Application"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={assignDaysValid}
                    onChange={(e) => setAssignDaysValid(parseInt(e.target.value, 10) || 7)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-blue-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning || !selectedAppId}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {assigning ? "Assigning..." : "Assign & Generate Link"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Assessment assigned! Notification and outbox email queued.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Candidate Single-Use Test Link:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={assignedLink}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50 select-all"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(assignedLink);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="rounded-xl bg-slate-900 text-white px-3 py-2.5 font-bold hover:bg-slate-800 transition flex items-center gap-1"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="rounded-xl bg-blue-600 text-white px-5 py-2 font-bold hover:bg-blue-700 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CSV IMPORT MODAL */}
      {/* ========================================================================= */}
      {showCsvModal && selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-black text-slate-900">Bulk Import Questions (CSV)</h3>
                <p className="text-slate-500">Add up to 200 questions to {selectedAssessment.title}</p>
              </div>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Required CSV Header Format:</span>
              <code className="text-[11px] text-blue-700 block font-mono bg-white p-1.5 rounded border border-slate-200 overflow-x-auto">
                question,questionType,options,correctAnswer,points,negativePoints,explanation
              </code>
              <p className="text-[10px] text-slate-400">
                Options should be separated by pipes (`|`), e.g. `Option A|Option B|Option C`.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Paste CSV Content:</label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="question,questionType,options,correctAnswer,points,negativePoints,explanation&#10;What is 2+2?,SINGLE_CHOICE,2|3|4|5,4,10,0,Basic arithmetic"
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:outline-blue-600"
              />
            </div>

            {csvImportResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  csvImportResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {csvImportResult.success ? (
                  <span>
                    Successfully imported {csvImportResult.importedCount} questions! (Errors:{" "}
                    {csvImportResult.errors?.length || 0})
                  </span>
                ) : (
                  <span>{csvImportResult.error || "Failed to import CSV."}</span>
                )}
                {csvImportResult.errors?.length > 0 && (
                  <ul className="mt-2 list-disc list-inside space-y-0.5 text-[10px]">
                    {csvImportResult.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCsvModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                disabled={csvImporting || !csvText.trim()}
                onClick={handleCsvImport}
                className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {csvImporting ? "Importing..." : "Process CSV"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PREVIEW MODAL */}
      {/* ========================================================================= */}
      {showPreviewModal && selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
                  Recruiter Test Preview
                </span>
                <h3 className="font-bold text-slate-900">{selectedAssessment.title}</h3>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {previewSubmitted && previewScore && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                  <h4 className="font-bold text-sm text-blue-900">Simulated Score Calculation</h4>
                  <div className="text-xs text-blue-800">
                    Earned: <strong>{previewScore.earned}</strong> / {previewScore.total} points (
                    <strong>{previewScore.pct}%</strong>) • Pass Mark: {selectedAssessment.passingScore}% • Result:{" "}
                    <strong>{previewScore.pct >= selectedAssessment.passingScore ? "PASSED" : "FAILED"}</strong>
                  </div>
                </div>
              )}

              {selectedAssessment.questions?.map((q: any, idx: number) => (
                <div key={q.id || idx} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Question {idx + 1} ({q.points || 10} pts)
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{q.questionType}</span>
                  </div>

                  <p className="text-slate-800 font-medium">{q.question}</p>

                  {/* Options */}
                  {(q.questionType === "SINGLE_CHOICE" || q.questionType === "TRUE_FALSE") && (
                    <div className="space-y-1.5 pt-1">
                      {q.options?.map((opt: string, optIdx: number) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                            previewAnswers[q.id] === opt
                              ? "border-blue-600 bg-blue-50/50 font-bold text-blue-900"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`preview_${q.id}`}
                            checked={previewAnswers[q.id] === opt}
                            onChange={() => setPreviewAnswers({ ...previewAnswers, [q.id]: opt })}
                            className="text-blue-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.questionType === "MULTIPLE_CHOICE" && (
                    <div className="space-y-1.5 pt-1">
                      {q.options?.map((opt: string, optIdx: number) => {
                        const current = previewAnswers[q.id] || [];
                        const isChecked = current.includes(opt);
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                              isChecked
                                ? "border-blue-600 bg-blue-50/50 font-bold text-blue-900"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...current, opt]
                                  : current.filter((x: string) => x !== opt);
                                setPreviewAnswers({ ...previewAnswers, [q.id]: next });
                              }}
                              className="rounded text-blue-600"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {q.questionType === "SHORT_TEXT" && (
                    <input
                      type="text"
                      placeholder="Candidate types short answer..."
                      value={previewAnswers[q.id] || ""}
                      onChange={(e) => setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                    />
                  )}

                  {(q.questionType === "LONG_TEXT" || q.questionType === "CODE") && (
                    <textarea
                      rows={3}
                      placeholder="Candidate enters code / response..."
                      value={previewAnswers[q.id] || ""}
                      onChange={(e) => setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono"
                    />
                  )}

                  {/* Recruiter view showing answer key and explanation */}
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div>
                      <span className="font-bold text-slate-700">Answer Key:</span> {q.correctAnswer || "Manual review"}
                    </div>
                    {q.explanation && (
                      <div>
                        <span className="font-bold text-slate-700">Recruiter Note:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
              >
                Close Preview
              </button>
              <button
                onClick={handlePreviewSubmit}
                className="rounded-xl bg-blue-600 text-white px-5 py-2 font-bold hover:bg-blue-700 transition"
              >
                Simulate Candidate Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MANUAL GRADING & REVIEW MODAL */}
      {/* ========================================================================= */}
      {showReviewModal && selectedReviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Grade Assessment: {selectedReviewItem.application?.candidateName || selectedReviewItem.candidateEmail}
                </h3>
                <p className="text-slate-500">
                  {selectedReviewItem.assessment?.title} • Passing Score: {selectedReviewItem.assessment?.passingScore}%
                </p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {selectedReviewItem.questionsSnapshot?.map((q: any, idx: number) => {
                const ans = (selectedReviewItem.answers || {})[q.id] || {};
                const candidateResponse = ans.value || ans.answer || "No answer provided";
                const isAutoScored =
                  q.questionType === "SINGLE_CHOICE" ||
                  q.questionType === "MULTIPLE_CHOICE" ||
                  q.questionType === "TRUE_FALSE";

                return (
                  <div key={q.id || idx} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        Question {idx + 1}: {q.question}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {q.questionType} • Max {q.points || 10} pts
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Candidate Answer:
                      </span>
                      <div className="text-slate-900 font-semibold font-mono whitespace-pre-wrap">
                        {Array.isArray(candidateResponse) ? candidateResponse.join(", ") : String(candidateResponse)}
                      </div>
                    </div>

                    {q.correctAnswer && (
                      <div className="text-[11px] text-slate-500">
                        <strong>Expected Answer / Rubric:</strong> {q.correctAnswer}
                      </div>
                    )}

                    {/* Grading Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Marks Awarded (Max {q.points || 10})</label>
                        <input
                          type="number"
                          min="0"
                          max={q.points || 10}
                          value={manualGrades[q.id]?.marks ?? 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setManualGrades({
                              ...manualGrades,
                              [q.id]: {
                                marks: Math.min(q.points || 10, Math.max(0, val)),
                                notes: manualGrades[q.id]?.notes || "",
                              },
                            });
                          }}
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Feedback / Notes</label>
                        <input
                          type="text"
                          value={manualGrades[q.id]?.notes || ""}
                          onChange={(e) => {
                            setManualGrades({
                              ...manualGrades,
                              [q.id]: {
                                marks: manualGrades[q.id]?.marks || 0,
                                notes: e.target.value,
                              },
                            });
                          }}
                          placeholder="Optional feedback for this question..."
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => setShowReviewModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                disabled={submittingGrade}
                onClick={handleSubmitGrade}
                className="rounded-xl bg-emerald-600 text-white px-5 py-2 font-bold hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
              >
                {submittingGrade ? "Finalizing..." : "Submit Final Grade & Complete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
