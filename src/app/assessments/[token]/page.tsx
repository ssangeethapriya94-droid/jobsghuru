"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Send,
  Save,
  RotateCcw,
  Check,
  FileText,
  Code,
  CheckSquare,
  AlertTriangle,
  Lock,
} from "lucide-react";

export default function CandidateAssessmentPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;

  // Lifecycle states: "LOADING" | "INSTRUCTIONS" | "RUNNING" | "EXPIRED" | "PENDING_REVIEW" | "COMPLETED" | "ERROR"
  const [screenState, setScreenState] = useState<string>("LOADING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Assessment & Candidate metadata
  const [assessment, setAssessment] = useState<any | null>(null);
  const [candidateEmail, setCandidateEmail] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("CareerBridge Employer");
  const [deadlineAt, setDeadlineAt] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);

  // In-progress runner state
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeftSec, setTimeLeftSec] = useState<number | null>(null);
  const [autosaving, setAutosaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Autosave timer ref
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Assessment Fetch
  useEffect(() => {
    fetchAssessmentDetails();
  }, [token]);

  const fetchAssessmentDetails = async () => {
    setScreenState("LOADING");
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/candidate/assessments/${encodeURIComponent(token)}`);
      const d = await res.json();

      if (!res.ok) {
        throw new Error(d.error || "Failed to load assessment. The link may be invalid or expired.");
      }

      setAssessment(d.assessment);
      setCandidateEmail(d.candidateEmail || "");
      setCompanyName(d.companyName || "Employer");

      if (d.status === "COMPLETED") {
        setScore(d.score);
        setPassed(d.passed);
        setScreenState("COMPLETED");
      } else if (d.status === "PENDING_REVIEW") {
        setScreenState("PENDING_REVIEW");
      } else if (d.status === "EXPIRED") {
        setScreenState("EXPIRED");
      } else if (d.status === "IN_PROGRESS" && d.deadlineAt) {
        // Resuming after refresh!
        setDeadlineAt(d.deadlineAt);
        setQuestions(d.assessment?.questions || []);
        if (d.answers) {
          const loadedAns: Record<string, any> = {};
          Object.entries(d.answers).forEach(([qId, val]: [string, any]) => {
            loadedAns[qId] = typeof val === "object" && val !== null ? val.value : val;
          });
          setAnswers(loadedAns);
        }
        setScreenState("RUNNING");
      } else {
        // Not started yet
        setScreenState("INSTRUCTIONS");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setScreenState("ERROR");
    }
  };

  // Start Assessment Handler
  const handleStartAssessment = async () => {
    try {
      const res = await fetch(`/api/candidate/assessments/${encodeURIComponent(token)}/start`, {
        method: "POST",
      });
      const d = await res.json();

      if (!res.ok) {
        throw new Error(d.error || "Failed to start assessment.");
      }

      setDeadlineAt(d.deadlineAt);
      setQuestions(d.assessment?.questions || []);
      if (d.answers) {
        const loadedAns: Record<string, any> = {};
        Object.entries(d.answers).forEach(([qId, val]: [string, any]) => {
          loadedAns[qId] = typeof val === "object" && val !== null ? val.value : val;
        });
        setAnswers(loadedAns);
      }
      setScreenState("RUNNING");
    } catch (err: any) {
      alert(err.message || "Could not start assessment.");
    }
  };

  // Live Timer Countdown Hook
  useEffect(() => {
    if (screenState !== "RUNNING" || !deadlineAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const end = new Date(deadlineAt).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeftSec(diff);

      if (diff <= 0) {
        // Automatically trigger submit or lock
        handleAutoSubmitOnDeadline();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [screenState, deadlineAt]);

  // Debounced Autosave
  const triggerAutosave = useCallback(
    (newAnswers: Record<string, any>) => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }

      autosaveTimeoutRef.current = setTimeout(async () => {
        setAutosaving(true);
        try {
          await fetch(`/api/candidate/assessments/${encodeURIComponent(token)}/autosave`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: newAnswers }),
          });
          setLastSavedTime(new Date());
        } catch {
          // ignore transient autosave failures
        } finally {
          setAutosaving(false);
        }
      }, 800);
    },
    [token]
  );

  const handleUpdateAnswer = (questionId: string, value: any) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    triggerAutosave(updated);
  };

  // Submit assessment handler
  const handleSubmitAssessment = async () => {
    if (
      !confirm(
        "Are you ready to submit your assessment? Once submitted, your answers cannot be modified."
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/candidate/assessments/${encodeURIComponent(token)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const d = await res.json();
      if (!res.ok) {
        throw new Error(d.error || "Failed to submit assessment.");
      }

      if (d.status === "PENDING_REVIEW") {
        setScreenState("PENDING_REVIEW");
      } else {
        setScore(d.score);
        setPassed(d.passed);
        setScreenState("COMPLETED");
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit on time expiry
  const handleAutoSubmitOnDeadline = async () => {
    try {
      const res = await fetch(`/api/candidate/assessments/${encodeURIComponent(token)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const d = await res.json();
      if (d.status === "PENDING_REVIEW") {
        setScreenState("PENDING_REVIEW");
      } else {
        setScore(d.score);
        setPassed(d.passed);
        setScreenState("COMPLETED");
      }
    } catch {
      setScreenState("EXPIRED");
    }
  };

  // Format timer mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ===========================================================================
  // SCREEN: LOADING
  // ===========================================================================
  if (screenState === "LOADING") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-sm w-full space-y-3">
          <div className="h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-bold text-slate-800">Verifying Assessment Token</h2>
          <p className="text-xs text-slate-500">Connecting to secure evaluation session...</p>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: ERROR
  // ===========================================================================
  if (screenState === "ERROR") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900">Assessment Link Unavailable</h2>
          <p className="text-xs text-slate-600">{errorMessage || "This assessment token could not be verified."}</p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: EXPIRED
  // ===========================================================================
  if (screenState === "EXPIRED") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-amber-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock size={24} />
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900">Assessment Time Window Expired</h2>
          <p className="text-xs text-slate-600">
            The deadline for this assessment has passed. If you faced technical issues, please contact{" "}
            <strong>{companyName}</strong>.
          </p>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: PENDING REVIEW
  // ===========================================================================
  if (screenState === "PENDING_REVIEW") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-blue-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Clock size={24} />
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900">Assessment Submitted</h2>
          <p className="text-xs text-slate-600">
            Your responses have been securely recorded and submitted to <strong>{companyName}</strong>.
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700">
            This test includes short text or coding questions currently awaiting manual evaluation by the hiring team.
            You will be notified once grading is complete.
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: COMPLETED / FINAL RESULT
  // ===========================================================================
  if (screenState === "COMPLETED") {
    const isPassed = passed === true;
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
              isPassed ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
            }`}
          >
            {isPassed ? <CheckCircle2 size={32} /> : <FileText size={30} />}
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Assessment Completed</h2>
            <p className="text-xs text-slate-500 mt-1">
              Screening test submitted to <strong>{companyName}</strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Final Score</span>
            <div className="text-3xl font-black text-slate-900">
              {score !== null ? `${score}%` : "Recorded"}
            </div>
            {passed !== null && (
              <div className="pt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    isPassed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isPassed ? "Passed Threshold" : "Below Threshold"}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Thank you for completing the assessment. Your results have been bound to your Candidate 360 profile.
          </p>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: INSTRUCTIONS
  // ===========================================================================
  if (screenState === "INSTRUCTIONS") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 text-xs">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 mb-1">
                <Briefcase size={12} /> {companyName}
              </div>
              <h1 className="font-display text-xl font-black text-slate-900">{assessment?.title}</h1>
              <p className="text-slate-500 mt-0.5">{candidateEmail}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">DURATION</span>
              <span className="text-base font-black text-slate-800">{assessment?.durationMinutes || 30} mins</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">PASS SCORE</span>
              <span className="text-base font-black text-slate-800">{assessment?.passingScore || 70}%</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">ATTEMPTS</span>
              <span className="text-base font-black text-slate-800">{assessment?.maxAttempts || 1}</span>
            </div>
          </div>

          {/* Instructions checklist */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-800">Important Test Instructions:</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <Clock size={14} className="text-blue-600 mt-0.5 shrink-0" />
                <span>
                  The timer begins only when you click <strong>&ldquo;Start Assessment&rdquo;</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Save size={14} className="text-blue-600 mt-0.5 shrink-0" />
                <span>
                  Your answers are <strong>automatically saved</strong> as you type or select options.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <RotateCcw size={14} className="text-blue-600 mt-0.5 shrink-0" />
                <span>If you accidentally refresh the page, your progress and timer will continue seamlessly.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <span>
                  Ensure you click <strong>&ldquo;Submit Assessment&rdquo;</strong> before the timer expires.
                </span>
              </li>
            </ul>
          </div>

          {/* Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Encrypted token verified.</span>
            <button
              onClick={handleStartAssessment}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-xs hover:bg-blue-700 transition flex items-center gap-2 text-xs"
            >
              <span>Start Assessment</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN: RUNNING TEST RUNNER
  // ===========================================================================
  const currentQ = questions[currentIdx] || questions[0];
  const isLastQuestion = currentIdx === questions.length - 1;
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== "").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-sm font-bold text-slate-900 line-clamp-1">{assessment?.title}</h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>{companyName}</span>
              <span>•</span>
              <span>
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Autosave Status */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              {autosaving ? (
                <span className="flex items-center gap-1 text-blue-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-500">
                  <Check size={12} className="text-emerald-500" />
                  Saved
                </span>
              )}
            </div>

            {/* Countdown Timer */}
            {timeLeftSec !== null && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                  timeLeftSec <= 300
                    ? "bg-rose-100 text-rose-800 border border-rose-200 animate-pulse"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                <Clock size={13} />
                <span>{formatTime(timeLeftSec)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6 text-xs">
        {/* LEFT: Question Content */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Question {currentIdx + 1} ({currentQ?.points || 10} Points)
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {currentQ?.questionType?.replace("_", " ")}
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">{currentQ?.question}</h2>

            {/* SINGLE CHOICE / TRUE FALSE */}
            {(currentQ?.questionType === "SINGLE_CHOICE" || currentQ?.questionType === "TRUE_FALSE") && (
              <div className="space-y-2 pt-2">
                {currentQ.options?.map((opt: string, optIdx: number) => {
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 font-bold text-blue-900 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${currentQ.id}`}
                        checked={isSelected}
                        onChange={() => handleUpdateAnswer(currentQ.id, opt)}
                        className="text-blue-600"
                      />
                      <span className="text-xs">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* MULTIPLE CHOICE */}
            {currentQ?.questionType === "MULTIPLE_CHOICE" && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] text-slate-400 italic mb-1">Select all correct options that apply:</p>
                {currentQ.options?.map((opt: string, optIdx: number) => {
                  const currentSelected: string[] = Array.isArray(answers[currentQ.id])
                    ? answers[currentQ.id]
                    : [];
                  const isSelected = currentSelected.includes(opt);

                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 font-bold text-blue-900 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...currentSelected, opt]
                            : currentSelected.filter((x) => x !== opt);
                          handleUpdateAnswer(currentQ.id, updated);
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-xs">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* SHORT TEXT */}
            {currentQ?.questionType === "SHORT_TEXT" && (
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-slate-600">Your Answer:</label>
                <input
                  type="text"
                  placeholder="Type exact keyword / answer..."
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleUpdateAnswer(currentQ.id, e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs focus:outline-blue-600 bg-slate-50"
                />
              </div>
            )}

            {/* LONG TEXT */}
            {currentQ?.questionType === "LONG_TEXT" && (
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-slate-600">Detailed Response:</label>
                <textarea
                  rows={6}
                  placeholder="Write your answer clearly..."
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleUpdateAnswer(currentQ.id, e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs focus:outline-blue-600 bg-slate-50"
                />
              </div>
            )}

            {/* CODE */}
            {currentQ?.questionType === "CODE" && (
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Code size={13} className="text-blue-600" /> Code Implementation:
                </label>
                <textarea
                  rows={8}
                  placeholder="// Implement your solution here..."
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleUpdateAnswer(currentQ.id, e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs font-mono focus:outline-blue-600 bg-slate-900 text-emerald-400"
                />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Previous
            </button>

            {!isLastQuestion ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center gap-1"
              >
                Next <ArrowRight size={13} />
              </button>
            ) : (
              <button
                disabled={submitting}
                onClick={handleSubmitAssessment}
                className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send size={13} />
                <span>{submitting ? "Submitting..." : "Submit Assessment"}</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Question Palette Navigation */}
        <div className="w-full md:w-64 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs h-fit space-y-4">
          <div>
            <h3 className="font-bold text-slate-800">Question Palette</h3>
            <p className="text-[11px] text-slate-400">
              Answered {answeredCount} of {questions.length}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, idx) => {
              const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== "";
              const isCurrent = idx === currentIdx;

              return (
                <button
                  key={q.id || idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition ${
                    isCurrent
                      ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2"
                      : hasAnswer
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-black"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              disabled={submitting}
              onClick={handleSubmitAssessment}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send size={12} />
              <span>{submitting ? "Submitting..." : "Finish & Submit"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
