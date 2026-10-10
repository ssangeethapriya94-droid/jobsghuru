import {
  MessageCircleReply,
  ShieldCheck,
  ScanSearch,
  CheckCircle2,
  Sparkles,
  Lock,
  Award,
} from "lucide-react";

export default function PromisesSection() {
  const promises = [
    {
      icon: MessageCircleReply,
      title: "Guaranteed Recruiter Reply",
      badge: "Zero Ghosting",
      badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-200",
      gradient: "from-blue-600 to-indigo-600",
      accentBorder: "group-hover:border-blue-500 group-hover:shadow-blue-500/10",
      description:
        "Every employer commits to a verified response window. Silent listings are automatically paused so your resume is never swallowed into a black hole.",
      perk: "Live recruiter response rate badge on every job posting",
      stat: "⚡ Avg Response: < 48h",
    },
    {
      icon: ShieldCheck,
      title: "100% Verified Employers",
      badge: "Scam-Proof Guarantee",
      badgeStyle: "bg-blue-100 text-blue-800 border-blue-200",
      gradient: "from-emerald-600 to-teal-600",
      accentBorder: "group-hover:border-emerald-500 group-hover:shadow-emerald-500/10",
      description:
        "Recruiter corporate identities, domain credentials, MCA Incorporation records, and upfront salary ranges are audited before any role goes live.",
      perk: "Strict salary transparency & mandatory legal entity checks",
      stat: "🛡️ MCA & GST Audited",
    },
    {
      icon: ScanSearch,
      title: "Explainable Match Engine",
      badge: "Transparent AI Matching",
      badgeStyle: "bg-purple-100 text-purple-800 border-purple-200",
      gradient: "from-violet-600 to-indigo-600",
      accentBorder: "group-hover:border-purple-500 group-hover:shadow-purple-500/10",
      description:
        "Know exactly why you match and what specific skill gaps to bridge. Rule-based AI breakdown with actionable recommendations tailored to your profile.",
      perk: "Detailed skill fit, pay expectations, and work mode breakdown",
      stat: "🎯 98% Fit Accuracy",
    },
  ];

  return (
    <section className="container-x my-20 scroll-mt-24 font-sans relative">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute left-1/2 -top-12 -translate-x-1/2 h-72 w-3/4 max-w-4xl rounded-full bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-emerald-400/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto relative z-10 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 px-4 py-1.5 text-xs font-extrabold text-blue-800 shadow-2xs">
          <Sparkles size={14} className="text-blue-600 animate-pulse" />
          <span>THE JOBSGHURU TRANSPARENCY STANDARD</span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Hiring built on{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            honesty
          </span>
          , not silence.
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          We eliminated the ghosting and fake listings of standard job portals to give you a transparent, dignified, and guaranteed search experience.
        </p>
      </div>

      {/* 3 Prominent Cards */}
      <div className="mt-12 grid gap-6 md:grid-cols-3 relative z-10">
        {promises.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className={`group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-white to-slate-50/60 p-7 sm:p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${p.accentBorder}`}
            >
              <div>
                {/* Icon & Badge Row */}
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${p.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110 shrink-0`}
                  >
                    <Icon size={26} />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold shadow-2xs ${p.badgeStyle}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                    <span>{p.badge}</span>
                  </span>
                </div>

                {/* Title & Stat Pill */}
                <div className="mt-6 space-y-1.5">
                  <span className="inline-block text-[11px] font-extrabold uppercase font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {p.stat}
                  </span>
                  <h3 className="font-display text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                  {p.description}
                </p>
              </div>

              {/* Verified Feature Perk Box */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2.5 rounded-2xl bg-blue-50/70 border border-blue-100 p-3 text-xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{p.perk}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Trust Guarantee Badge Bar */}
      <div className="mt-8 rounded-2xl bg-slate-900 p-4 text-center text-xs text-slate-300 font-medium border border-slate-800 flex flex-wrap items-center justify-center gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>100% Free for Candidates</span>
        </div>
        <span className="hidden sm:inline text-slate-700">•</span>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-blue-400 shrink-0" />
          <span>Privacy First & Confidential Applications</span>
        </div>
        <span className="hidden sm:inline text-slate-700">•</span>
        <div className="flex items-center gap-2">
          <Award size={16} className="text-amber-400 shrink-0" />
          <span>Zero Black Hole Policy</span>
        </div>
      </div>
    </section>
  );
}
