"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Briefcase,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  Flag,
  ShieldAlert,
  UserX,
  Bot,
  Activity,
  Layers,
  GitFork,
  BookOpen,
  CheckSquare,
  FileText,
  Video,
  CreditCard,
  Receipt,
  Sparkles,
  Megaphone,
  BarChart3,
  TrendingUp,
  DollarSign,
  Cpu,
  Bell,
  UserCog,
  KeyRound,
  History,
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Mail,
} from "lucide-react";

interface SidebarGroup {
  name: string;
  items: {
    label: string;
    href: string;
    icon: any;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    name: "MAIN",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Candidates", href: "/admin/candidates", icon: UserCheck },
      { label: "Companies", href: "/admin/companies", icon: Building2 },
      { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
      { label: "Applications", href: "/admin/applications", icon: FileSpreadsheet },
    ],
  },
  {
    name: "GROWTH & COMMERCIAL",
    items: [
      { label: "Payment Gateway & UPI", href: "/admin/payments", icon: CreditCard, badge: "UPI", badgeColor: "bg-blue-600 shadow-blue-500/30" },
      { label: "Email & SMTP Gateway", href: "/admin/smtp", icon: Mail, badge: "SMTP", badgeColor: "bg-emerald-600 shadow-emerald-500/30" },
      { label: "Subscriptions & Plans", href: "/admin/subscriptions", icon: Receipt },
      { label: "Featured Jobs", href: "/admin/promotions", icon: Sparkles },
    ],
  },
  {
    name: "TRUST & SAFETY",
    items: [
      {
        label: "Company Verification",
        href: "/admin/verifications",
        icon: ShieldCheck,
        badge: 3,
        badgeColor: "bg-amber-500 shadow-amber-500/30",
      },
      {
        label: "Job Moderation",
        href: "/admin/moderation",
        icon: AlertTriangle,
        badge: 2,
        badgeColor: "bg-blue-500 shadow-blue-500/30",
      },
      {
        label: "User Reports",
        href: "/admin/reports",
        icon: Flag,
        badge: 2,
        badgeColor: "bg-rose-500 shadow-rose-500/30",
      },
      { label: "Fraud & Safety", href: "/admin/safety", icon: ShieldAlert },
      { label: "Suspended Accounts", href: "/admin/suspended", icon: UserX },
    ],
  },
  {
    name: "AI & CAREER",
    items: [
      { label: "AI Assistant", href: "/admin/ai", icon: Bot },
      { label: "AI Usage", href: "/admin/ai/usage", icon: Activity },
      { label: "Skill Database", href: "/admin/skills", icon: Layers },
      { label: "Career Paths", href: "/admin/career-paths", icon: GitFork },
      { label: "Learning Resources", href: "/admin/learning", icon: BookOpen },
      { label: "Assessments", href: "/admin/assessments", icon: CheckSquare },
      { label: "Resume AI", href: "/admin/resume-ai", icon: FileText },
      { label: "Interview AI", href: "/admin/interview-ai", icon: Video },
    ],
  },
  {
    name: "ANALYTICS",
    items: [
      { label: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Recruitment Analytics", href: "/admin/analytics/recruitment", icon: TrendingUp },
      { label: "Revenue Analytics", href: "/admin/analytics/revenue", icon: DollarSign },
      { label: "AI Analytics", href: "/admin/analytics/ai", icon: Cpu },
    ],
  },
  {
    name: "SYSTEM",
    items: [
      { label: "Website Pages CMS", href: "/admin/cms", icon: FileText },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Admin Users", href: "/admin/admin-users", icon: UserCog },
      { label: "Roles & Permissions", href: "/admin/permissions", icon: KeyRound },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar({
  adminRole,
  isMobileOpen,
  onCloseMobile,
  isDesktopCollapsed = false,
  onToggleDesktopCollapse,
}: {
  adminRole: string;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <>
      {/* Mobile Backdrop with Smooth Blur */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-800/80 bg-gradient-to-b from-[#090E1E] via-[#0E162B] to-[#0A0F1F] text-slate-300 shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDesktopCollapsed ? "w-72 lg:w-20" : "w-72"}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4 sm:px-5 bg-white/[0.02]">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Shield size={19} />
            </span>
            <div className={`${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
              <span className="font-display text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                Jobs<span className="text-blue-400">Ghuru</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ENTERPRISE ADMIN
              </span>
            </div>
          </Link>

          {/* Desktop Toggle Button */}
          {onToggleDesktopCollapse && (
            <button
              type="button"
              onClick={onToggleDesktopCollapse}
              className="hidden lg:flex rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title={isDesktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label="Toggle sidebar"
            >
              {isDesktopCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          )}

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {SIDEBAR_GROUPS.map((group) => {
            const isCollapsed = collapsedGroups[group.name];
            return (
              <div key={group.name} className="space-y-1">
                {/* Group Title Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.name)}
                  className={`flex w-full items-center justify-between px-3 py-1 text-[10px] font-extrabold tracking-wider text-slate-400/90 uppercase hover:text-slate-200 transition select-none ${
                    isDesktopCollapsed ? "lg:justify-center lg:px-0" : ""
                  }`}
                >
                  <span className={`${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
                    {group.name}
                  </span>
                  <div
                    className={`hidden ${
                      isDesktopCollapsed ? "lg:block h-px w-6 bg-slate-800 my-1.5" : "lg:hidden"
                    }`}
                  />
                  <span className={`${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  </span>
                </button>

                {/* Items */}
                {!isCollapsed && (
                  <div className="space-y-0.5 pt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onCloseMobile}
                          className={`group relative flex items-center rounded-xl py-2 text-xs font-semibold transition-all duration-200 ${
                            isDesktopCollapsed
                              ? "px-3 lg:justify-center lg:px-0"
                              : "justify-between px-3"
                          } ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/25 border border-blue-400/20"
                              : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              size={17}
                              className={`shrink-0 transition-colors ${
                                isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                              }`}
                            />
                            <span
                              className={`truncate ${
                                isDesktopCollapsed ? "lg:hidden" : "block"
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs ${
                                item.badgeColor || "bg-blue-600"
                              } ${isDesktopCollapsed ? "lg:hidden" : "block"}`}
                            >
                              {item.badge}
                            </span>
                          )}

                          {/* Collapsed Desktop Floating Tooltip */}
                          {isDesktopCollapsed && (
                            <div className="hidden lg:group-hover:flex absolute left-full ml-3 z-50 items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs font-bold text-white shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                              <span>{item.label}</span>
                              {item.badge !== undefined && (
                                <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-extrabold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom User Session Status Footer */}
        <div className="border-t border-slate-800/80 p-3 bg-white/[0.01]">
          <div
            className={`flex items-center gap-3 rounded-2xl bg-slate-900/90 p-2 border border-slate-800/90 shadow-inner ${
              isDesktopCollapsed ? "lg:justify-center lg:p-2" : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-blue-600/30">
              {adminRole.slice(0, 2)}
            </div>
            <div className={`min-w-0 flex-1 ${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
              <span className="block truncate text-xs font-bold text-white">
                {adminRole.replace(/_/g, " ")}
              </span>
              <span className="block truncate text-[10px] font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Session Active
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

