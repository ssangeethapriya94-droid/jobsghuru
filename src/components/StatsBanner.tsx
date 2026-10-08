import { Briefcase, Building2, Zap, IndianRupee } from "lucide-react";

interface StatsProps {
  totalJobs: number;
  totalCompanies: number;
  avgResponseRate: number;
  highestSalary: number;
}

export default function StatsBanner({
  totalJobs = 24,
  totalCompanies = 6,
  avgResponseRate = 78,
  highestSalary = 32,
}: StatsProps) {
  const stats = [
    {
      label: "Verified Roles Live",
      value: `${totalJobs}+`,
      sub: "100% scam-free guarantee",
      icon: Briefcase,
    },
    {
      label: "Partner Companies",
      value: `${totalCompanies}`,
      sub: "Actively hiring tech talent",
      icon: Building2,
    },
    {
      label: "Avg. Recruiter Response",
      value: `${avgResponseRate}%`,
      sub: "Guaranteed reply window",
      icon: Zap,
    },
    {
      label: "Peak Salary Disclosed",
      value: `₹${highestSalary} LPA`,
      sub: "Transparent compensation",
      icon: IndianRupee,
    },
  ];

  return (
    <section className="container-x mt-8">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6 lg:grid-cols-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-3.5 ${
                idx !== 0 ? "lg:border-l lg:border-slate-100 lg:pl-6" : ""
              }`}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-800">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
                  {item.value}
                </p>
                <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                <p className="text-[11px] text-slate-400">{item.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
