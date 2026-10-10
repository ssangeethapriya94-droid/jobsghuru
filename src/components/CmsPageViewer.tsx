"use me";
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  HelpCircle,
  Sparkles,
  Award,
  Headphones,
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface BadgeItem {
  icon: string;
  label: string;
  color?: string;
}

interface MetricItem {
  value: string;
  label: string;
  color?: string;
}

interface CmsPageViewerProps {
  slug: string;
  title: string;
  metaDescription: string;
  contentHtml: string;
  badges?: BadgeItem[];
  metrics?: MetricItem[];
  helpCardTitle?: string;
  helpCardDesc?: string;
  helpCardCta?: string;
  helpCardHref?: string;
}

export function CmsPageViewer({
  slug,
  title,
  metaDescription,
  contentHtml,
  badges = [],
  metrics = [],
  helpCardTitle = "Have Questions?",
  helpCardDesc = "Contact our compliance & support team for assistance.",
  helpCardCta = "Contact Support",
  helpCardHref = "/contact",
}: CmsPageViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);

  // Parse sections out of contentHtml by splitting on <h2> tags
  const sections = useMemo(() => {
    if (!contentHtml) return [];

    // Split HTML by <h2> tags
    const tempDiv = typeof window !== "undefined" ? document.createElement("div") : null;
    if (!tempDiv) {
      // Fallback regex parsing for SSR
      const h2Regex = /<h2[^>]*>(.*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi;
      const parsed = [];
      let match;
      let idx = 1;
      while ((match = h2Regex.exec(contentHtml)) !== null) {
        const rawTitle = match[1].replace(/<[^>]+>/g, "").trim();
        const bodyHtml = match[2].trim();
        parsed.push({
          id: `section-${idx}`,
          number: idx < 10 ? `0${idx}` : `${idx}`,
          title: rawTitle,
          bodyHtml: bodyHtml,
        });
        idx++;
      }
      if (parsed.length === 0) {
        // Entire html as 1 section
        return [
          {
            id: "section-1",
            number: "01",
            title: title || "Overview",
            bodyHtml: contentHtml,
          },
        ];
      }
      return parsed;
    }

    tempDiv.innerHTML = contentHtml;
    const h2Elements = tempDiv.querySelectorAll("h2");
    if (h2Elements.length === 0) {
      return [
        {
          id: "section-1",
          number: "01",
          title: title || "Overview",
          bodyHtml: contentHtml,
        },
      ];
    }

    const parsed: Array<{ id: string; number: string; title: string; bodyHtml: string }> = [];
    h2Elements.forEach((h2, index) => {
      const secIdx = index + 1;
      const rawTitle = h2.textContent || `Section ${secIdx}`;

      // Collect sibling nodes until next <h2>
      let bodyContent = "";
      let curr = h2.nextElementSibling;
      while (curr && curr.tagName.toLowerCase() !== "h2") {
        bodyContent += curr.outerHTML;
        curr = curr.nextElementSibling;
      }

      parsed.push({
        id: `section-${secIdx}`,
        number: secIdx < 10 ? `0${secIdx}` : `${secIdx}`,
        title: rawTitle,
        bodyHtml: bodyContent,
      });
    });

    return parsed;
  }, [contentHtml, title]);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.bodyHtml.toLowerCase().includes(q)
    );
  }, [sections, searchQuery]);

  const handleCopyLink = (id: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      navigator.clipboard.writeText(url);
      setCopiedSectionId(id);
      setTimeout(() => setCopiedSectionId(null), 2000);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Helper to enrich raw body HTML (enhancing list items with check icons)
  const formatBodyHtml = (html: string) => {
    let formatted = html;
    // Replace <ul><li> with custom checkmark list items if not styled
    formatted = formatted.replace(
      /<ul>/g,
      '<ul class="space-y-3 my-4 text-slate-700 text-sm leading-relaxed">'
    );
    formatted = formatted.replace(
      /<li>/g,
      '<li class="flex items-start gap-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-100/90 text-slate-800 font-medium"><span class="mt-0.5 text-blue-600 font-bold shrink-0">✓</span><span>'
    );
    formatted = formatted.replace(/<\/li>/g, '</span></li>');
    return formatted;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-6 sm:py-10 text-slate-900">
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <ChevronRight size={13} />
          <span className="text-slate-500 capitalize">{slug}</span>
        </nav>

        {/* Top Header Banner (Light, Premium, No Dark Banner) */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs space-y-6">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-50/60 blur-3xl pointer-events-none" />
          
          <div className="relative space-y-4">
            {/* Badges Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {badges.length > 0 ? (
                badges.map((b, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      b.color || "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    <Sparkles size={13} />
                    {b.label}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck size={14} className="text-blue-600" />
                  Official Platform Document
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <Clock size={13} />
                2026 Edition
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>

            {/* Meta Description */}
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              {metaDescription}
            </p>

            {/* Metrics Bar */}
            {metrics.length > 0 && (
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {metrics.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-3.5 text-center transition hover:bg-white hover:shadow-2xs"
                  >
                    <div
                      className={`text-xl font-extrabold font-display ${
                        m.color || "text-blue-600"
                      }`}
                    >
                      {m.value}
                    </div>
                    <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar (Sticky Index & Quick Actions) */}
          <aside className="lg:col-span-4 space-y-6 sticky top-24">
            
            {/* Search & Filter Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search policy sections..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* Table of Contents List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-600" />
                    <span>Table of Contents</span>
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {filteredSections.length} Sections
                  </span>
                </div>

                <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                  {filteredSections.length > 0 ? (
                    filteredSections.map((sec) => {
                      const isActive = activeSectionId === sec.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => scrollToSection(sec.id)}
                          className={`w-full text-left p-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between gap-2 group cursor-pointer ${
                            isActive
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                                isActive
                                  ? "bg-blue-500 text-white"
                                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                              }`}
                            >
                              {sec.number}
                            </span>
                            <span className="truncate">{sec.title}</span>
                          </div>
                          <ArrowRight
                            size={13}
                            className={`shrink-0 transition-transform ${
                              isActive ? "translate-x-0.5 text-white" : "text-slate-400 opacity-0 group-hover:opacity-100"
                            }`}
                          />
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No matching sections found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Help & Support Card */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-6 shadow-md space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs">
                <HelpCircle size={16} />
                <span>{helpCardTitle}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {helpCardDesc}
              </p>
              <Link
                href={helpCardHref}
                className="inline-flex items-center gap-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
              >
                <span>{helpCardCta}</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>JobsGhuru Security Guarantee</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Audited & verified for 100% data sovereignty, scam protection, and recruiter accreditation.
              </p>
            </div>
          </aside>

          {/* Right Main Content (Structured Section Cards) */}
          <section className="lg:col-span-8 space-y-6">
            {filteredSections.length > 0 ? (
              filteredSections.map((sec) => (
                <article
                  key={sec.id}
                  id={sec.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs hover:border-blue-200/90 transition duration-200 space-y-4 scroll-mt-28"
                >
                  {/* Section Header */}
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-mono text-xs font-extrabold shadow-2xs">
                        {sec.number}
                      </span>
                      <h2 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                        {sec.title}
                      </h2>
                    </div>

                    <button
                      onClick={() => handleCopyLink(sec.id)}
                      title="Copy section link"
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer shrink-0"
                    >
                      {copiedSectionId === sec.id ? (
                        <Check size={15} className="text-emerald-600" />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>
                  </div>

                  {/* Section Body */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatBodyHtml(sec.bodyHtml),
                    }}
                    className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base prose-p:my-2 prose-p:leading-relaxed prose-strong:text-slate-900 prose-strong:font-bold prose-a:text-blue-600 prose-a:font-bold hover:prose-a:underline"
                  />
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
                <FileText size={32} className="mx-auto text-slate-300" />
                <h3 className="font-bold text-slate-700 text-base">No Matching Content</h3>
                <p className="text-xs text-slate-500">
                  Try searching with different terms or reset your query.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Clear Search
                </button>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
