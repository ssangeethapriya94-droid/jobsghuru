import { MessageCircleReply, ShieldCheck, ScanSearch, CheckCircle2 } from "lucide-react";

export default function PromisesSection() {
  const promises = [
    {
      icon: MessageCircleReply,
      title: "Guaranteed Recruiter Reply",
      badge: "Zero Ghosting",
      description:
        "Every employer commits to a verified response window. Silent listings are automatically paused so you never send your resume into a black hole.",
      perk: "Live recruiter response rate on every job card",
    },
    {
      icon: ShieldCheck,
      title: "100% Verified Employers",
      badge: "Scam-Proof",
      description:
        "Recruiter authenticity, company domain verification, and upfront compensation disclosures are inspected before any role goes live.",
      perk: "Strict salary transparency & age tracking",
    },
    {
      icon: ScanSearch,
      title: "Explainable Match Engine",
      badge: "Transparent Matching",
      description:
        "Know exactly why you match and what skills you are missing. Transparent rule-based reasoning with actionable suggestions to bridge your gaps.",
      perk: "Detailed skills, pay, and mode fit breakdown",
    },
  ];

  return (
    <section className="container-x mt-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
          The JobsGhuru Standard
        </span>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
          Hiring built on honesty, not silence.
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-500">
          We eliminated the frustrations of standard job boards to give you a transparent, dignified search experience.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {promises.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-800 transition duration-200 group-hover:bg-slate-900 group-hover:text-white">
                    <Icon size={22} />
                  </div>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {p.badge}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-lg font-bold text-slate-900">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {p.description}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                <span>{p.perk}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
