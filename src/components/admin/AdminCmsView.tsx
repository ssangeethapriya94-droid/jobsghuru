"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Save,
  Eye,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Mail,
  Megaphone,
  CheckCircle2,
  Code,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Sparkles,
  Eraser,
} from "lucide-react";

interface CmsPageData {
  title: string;
  metaDescription: string;
  contentHtml: string;
  updatedAt?: string;
  updatedBy?: string;
}

const CMS_TABS = [
  { slug: "about", label: "About Us", icon: FileText, route: "/about" },
  { slug: "privacy", label: "Privacy Policy", icon: ShieldCheck, route: "/privacy" },
  { slug: "terms", label: "Terms & Conditions", icon: Scale, route: "/terms" },
  { slug: "disclaimer", label: "Disclaimer", icon: AlertTriangle, route: "/disclaimer" },
  { slug: "contact", label: "Contact Us", icon: Mail, route: "/contact" },
];

export default function AdminCmsView() {
  const [activeSlug, setActiveSlug] = useState("about");
  const [pageData, setPageData] = useState<CmsPageData>({
    title: "",
    metaDescription: "",
    contentHtml: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showHtmlCode, setShowHtmlCode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const currentTab = CMS_TABS.find((t) => t.slug === activeSlug) || CMS_TABS[0];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCmsPage = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cms?slug=${slug}`);
      const data = await res.json();
      if (data.success && data.page) {
        setPageData(data.page);
      }
    } catch (err) {
      console.error("Failed to load CMS page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsPage(activeSlug);
  }, [activeSlug]);

  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: activeSlug,
          title: pageData.title,
          metaDescription: pageData.metaDescription,
          contentHtml: pageData.contentHtml,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save CMS page");

      setPageData(data.page);
      showToast(`Page "${pageData.title}" saved & published live to JobsGhuru!`);
    } catch (err: any) {
      alert(err.message || "Failed to save CMS page.");
    } finally {
      setIsSaving(false);
    }
  };

  // Basic Editor Helpers
  const executeFormatting = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">
              Website Pages CMS
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Manage, format, and publish live content for all public-facing pages on JobsGhuru.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Link
            href={currentTab.route}
            target="_blank"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition"
          >
            <Eye size={14} className="text-slate-500" />
            <span>Live Preview</span>
          </Link>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAndPublish}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Save size={15} />
            <span>{isSaving ? "Publishing..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* CMS Page Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {CMS_TABS.map((t) => {
          const IconComponent = t.icon;
          const isActive = activeSlug === t.slug;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActiveSlug(t.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <IconComponent size={15} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Container Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
        {/* Page Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-extrabold text-slate-900">
                {currentTab.label}
              </h2>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {currentTab.route}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Last updated: {pageData.updatedAt ? new Date(pageData.updatedAt).toLocaleString("en-US") : "Sep 25, 2026, 12:01 PM"} • By {pageData.updatedBy || "System Admin"}
            </p>
          </div>

          <Link
            href={currentTab.route}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>View Live Page</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        {/* SEO Meta Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Page Title
            </label>
            <input
              type="text"
              value={pageData.title}
              onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
              placeholder="e.g. About JobsGhuru"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              SEO Meta Description
            </label>
            <input
              type="text"
              value={pageData.metaDescription}
              onChange={(e) => setPageData({ ...pageData, metaDescription: e.target.value })}
              placeholder="Meta description for Google search engines..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        {/* WYSIWYG Toolbar */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <select
                onChange={(e) => executeFormatting("formatBlock", e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="p">Normal Text</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
              </select>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <button
                type="button"
                onClick={() => executeFormatting("bold")}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 transition"
                title="Bold"
              >
                <Bold size={15} />
              </button>

              <button
                type="button"
                onClick={() => executeFormatting("italic")}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 transition"
                title="Italic"
              >
                <Italic size={15} />
              </button>

              <button
                type="button"
                onClick={() => executeFormatting("underline")}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 transition"
                title="Underline"
              >
                <Underline size={15} />
              </button>

              <button
                type="button"
                onClick={() => executeFormatting("strikeThrough")}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 transition"
                title="Strikethrough"
              >
                <Strikethrough size={15} />
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <button
                type="button"
                onClick={() => executeFormatting("insertUnorderedList")}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 transition"
                title="Unordered List"
              >
                <List size={15} />
              </button>

              <button
                type="button"
                onClick={() => executeFormatting("insertOrderedList")}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 transition"
                title="Ordered List"
              >
                <ListOrdered size={15} />
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <button
                type="button"
                onClick={() => executeFormatting("justifyLeft")}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 transition"
                title="Align Left"
              >
                <AlignLeft size={15} />
              </button>

              <button
                type="button"
                onClick={() => executeFormatting("justifyCenter")}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 transition"
                title="Align Center"
              >
                <AlignCenter size={15} />
              </button>

              <button
                type="button"
                onClick={() => executeFormatting("justifyRight")}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-200 transition"
                title="Align Right"
              >
                <AlignRight size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowHtmlCode(!showHtmlCode)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                showHtmlCode
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Code size={14} />
              <span>{showHtmlCode ? "Visual Editor" : "HTML Code"}</span>
            </button>
          </div>

          {/* Editor Body */}
          {showHtmlCode ? (
            <textarea
              rows={16}
              value={pageData.contentHtml}
              onChange={(e) => setPageData({ ...pageData, contentHtml: e.target.value })}
              className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-950 text-slate-100 focus:outline-none"
            />
          ) : (
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setPageData({ ...pageData, contentHtml: e.currentTarget.innerHTML })}
              dangerouslySetInnerHTML={{ __html: pageData.contentHtml }}
              className="w-full min-h-[350px] p-6 prose prose-slate max-w-none focus:outline-none text-slate-800 text-sm leading-relaxed"
            />
          )}
        </div>

        {/* Bottom Save Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="font-mono text-xs font-bold text-slate-400">
            Slug: <span className="text-slate-700">{currentTab.slug}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={currentTab.route}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
            >
              <Eye size={14} />
              <span>Preview Page</span>
            </Link>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAndPublish}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Save size={15} />
              <span>{isSaving ? "Publishing..." : "Save & Publish"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
