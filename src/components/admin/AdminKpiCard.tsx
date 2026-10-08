import React, { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AdminKpiProps {
  label?: string;
  title?: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  trend?: "up" | "down" | "neutral";
  period?: string;
  subtitle?: string;
  icon: LucideIcon | ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  accentColor?: string;
}

export default function AdminKpiCard({
  label,
  title,
  value,
  change,
  changeType,
  trend,
  period,
  subtitle,
  icon,
  iconBgColor = "bg-blue-50 border-blue-100/80 text-blue-600",
  iconColor = "text-blue-600",
  accentColor = "from-blue-600 to-indigo-600",
}: AdminKpiProps) {
  const displayLabel = title || label || "Metric";
  const displaySub = subtitle || period || "vs baseline";
  const effectiveTrend =
    trend || (changeType === "increase" ? "up" : changeType === "decrease" ? "down" : "neutral");

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "function" || (typeof icon === "object" && "render" in (icon as any))) {
      const IconComponent = icon as LucideIcon;
      return <IconComponent size={20} className="shrink-0" />;
    }
    return <>{icon}</>;
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4.5 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300/80 hover:shadow-[0_12px_32px_-6px_rgba(37,99,235,0.09)] flex flex-col justify-between">
      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-blue-500/5 blur-2xl transition-opacity duration-300 group-hover:bg-blue-500/10" />

      {/* Main Row: Label & Value on Left, Icon on Right */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors truncate block">
            {displayLabel}
          </span>
          <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mt-1 group-hover:text-blue-950 transition-colors truncate">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl border shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-105 ${iconBgColor} ${iconColor}`}
        >
          {renderIcon()}
        </div>
      </div>

      {/* Change / Trend Badge Row */}
      {change && (
        <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100/80">
          <span
            className={`inline-flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold ${
              effectiveTrend === "up"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                : effectiveTrend === "down"
                ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                : "bg-slate-100 text-slate-700 border border-slate-200/70"
            }`}
          >
            {effectiveTrend === "up" ? (
              <TrendingUp size={11} className="stroke-[2.5]" />
            ) : effectiveTrend === "down" ? (
              <TrendingDown size={11} className="stroke-[2.5]" />
            ) : (
              <Minus size={11} className="stroke-[2.5]" />
            )}
            <span>{change}</span>
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">
            {displaySub}
          </span>
        </div>
      )}

      {/* Bottom Accent Bar on Hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300" />
    </div>
  );
}
