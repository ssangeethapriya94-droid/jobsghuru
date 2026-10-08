"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Building,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Shield,
  Sparkles,
  Lock,
  CreditCard,
  Briefcase,
  Users,
  Check,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Award,
  Clock,
  Heart,
  Zap,
  ChevronRight,
  BadgeCheck,
  Calendar,
  Hash,
  TrendingUp,
  Rocket,
  Cpu,
  GraduationCap,
  ShoppingBag,
  Cloud,
  Factory,
  Truck,
  Layers,
  Eye,
  EyeOff,
  ExternalLink,
  Laptop,
  CheckSquare,
  UploadCloud,
  QrCode,
  Receipt,
  FileCheck,
  FileUp,
  Landmark,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { recommendEmployerPlan } from "@/lib/employer/recommendPlan";
import AdminDocumentViewerModal, { DocumentItem } from "@/components/admin/AdminDocumentViewerModal";

export default function EmployerRegisterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Steps:
  // 1: Corporate Legal Identity & Document Proofs (Brand Name, Legal Name, CIN, GSTIN, Docs, Industry, Scale, Year)
  // 2: Headquarters & Office Footprint (Address, City, State, Country, PIN, Boardline Phone, Website, Domain, Hubs)
  // 3: Authorized Staff (Full Name, Corporate Email, Mobile, Designation, Staff ID, LinkedIn, Password)
  // 4: Hiring Scope & Company Perks (Departments, Target Roles, Tech Stack, Volume, Work Mode, Benefits, Bio)
  // 5: Plan Selection, Payment Checkout & Corporate Governance SLA (Plan, Billing Cycle, Payment, Legal Affirmations)
  // 6: Success & Real-Time Tracking
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Corporate Identity, Legal & Documents
    displayName: "",
    legalName: "",
    companyType: "Private Limited (Pvt Ltd)",
    cinNumber: "",
    taxId: "",
    industry: searchParams.get("industry") || "IT & Software",
    size: "51-200",
    yearFounded: "2020",

    // Step 1 Documents: Uploaded Compliance Proofs
    documents: [
      {
        type: "GST_CERTIFICATE",
        title: "GST Registration Certificate (GST-REG-06)",
        fileName: "",
        fileSize: "",
        url: "",
        uploadedAt: "",
      },
      {
        type: "INCORPORATION_CERTIFICATE",
        title: "Certificate of Incorporation / MCA Registration",
        fileName: "",
        fileSize: "",
        url: "",
        uploadedAt: "",
      },
      {
        type: "COMPANY_PAN",
        title: "Company Corporate PAN Card",
        fileName: "",
        fileSize: "",
        url: "",
        uploadedAt: "",
      },
      {
        type: "STAFF_ID",
        title: "Authorized Officer ID / Board Authorization",
        fileName: "",
        fileSize: "",
        url: "",
        uploadedAt: "",
      },
    ],

    // Step 2: Corporate Headquarters & Digital Footprint
    website: "",
    corporateDomain: "",
    businessPhone: "",
    address: "",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    postalCode: "560103",
    operatingHubs: ["Bengaluru", "Hyderabad"],

    // Step 3: Authorized Staff / Primary Recruiter
    recruiterName: "",
    businessEmail: "",
    recruiterPhone: "",
    recruiterDesignation: "Head of Talent Acquisition",
    staffId: "",
    department: "Human Resources",
    linkedinUrl: "",
    password: "",
    confirmPassword: "",

    // Step 4: Hiring Profile, Tech Stack & Corporate Perks (EVP)
    hiringDepartments: ["Engineering & Technology", "Product & Design"],
    hiringRoles: ["Software Engineer", "Full Stack Developer", "DevOps Engineer"],
    customRoleInput: "",
    techStack: ["React", "TypeScript", "Node.js", "Python", "AWS"],
    customTechInput: "",
    hiringVolume: "6-20" as "1-5" | "6-20" | "21-50" | "51-100" | "100+",
    hiringFrequency: "monthly" as "one-time" | "occasional" | "monthly" | "continuous" | "high-volume",
    hiringUrgency: "Within 30 Days",
    workMode: "HYBRID" as "REMOTE" | "HYBRID" | "ONSITE" | "FLEXIBLE",
    employmentType: "FULL_TIME" as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
    benefits: [
      "Comprehensive Health & Family Insurance",
      "Stock Options / ESOPs",
      "Performance Bonus & Profit Sharing",
      "Flexible Working Hours & Core Time",
      "Learning, Certifications & Books Budget",
    ],
    description: "",

    // Step 5: Plan Selection, Payment Checkout & Compliance SLA
    selectedPlanCode: searchParams.get("plan") || "GROWTH",
    billingCycle: (searchParams.get("cycle") || "ANNUAL") as "MONTHLY" | "ANNUAL",
    paymentMethod: "UPI_QR" as "UPI_QR" | "CARD" | "NETBANKING" | "NEFT_RTGS",
    paymentUpiId: "recruiter@okhdfcbank",
    paymentCardNumber: "4532 •••• •••• 8912",
    paymentCardExpiry: "08/28",
    paymentCardCvv: "•••",
    paymentCardHolder: "VIKRAM MALHOTRA",
    paymentBank: "HDFC Bank (Corporate NetBanking)",
    paymentTransactionId: "UPI-CB-908241",
    paymentConfirmed: true,
    authorizationCertified: true,
    slaAgreed: true,
    auditConsent: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredResult, setRegisteredResult] = useState<any>(null);

  // Document Uploading State
  const [uploadingDocIdx, setUploadingDocIdx] = useState<number | null>(null);
  const [dragActiveIdx, setDragActiveIdx] = useState<number | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Payment Processing Simulation
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Hidden file inputs
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Auto-extract corporate domain from website or email
  useEffect(() => {
    if (formData.website && !formData.corporateDomain) {
      try {
        const url = new URL(formData.website.startsWith("http") ? formData.website : `https://${formData.website}`);
        const domain = url.hostname.replace(/^www\./, "");
        if (domain) setFormData((prev) => ({ ...prev, corporateDomain: domain }));
      } catch (e) {
        // ignore invalid url during typing
      }
    }
  }, [formData.website, formData.corporateDomain]);

  // Live plan recommendation computation
  const recommendation = recommendEmployerPlan({
    industry: formData.industry,
    companySize: formData.size,
    hiringVolume: formData.hiringVolume,
    hiringFrequency: formData.hiringFrequency,
    activeJobsNeeded: formData.hiringVolume === "1-5" ? 3 : formData.hiringVolume === "6-20" ? 8 : 25,
    candidateSearchNeed: true,
    aiRequirement: true,
    recruiterCount: formData.size === "1-50" ? 2 : 5,
  });

  useEffect(() => {
    if (!searchParams.get("plan")) {
      setFormData((prev) => ({ ...prev, selectedPlanCode: recommendation.recommendedCode }));
    }
  }, [recommendation.recommendedCode, searchParams]);

  // Pricing calculation
  const getPricing = () => {
    const baseMonthly =
      formData.selectedPlanCode === "STARTER"
        ? 2999
        : formData.selectedPlanCode === "SCALE"
        ? 14999
        : 6999;

    const baseAnnualMonthly =
      formData.selectedPlanCode === "STARTER"
        ? 2399
        : formData.selectedPlanCode === "SCALE"
        ? 11999
        : 5499;

    const planAmount = formData.billingCycle === "ANNUAL" ? baseAnnualMonthly * 12 : baseMonthly;
    const gstAmount = Math.round(planAmount * 0.18);
    const totalAmount = planAmount + gstAmount;

    return {
      planAmount,
      gstAmount,
      totalAmount,
      planLabel:
        formData.selectedPlanCode === "STARTER"
          ? "Starter Trial"
          : formData.selectedPlanCode === "SCALE"
          ? "Enterprise Scale"
          : "Growth Recruiter",
    };
  };

  const pricing = getPricing();

  // Document Upload Handler
  const handleFileUpload = async (index: number, file: File) => {
    setUploadingDocIdx(index);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("documentType", formData.documents[index].type);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "File upload failed.");
      }

      setFormData((prev) => {
        const nextDocs = [...prev.documents];
        nextDocs[index] = {
          ...nextDocs[index],
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          url: data.url,
          uploadedAt: new Date().toISOString(),
        };
        return { ...prev, documents: nextDocs };
      });
    } catch (err: any) {
      // Fallback to local Data URL preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => {
          const nextDocs = [...prev.documents];
          nextDocs[index] = {
            ...nextDocs[index],
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            url: e.target?.result as string || `/uploads/company-docs/${file.name}`,
            uploadedAt: new Date().toISOString(),
          };
          return { ...prev, documents: nextDocs };
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingDocIdx(null);
    }
  };

  const handleRemoveDoc = (index: number) => {
    setFormData((prev) => {
      const nextDocs = [...prev.documents];
      nextDocs[index] = {
        ...nextDocs[index],
        fileName: "",
        fileSize: "",
        url: "",
        uploadedAt: "",
      };
      return { ...prev, documents: nextDocs };
    });
  };

  const handleAttachDemoDocs = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const companyPrefix = (formData.displayName || "company").toLowerCase().replace(/[^a-z0-9]/g, "_");
    setFormData((prev) => ({
      ...prev,
      documents: [
        {
          type: "GST_CERTIFICATE",
          title: "GST Registration Certificate (GST-REG-06)",
          fileName: `${companyPrefix}_gst_certificate_reg06.pdf`,
          fileSize: "1.42 MB",
          url: `/uploads/company-docs/${companyPrefix}_gst_cert.pdf`,
          uploadedAt: new Date().toISOString(),
        },
        {
          type: "INCORPORATION_CERTIFICATE",
          title: "Certificate of Incorporation / MCA Registration",
          fileName: `${companyPrefix}_mca_certificate_inc11.pdf`,
          fileSize: "2.18 MB",
          url: `/uploads/company-docs/${companyPrefix}_mca_incorp.pdf`,
          uploadedAt: new Date().toISOString(),
        },
        {
          type: "COMPANY_PAN",
          title: "Company Corporate PAN Card",
          fileName: `${companyPrefix}_corporate_pan_card.pdf`,
          fileSize: "680 KB",
          url: `/uploads/company-docs/${companyPrefix}_corporate_pan.pdf`,
          uploadedAt: new Date().toISOString(),
        },
        {
          type: "STAFF_ID",
          title: "Authorized Officer ID / Board Authorization",
          fileName: `${companyPrefix}_board_authorization_letter.pdf`,
          fileSize: "910 KB",
          url: `/uploads/company-docs/${companyPrefix}_officer_badge.pdf`,
          uploadedAt: new Date().toISOString(),
        },
      ],
    }));
  };

  // Step Validation before progressing
  const handleNext = () => {
    setError(null);

    if (currentStep === 1) {
      if (!formData.displayName.trim()) {
        setError("Company Brand / Display Name is required.");
        return;
      }
      if (!formData.legalName.trim()) {
        setError("Legal Entity Registered Name is required.");
        return;
      }
      if (!formData.industry) {
        setError("Please select your organization's primary industry sector.");
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.city.trim()) {
        setError("Headquarters City is required.");
        return;
      }
      if (!formData.address.trim()) {
        setError("Office / Tech Park Street Address is required for corporate audit.");
        return;
      }
      if (!formData.website.trim() && !formData.corporateDomain.trim()) {
        setError("Official Corporate Website or Domain is required.");
        return;
      }
    }

    if (currentStep === 3) {
      if (!formData.recruiterName.trim()) {
        setError("Authorized Recruiter / Office Staff Name is required.");
        return;
      }
      if (!formData.businessEmail.trim() || !formData.businessEmail.includes("@")) {
        setError("A valid corporate work email is required.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Security Password must be at least 6 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match. Please verify your password entry.");
        return;
      }
    }

    if (currentStep === 4) {
      if (formData.hiringRoles.length === 0) {
        setError("Please specify at least one target role your company is hiring for.");
        return;
      }
    }

    if (currentStep === 5) {
      if (!formData.authorizationCertified || !formData.slaAgreed || !formData.auditConsent) {
        setError("You must agree to the corporate declarations and verification audit terms.");
        return;
      }
      if (!formData.paymentConfirmed) {
        setError("Please complete or confirm the payment checkout before submitting.");
        return;
      }
      // Submit registration
      handleSubmitRegistration();
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitRegistration = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/employers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paymentAmount: pricing.totalAmount,
          paymentMethod:
            formData.paymentMethod === "UPI_QR"
              ? "Corporate UPI (QR Verified)"
              : formData.paymentMethod === "CARD"
              ? "Corporate Credit/Debit Card"
              : formData.paymentMethod === "NETBANKING"
              ? `Corporate NetBanking (${formData.paymentBank})`
              : "NEFT / RTGS Wire Transfer",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register company.");
      }

      setRegisteredResult(data);
      setCurrentStep(6); // Success Step
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  // Helper toggle functions
  const toggleRole = (role: string) => {
    if (formData.hiringRoles.includes(role)) {
      setFormData((prev) => ({ ...prev, hiringRoles: prev.hiringRoles.filter((r) => r !== role) }));
    } else {
      setFormData((prev) => ({ ...prev, hiringRoles: [...prev.hiringRoles, role] }));
    }
  };

  const addCustomRole = () => {
    if (formData.customRoleInput.trim() && !formData.hiringRoles.includes(formData.customRoleInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        hiringRoles: [...prev.hiringRoles, prev.customRoleInput.trim()],
        customRoleInput: "",
      }));
    }
  };

  const toggleTech = (tech: string) => {
    if (formData.techStack.includes(tech)) {
      setFormData((prev) => ({ ...prev, techStack: prev.techStack.filter((t) => t !== tech) }));
    } else {
      setFormData((prev) => ({ ...prev, techStack: [...prev.techStack, tech] }));
    }
  };

  const addCustomTech = () => {
    if (formData.customTechInput.trim() && !formData.techStack.includes(formData.customTechInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, prev.customTechInput.trim()],
        customTechInput: "",
      }));
    }
  };

  const toggleBenefit = (b: string) => {
    if (formData.benefits.includes(b)) {
      setFormData((prev) => ({ ...prev, benefits: prev.benefits.filter((item) => item !== b) }));
    } else {
      setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, b] }));
    }
  };

  const toggleHub = (hub: string) => {
    if (formData.operatingHubs.includes(hub)) {
      setFormData((prev) => ({ ...prev, operatingHubs: prev.operatingHubs.filter((h) => h !== hub) }));
    } else {
      setFormData((prev) => ({ ...prev, operatingHubs: [...prev.operatingHubs, hub] }));
    }
  };

  const handleAutofillDemo = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      displayName: `Razorpay India ${randomId}`,
      legalName: `Razorpay Software Technologies Private Limited`,
      companyType: "Private Limited (Pvt Ltd)",
      cinNumber: `U72200KA2020PTC${randomId}`,
      taxId: `29AAACR${randomId}L1Z8`,
      industry: "BFSI & FinTech",
      size: "501-1000",
      yearFounded: "2019",
      documents: [
        {
          type: "GST_CERTIFICATE",
          title: "GST Registration Certificate (GST-REG-06)",
          fileName: `razorpay_${randomId}_gst_cert.pdf`,
          fileSize: "1.42 MB",
          url: `/uploads/company-docs/razorpay_${randomId}_gst_cert.pdf`,
          uploadedAt: new Date().toISOString(),
        },
        {
          type: "INCORPORATION_CERTIFICATE",
          title: "Certificate of Incorporation / MCA Registration",
          fileName: `razorpay_${randomId}_mca_incorp.pdf`,
          fileSize: "2.18 MB",
          url: `/uploads/company-docs/razorpay_${randomId}_mca_incorp.pdf`,
          uploadedAt: new Date().toISOString(),
        },
        {
          type: "COMPANY_PAN",
          title: "Company Corporate PAN Card",
          fileName: `razorpay_${randomId}_corporate_pan.pdf`,
          fileSize: "680 KB",
          url: `/uploads/company-docs/razorpay_${randomId}_corporate_pan.pdf`,
          uploadedAt: new Date().toISOString(),
        },
        {
          type: "STAFF_ID",
          title: "Authorized Officer ID / Board Authorization",
          fileName: `razorpay_${randomId}_officer_badge.pdf`,
          fileSize: "910 KB",
          url: `/uploads/company-docs/razorpay_${randomId}_officer_badge.pdf`,
          uploadedAt: new Date().toISOString(),
        },
      ],
      website: `https://razorpay${randomId}.io`,
      corporateDomain: `razorpay${randomId}.io`,
      businessPhone: "+91 80 4912 8800",
      address: "SJR Cyber Park, 4th Floor, Hosur Road, Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      postalCode: "560095",
      operatingHubs: ["Bengaluru", "Mumbai", "Hyderabad", "100% Remote Hub"],
      recruiterName: "Vikram Malhotra",
      businessEmail: `recruiter${randomId}@razorpay${randomId}.io`,
      recruiterPhone: "+91 98450 88990",
      recruiterDesignation: "Director of Technical Talent",
      staffId: `STAFF-RP-${randomId}`,
      department: "Human Resources & Talent Acquisition",
      linkedinUrl: "https://linkedin.com/in/vikram-malhotra-recruiter",
      password: "Password@123",
      confirmPassword: "Password@123",
      hiringDepartments: ["Engineering & Technology", "Product & Design", "Security & Risk"],
      hiringRoles: [
        "Senior Full Stack Developer",
        "Cloud Solutions Architect",
        "FinTech Product Manager",
        "DevOps Engineer",
      ],
      customRoleInput: "",
      techStack: ["React", "Next.js", "TypeScript", "Node.js", "Python", "AWS", "PostgreSQL", "Docker"],
      customTechInput: "",
      hiringVolume: "21-50",
      hiringFrequency: "continuous",
      hiringUrgency: "Immediate / Within 15 Days",
      workMode: "HYBRID",
      employmentType: "FULL_TIME",
      benefits: [
        "Comprehensive Health & Family Insurance",
        "Stock Options / ESOPs",
        "Performance Bonus & Profit Sharing",
        "Flexible Working Hours & Core Time",
        "Work-From-Home Allowance / Stipend",
        "Learning, Certifications & Books Budget",
      ],
      description:
        "India's leading financial technology enterprise powering payment processing, neo-banking, and global payroll infrastructure for modern enterprises.",
      selectedPlanCode: "GROWTH",
      billingCycle: "ANNUAL",
      paymentMethod: "UPI_QR",
      paymentUpiId: `razorpay${randomId}@okhdfcbank`,
      paymentCardNumber: "4532 •••• •••• 8912",
      paymentCardExpiry: "08/28",
      paymentCardCvv: "•••",
      paymentCardHolder: "VIKRAM MALHOTRA",
      paymentBank: "HDFC Bank (Corporate NetBanking)",
      paymentTransactionId: `UPI-CB-${randomId}90`,
      paymentConfirmed: true,
      authorizationCertified: true,
      slaAgreed: true,
      auditConsent: true,
    });
    setError(null);
  };

  const stepMeta = [
    { title: "Legal & Docs", desc: "Entity, GST & Records", icon: Building2 },
    { title: "Corporate HQ", desc: "Address & Domain", icon: MapPin },
    { title: "Authorized Staff", desc: "Recruiter Credentials", icon: Lock },
    { title: "Hiring Scope", desc: "Roles, Stack & Perks", icon: Briefcase },
    { title: "Plan & Payment", desc: "Checkout & SLA", icon: CreditCard },
  ];

  const popularIndustries = [
    { name: "IT & Software", icon: Cpu },
    { name: "BFSI & FinTech", icon: CreditCard },
    { name: "Healthcare & Life Sciences", icon: Heart },
    { name: "E-Commerce & Retail", icon: ShoppingBag },
    { name: "SaaS & Enterprise Cloud", icon: Cloud },
    { name: "EdTech & Learning", icon: GraduationCap },
    { name: "Manufacturing & Auto", icon: Factory },
    { name: "Logistics & Supply Chain", icon: Truck },
    { name: "Media & Entertainment", icon: Sparkles },
    { name: "Consulting & Professional", icon: Briefcase },
  ];

  const popularRoles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "AI / ML Engineer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "QA Automation Engineer",
    "Technical Architect",
    "Engineering Manager",
  ];

  const popularTech = [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "Java",
    "Go",
    "AWS",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "GraphQL",
  ];

  const corporateBenefitsList = [
    "Comprehensive Health & Family Insurance",
    "Stock Options / ESOPs",
    "Performance Bonus & Profit Sharing",
    "Flexible Working Hours & Core Time",
    "Work-From-Home Allowance / Stipend",
    "Learning, Certifications & Books Budget",
    "Generous Paid Parental & Family Leave",
    "Mental Wellness & Gym Subsidies",
    "Complimentary Meals & Cab Facilities",
  ];

  const companyTypeOptions = [
    {
      type: "Private Limited (Pvt Ltd)",
      label: "Private Limited",
      desc: "Incorporated under MCA / Registrar",
      icon: Building2,
    },
    {
      type: "Public Limited (Ltd)",
      label: "Public Limited",
      desc: "Listed / Publicly traded company",
      icon: Building,
    },
    {
      type: "Limited Liability Partnership (LLP)",
      label: "LLP Firm",
      desc: "Registered partnership under MCA",
      icon: Shield,
    },
    {
      type: "DPIIT Registered Startup",
      label: "DPIIT Startup",
      desc: "Recognized by Startup India",
      icon: Rocket,
    },
    {
      type: "Global MNC Subsidiary",
      label: "Global MNC",
      desc: "Indian subsidiary of foreign entity",
      icon: Globe,
    },
    {
      type: "Partnership / Sole Entity",
      label: "Sole / Partnership",
      desc: "Registered proprietary or firm",
      icon: Users,
    },
  ];

  return (
    <div className="bg-slate-50/70 py-10 min-h-[calc(100vh-64px)] selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Enterprise Trust & MCA Audit Header */}
        <div className="mb-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-7 text-white shadow-2xl border border-slate-800/80">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-lg shadow-lg ring-2 ring-blue-400/30">
                CB
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                    JobsGhuru Enterprise Onboarding
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Ministry MCA & GSTIN Verified Pipeline
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Official corporate audit portal with GST & MCA document verification and secure payment checkout.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAutofillDemo}
                className="group inline-flex items-center gap-2 rounded-2xl border border-blue-400/40 bg-blue-500/15 hover:bg-blue-500/25 px-4 py-2.5 text-xs font-bold text-blue-200 hover:text-white transition-all shadow-md backdrop-blur-sm cursor-pointer"
              >
                <Sparkles size={15} className="text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>Autofill Sample Entity & Docs</span>
              </button>

              <Link
                href="/employer/login"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs font-bold text-white transition backdrop-blur-sm"
              >
                <span>Staff Login</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Multi-Step Timeline Header */}
        {currentStep <= 5 && (
          <div className="mb-8 rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Onboarding Progress: Step {currentStep} of 5</span>
              </div>
              <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-3.5 py-1 rounded-full shadow-2xs">
                {currentStep === 1 && "Step 1: Legal & Docs (20%)"}
                {currentStep === 2 && "Step 2: Corporate HQ (40%)"}
                {currentStep === 3 && "Step 3: Authorized Staff (60%)"}
                {currentStep === 4 && "Step 4: Hiring Scope (80%)"}
                {currentStep === 5 && "Step 5: Plan & Payment Checkout (Final Step)"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {stepMeta.map((s, idx) => {
                const stepNum = idx + 1;
                const isCurrent = currentStep === stepNum;
                const isPassed = currentStep > stepNum;
                const StepIcon = s.icon;

                return (
                  <button
                    key={stepNum}
                    type="button"
                    onClick={() => {
                      if (isPassed || stepNum <= currentStep) {
                        setCurrentStep(stepNum);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    disabled={stepNum > currentStep}
                    className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                      isCurrent
                        ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md ring-4 ring-blue-500/20 scale-[1.02]"
                        : isPassed
                        ? "bg-emerald-50/80 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100/70 cursor-pointer"
                        : "bg-slate-50/80 text-slate-400 opacity-60 cursor-not-allowed border border-transparent"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shrink-0 transition-transform ${
                        isCurrent
                          ? "bg-white text-blue-700 shadow-md scale-105"
                          : isPassed
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isPassed ? <Check size={16} strokeWidth={3} /> : <StepIcon size={16} />}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-[9px] font-extrabold uppercase tracking-wider ${
                          isCurrent ? "text-blue-100" : isPassed ? "text-emerald-700" : "text-slate-400"
                        }`}
                      >
                        Step {stepNum}
                      </div>
                      <div className={`font-bold text-xs truncate ${isCurrent ? "text-white" : "text-slate-900"}`}>
                        {s.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content Layout with Live Preview Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <div className={`${currentStep === 6 ? "lg:col-span-12" : "lg:col-span-8 xl:col-span-9"}`}>
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-card space-y-8">
              {/* Error Notice */}
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-900 flex items-start gap-3 animate-in fade-in duration-200 shadow-sm">
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="font-semibold leading-relaxed">{error}</div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 1: CORPORATE LEGAL IDENTITY & DOCUMENT UPLOADS */}
              {/* ============================================================ */}
              {currentStep === 1 && (
                <div className="space-y-7">
                  {/* Section Title Header */}
                  <div className="border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 border border-blue-100">
                        <Building2 size={13} />
                        Section 1 of 5: Corporate Entity & Document Records
                      </span>
                    </div>
                    <h1 className="mt-3 font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Corporate Identity & Ministry Document Verification
                    </h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Upload your official corporate compliance documents (GST Certificate, Incorporation, PAN Card)
                      for verification by the JobsGhuru Admin audit team.
                    </p>
                  </div>

                  <div className="space-y-6 text-xs">
                    {/* Organization Type */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                          Corporate Entity Structure <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400">Select legal constitution</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {companyTypeOptions.map((item) => {
                          const isSelected = formData.companyType === item.type;
                          const ItemIcon = item.icon;
                          return (
                            <button
                              key={item.type}
                              type="button"
                              onClick={() => setFormData({ ...formData, companyType: item.type })}
                              className={`group relative flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "border-blue-600 bg-blue-50/80 text-blue-950 font-bold shadow-sm ring-2 ring-blue-500/20"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                              }`}
                            >
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 transition-colors ${
                                  isSelected
                                    ? "bg-blue-600 text-white shadow-2xs"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                }`}
                              >
                                <ItemIcon size={18} />
                              </div>
                              <div className="min-w-0 pr-4">
                                <div className="font-extrabold text-xs text-slate-900 group-hover:text-blue-900">
                                  {item.label}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                  {item.desc}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                                  <Check size={11} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Company Names */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Brand / Trading Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            placeholder="e.g. Swiggy, Stripe, Infosys"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 font-medium placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Brand name displayed on public candidate job postings
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Legal Entity Registered Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={formData.legalName}
                            onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                            placeholder="e.g. Bundl Technologies Private Limited"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 font-medium placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Exact legal name as registered with Ministry / Registrar
                        </span>
                      </div>
                    </div>

                    {/* Legal Registry Numbers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                            Corporate Registration / CIN / LLPIN
                          </label>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">21-character MCA</span>
                        </div>
                        <div className="relative">
                          <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={formData.cinNumber}
                            onChange={(e) => setFormData({ ...formData, cinNumber: e.target.value.toUpperCase() })}
                            placeholder="e.g. U72200KA2015PTC081234"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Corporate Identity Number from Incorporation Certificate
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                            Tax ID (GSTIN / Corporate PAN) <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">15-char GST / 10-char PAN</span>
                        </div>
                        <div className="relative">
                          <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={formData.taxId}
                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value.toUpperCase() })}
                            placeholder="e.g. 29AAACZ1234M1Z5 or AAACZ1234M"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          15-digit GSTIN or 10-character Corporate PAN for tax compliance
                        </span>
                      </div>
                    </div>

                    {/* ======================================================= */}
                    {/* UPLOAD FILE OPTION FOR GST & COMPANY COMPLIANCE DOCS */}
                    {/* ======================================================= */}
                    <div className="pt-2">
                      <div className="rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 p-6 sm:p-8 space-y-6 shadow-sm">
                        {/* Section Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-100/80 pb-5">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 shrink-0">
                              <ShieldCheck size={26} />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2.5">
                                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                                  Corporate Compliance & Tax Certificates (Ministry & GST)
                                </h3>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100/80 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                                  <Lock size={11} /> 256-Bit Encrypted
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                                Upload official entity certificates for JobsGhuru administrative audit. Files are verified against Ministry of Corporate Affairs and GSTN records before granting recruiter access.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={handleAttachDemoDocs}
                              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-200 px-4 py-2.5 rounded-xl transition shadow-2xs cursor-pointer"
                            >
                              <Sparkles size={14} className="text-amber-500" />
                              <span>Attach Sample Certificates (Demo)</span>
                            </button>
                            <span className="text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl">
                              {formData.documents.filter((d) => Boolean(d.fileName)).length} of 4 Attached
                            </span>
                          </div>
                        </div>

                        {/* 4 Cards Grid - 2 columns on wide desktop with plenty of breathing space */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                          {formData.documents.map((doc, idx) => {
                            const isAttached = Boolean(doc.fileName);
                            const isUploading = uploadingDocIdx === idx;
                            const isDragActive = dragActiveIdx === idx;

                            const docSpecs: Record<string, { tag: string; tagBg: string; desc: string }> = {
                              GST_CERTIFICATE: {
                                tag: "FORM GST-REG-06",
                                tagBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
                                desc: "Official 3-page registration certificate issued under Goods & Services Tax Rules, showing legal name and 15-digit GSTIN.",
                              },
                              INCORPORATION_CERTIFICATE: {
                                tag: "ROC / MCA INC-11",
                                tagBg: "bg-blue-50 text-blue-700 border-blue-200",
                                desc: "Certificate of Incorporation issued by Registrar of Companies (ROC) under Ministry of Corporate Affairs with allotted CIN.",
                              },
                              COMPANY_PAN: {
                                tag: "FORM 49A / PAN",
                                tagBg: "bg-amber-50 text-amber-800 border-amber-200",
                                desc: "Permanent Account Number card issued to the corporate entity by Income Tax Department for tax compliance.",
                              },
                              STAFF_ID: {
                                tag: "BOARD AUTH / HR ID",
                                tagBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                                desc: "Board authorization letter on company letterhead or official employee identity badge of the authorized recruiter.",
                              },
                            };

                            const spec = docSpecs[doc.type] || {
                              tag: "COMPLIANCE DOC",
                              tagBg: "bg-slate-100 text-slate-700 border-slate-200",
                              desc: "Official corporate compliance verification document.",
                            };

                            return (
                              <div
                                key={doc.type}
                                className={`rounded-3xl border transition-all p-5 sm:p-6 bg-white shadow-xs flex flex-col justify-between ${
                                  isAttached
                                    ? "border-emerald-300 ring-1 ring-emerald-500/20 bg-gradient-to-b from-white to-emerald-50/15"
                                    : isDragActive
                                    ? "border-blue-500 ring-4 ring-blue-500/15 bg-blue-50/30"
                                    : "border-slate-200/90 hover:border-slate-300"
                                }`}
                              >
                                <div>
                                  {/* Card Top Pill & Requirement Tag */}
                                  <div className="flex items-center justify-between gap-2 mb-2.5">
                                    <span
                                      className={`text-[10px] font-extrabold uppercase font-mono px-2.5 py-0.5 rounded-full border ${spec.tagBg}`}
                                    >
                                      {spec.tag}
                                    </span>
                                    {isAttached ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                        <Check size={11} strokeWidth={3} />
                                        <span>Ready for Audit</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                        Mandatory
                                      </span>
                                    )}
                                  </div>

                                  {/* Document Title (No truncation) */}
                                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                                    {doc.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {spec.desc}
                                  </p>
                                </div>

                                <input
                                  type="file"
                                  ref={(el) => {
                                    fileInputRefs.current[idx] = el;
                                  }}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileUpload(idx, e.target.files[0]);
                                    }
                                  }}
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  className="hidden"
                                />

                                {/* Upload Zone / File Preview */}
                                <div className="mt-4 pt-3 border-t border-slate-100">
                                  {isAttached ? (
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200/90 bg-slate-50/80">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 font-black text-xs shrink-0 shadow-2xs">
                                            PDF
                                          </div>
                                          <div className="min-w-0">
                                            <div className="font-bold text-xs text-slate-900 truncate">
                                              {doc.fileName}
                                            </div>
                                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                              <span>{doc.fileSize || "1.4 MB"}</span>
                                              <span>•</span>
                                              <span className="text-emerald-700 font-medium">✓ Uploaded</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreviewingDoc({
                                              type: doc.type,
                                              title: doc.title,
                                              fileName: doc.fileName,
                                              fileSize: doc.fileSize,
                                              url: doc.url,
                                              uploadedAt: doc.uploadedAt,
                                              companyName: formData.displayName || "Company",
                                              legalName: formData.legalName,
                                              taxId: formData.taxId,
                                              cinNumber: formData.cinNumber,
                                            });
                                            setIsPreviewOpen(true);
                                          }}
                                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 text-xs transition shadow-xs cursor-pointer"
                                        >
                                          <Eye size={13} />
                                          <span>Preview Document</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => fileInputRefs.current[idx]?.click()}
                                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-2 text-xs transition cursor-pointer"
                                        >
                                          <RefreshCw size={12} />
                                          <span>Replace</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleRemoveDoc(idx)}
                                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-2 text-xs transition cursor-pointer ml-auto"
                                        >
                                          <Trash2 size={12} />
                                          <span>Remove</span>
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragActiveIdx(idx);
                                      }}
                                      onDragLeave={() => setDragActiveIdx(null)}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        setDragActiveIdx(null);
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                          handleFileUpload(idx, e.dataTransfer.files[0]);
                                        }
                                      }}
                                      onClick={() => fileInputRefs.current[idx]?.click()}
                                      className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                                    >
                                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 group-hover:bg-blue-600 group-hover:text-white shadow-xs transition-all mb-2.5">
                                        {isUploading ? (
                                          <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <UploadCloud size={20} />
                                        )}
                                      </div>
                                      <div className="text-xs font-bold text-slate-800">
                                        {isUploading ? (
                                          "Uploading certificate..."
                                        ) : (
                                          <>
                                            Drag & drop certificate here, or{" "}
                                            <span className="text-blue-600 underline font-extrabold">Browse File</span>
                                          </>
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-400 mt-1">
                                        Supports PDF, PNG, JPG (up to 15MB)
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Industry Sector */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                          Primary Industry & Domain Sector <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400">Used for recruiter talent targeting</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                        {popularIndustries.map((ind) => {
                          const isSelected = formData.industry === ind.name;
                          const IndIcon = ind.icon;
                          return (
                            <button
                              key={ind.name}
                              type="button"
                              onClick={() => setFormData({ ...formData, industry: ind.name })}
                              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white font-bold shadow-md ring-2 ring-blue-500/20 scale-[1.02]"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <IndIcon size={20} className={`mb-1.5 ${isSelected ? "text-white" : "text-blue-600"}`} />
                              <span className="text-xs font-semibold leading-tight line-clamp-2">{ind.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Headcount and Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Total Enterprise Headcount <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <select
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 font-medium bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          >
                            <option value="1-10">1–10 employees (Early Seed)</option>
                            <option value="11-50">11–50 employees (Emerging Startup)</option>
                            <option value="51-200">51–200 employees (Growth Scale)</option>
                            <option value="201-500">201–500 employees (Mid Enterprise)</option>
                            <option value="501-1000">501–1,000 employees (Large Corporate)</option>
                            <option value="1000-5000">1,000–5,000 employees (Enterprise Tier)</option>
                            <option value="5000+">5,000+ employees (Global Conglomerate)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Year of Incorporation / Founding
                        </label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="number"
                            min="1950"
                            max="2026"
                            value={formData.yearFounded}
                            onChange={(e) => setFormData({ ...formData, yearFounded: e.target.value })}
                            placeholder="2019"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 font-medium placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 2: HEADQUARTERS & CORPORATE PRESENCE */}
              {/* ============================================================ */}
              {currentStep === 2 && (
                <div className="space-y-7">
                  <div className="border-b border-slate-100 pb-5">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 border border-blue-100">
                      <MapPin size={13} />
                      Section 2 of 5: Headquarters & Digital Footprint
                    </span>
                    <h2 className="mt-3 font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Corporate Headquarters & Operating Locations
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Physical address and verified domain records help authenticate your organization and enable geographic candidate matching.
                    </p>
                  </div>

                  <div className="space-y-6 text-xs">
                    {/* Website and Domain */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Corporate Website URL <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="url"
                            required
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://company.com"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 font-medium focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Primary Corporate Domain <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Laptop size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={formData.corporateDomain}
                            onChange={(e) => setFormData({ ...formData, corporateDomain: e.target.value })}
                            placeholder="e.g. company.com"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 font-mono text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Recruiter work emails must match this domain
                        </span>
                      </div>
                    </div>

                    {/* Boardline Phone & PIN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Corporate Boardline / Reception Phone
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            value={formData.businessPhone}
                            onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                            placeholder="+91 80 4123 4567"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Postal / PIN Code <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={formData.postalCode}
                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            placeholder="e.g. 560103"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 font-mono focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Physical Address */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                        Headquarters Office / Tech Park Street Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="e.g. Block C, Manyata Embassy Business Park, Outer Ring Road"
                          className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* City, State, Country */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          City <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Bengaluru"
                          className="w-full rounded-2xl border border-slate-300/90 py-3 px-3.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          State / Province <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="Karnataka"
                          className="w-full rounded-2xl border border-slate-300/90 py-3 px-3.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">Country</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="India"
                          className="w-full rounded-2xl border border-slate-300/90 py-3 px-3.5 text-slate-900 bg-slate-50 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Operating Hubs */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                          Operating Office Locations & Hiring Hubs
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {formData.operatingHubs.length} selected
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Bengaluru",
                          "Hyderabad",
                          "Pune",
                          "Mumbai",
                          "Delhi-NCR",
                          "Chennai",
                          "Kolkata",
                          "Ahmedabad",
                          "100% Remote Hub",
                        ].map((hub) => {
                          const active = formData.operatingHubs.includes(hub);
                          return (
                            <button
                              key={hub}
                              type="button"
                              onClick={() => toggleHub(hub)}
                              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                                active
                                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              {hub} {active && "✓"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 3: AUTHORIZED STAFF / RECRUITER CONTACT */}
              {/* ============================================================ */}
              {currentStep === 3 && (
                <div className="space-y-7">
                  <div className="border-b border-slate-100 pb-5">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 border border-blue-100">
                      <Lock size={13} />
                      Section 3 of 5: Authorized Staff & Login Setup
                    </span>
                    <h2 className="mt-3 font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Authorized Talent Officer / Account Administrator
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      When your company is approved, the official credentials email will be dispatched to this staff member to sign in at <span className="font-mono font-bold text-blue-700">/employer/login</span>.
                    </p>
                  </div>

                  <div className="space-y-6 text-xs">
                    {/* Staff Name and Designation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Authorized Officer Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={formData.recruiterName}
                            onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                            placeholder="e.g. Priya Sharma"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Corporate Designation / Title <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={formData.recruiterDesignation}
                            onChange={(e) => setFormData({ ...formData, recruiterDesignation: e.target.value })}
                            placeholder="e.g. Head of Talent Acquisition, HR Director"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Official Work Email and Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Official Corporate Work Email <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={formData.businessEmail}
                            onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                            placeholder="priya.sharma@company.com"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                        <span className="text-[11px] text-blue-700 font-semibold mt-1 block">
                          Official login credentials will be emailed to this inbox upon approval
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Direct Mobile Number (for 2FA & Alerts) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            required
                            value={formData.recruiterPhone}
                            onChange={(e) => setFormData({ ...formData, recruiterPhone: e.target.value })}
                            placeholder="+91 98401 23456"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Staff ID & LinkedIn */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Corporate Employee / Staff ID (Optional)
                        </label>
                        <div className="relative">
                          <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={formData.staffId}
                            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                            placeholder="e.g. EMP-90214"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 font-mono text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Speeds up internal verification with HR databases
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Representative LinkedIn Profile URL
                        </label>
                        <div className="relative">
                          <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="url"
                            value={formData.linkedinUrl}
                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full rounded-2xl border border-slate-300/90 py-3 pl-10 pr-3.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Account Passwords */}
                    <div className="rounded-3xl border border-slate-200/90 bg-slate-50/80 p-5 space-y-4">
                      <div className="font-extrabold text-slate-900 flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Lock size={16} className="text-blue-600" />
                          <span>Security Password Setup</span>
                        </div>
                        {formData.password && formData.confirmPassword && (
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              formData.password === formData.confirmPassword
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {formData.password === formData.confirmPassword ? "✓ Passwords Match" : "✕ Must Match"}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1.5">
                            Set Account Password <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="••••••••••••"
                              className="w-full rounded-2xl border border-slate-300/90 py-2.5 px-3.5 pr-10 text-slate-900 bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1.5">
                            Confirm Password <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              placeholder="••••••••••••"
                              className="w-full rounded-2xl border border-slate-300/90 py-2.5 px-3.5 pr-10 text-slate-900 bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Must be at least 6 characters. Once the JobsGuru admin team approves your registration, an
                        audit notification and your login credentials will also be dispatched via email.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 4: HIRING PROFILE, TECH STACK & PERKS */}
              {/* ============================================================ */}
              {currentStep === 4 && (
                <div className="space-y-7">
                  <div className="border-b border-slate-100 pb-5">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 border border-blue-100">
                      <Briefcase size={13} />
                      Section 4 of 5: Talent Acquisition Scope
                    </span>
                    <h2 className="mt-3 font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Hiring Intent, Tech Stack & Corporate Culture
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Showcase what makes your engineering and product teams exciting to attract high-caliber talent.
                    </p>
                  </div>

                  <div className="space-y-6 text-xs">
                    {/* Target Roles */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                          Target Roles to Recruit (Select Multiple) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {formData.hiringRoles.length} selected
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularRoles.map((role) => {
                          const active = formData.hiringRoles.includes(role);
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => toggleRole(role)}
                              className={`rounded-2xl px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                                active
                                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs scale-[1.02]"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              {role} {active && "✓"}
                            </button>
                          );
                        })}
                      </div>

                      {/* Add custom role */}
                      <div className="mt-3 flex items-center gap-2 max-w-md">
                        <input
                          type="text"
                          value={formData.customRoleInput}
                          onChange={(e) => setFormData({ ...formData, customRoleInput: e.target.value })}
                          placeholder="Add custom position title..."
                          className="rounded-2xl border border-slate-300/90 py-2 px-3.5 text-xs flex-1 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomRole();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={addCustomRole}
                          className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-sm transition"
                        >
                          + Add Role
                        </button>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                          Primary Engineering & Tech Stack
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {formData.techStack.length} frameworks
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularTech.map((tech) => {
                          const active = formData.techStack.includes(tech);
                          return (
                            <button
                              key={tech}
                              type="button"
                              onClick={() => toggleTech(tech)}
                              className={`rounded-2xl px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                                active
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs scale-[1.02]"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              {tech} {active && "✓"}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex items-center gap-2 max-w-md">
                        <input
                          type="text"
                          value={formData.customTechInput}
                          onChange={(e) => setFormData({ ...formData, customTechInput: e.target.value })}
                          placeholder="Add technology or framework (e.g. Kotlin, Rust)..."
                          className="rounded-2xl border border-slate-300/90 py-2 px-3.5 text-xs flex-1 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomTech();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={addCustomTech}
                          className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-sm transition"
                        >
                          + Add Tech
                        </button>
                      </div>
                    </div>

                    {/* Volume and Work Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Planned Hiring Volume per Quarter
                        </label>
                        <select
                          value={formData.hiringVolume}
                          onChange={(e) => setFormData({ ...formData, hiringVolume: e.target.value as any })}
                          className="w-full rounded-2xl border border-slate-300/90 py-3 px-3.5 text-slate-900 bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs font-medium"
                        >
                          <option value="1-5">1–5 hires (Selective Leadership)</option>
                          <option value="6-20">6–20 hires (Scaling Engineering)</option>
                          <option value="21-50">21–50 hires (Multi-Team Expansion)</option>
                          <option value="51-100">51–100 hires (Hyper-Growth Cohort)</option>
                          <option value="100+">100+ hires (Enterprise Mass Recruitment)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                          Work Mode Offered
                        </label>
                        <select
                          value={formData.workMode}
                          onChange={(e) => setFormData({ ...formData, workMode: e.target.value as any })}
                          className="w-full rounded-2xl border border-slate-300/90 py-3 px-3.5 text-slate-900 bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs font-medium"
                        >
                          <option value="HYBRID">Hybrid (Office + Remote Days)</option>
                          <option value="REMOTE">100% Remote / Distributed</option>
                          <option value="ONSITE">On-Site at Headquarters</option>
                          <option value="FLEXIBLE">Flexible / Role Dependent</option>
                        </select>
                      </div>
                    </div>

                    {/* Popular Corporate Benefits Checklist */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-2">
                        Top Corporate Benefits & Perks Offered (EVP)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {corporateBenefitsList.map((benefit) => {
                          const checked = formData.benefits.includes(benefit);
                          return (
                            <button
                              key={benefit}
                              type="button"
                              onClick={() => toggleBenefit(benefit)}
                              className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                                checked
                                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold shadow-2xs"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-lg border transition-colors ${
                                  checked
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {checked && <Check size={13} strokeWidth={3} />}
                              </span>
                              <span>{benefit}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bio & Mission */}
                    <div>
                      <label className="block font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                        Company Bio & Mission Pitch
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Explain your core product, market leadership, and why ambitious engineers and leaders choose to build with your team..."
                        className="w-full rounded-2xl border border-slate-300/90 p-3.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 5: PLAN SELECTION, PAYMENT CHECKOUT & GOVERNANCE SLA */}
              {/* ============================================================ */}
              {currentStep === 5 && (
                <div className="space-y-7">
                  <div className="border-b border-slate-100 pb-5">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 border border-blue-100">
                      <CreditCard size={13} />
                      Section 5 of 5: Plan, Corporate Payment & Certification
                    </span>
                    <h2 className="mt-3 font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Employer Subscription Plan & Payment Checkout
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Select your recruitment partnership tier and complete the corporate checkout.
                      Invoices include GST input tax credits for your organization.
                    </p>
                  </div>

                  {/* Plan Cards */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        Choose Employer Subscription Tier
                      </span>
                      {/* Billing Cycle Toggle */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, billingCycle: "MONTHLY" })}
                          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                            formData.billingCycle === "MONTHLY"
                              ? "bg-white text-slate-900 shadow-2xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, billingCycle: "ANNUAL" })}
                          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                            formData.billingCycle === "ANNUAL"
                              ? "bg-white text-blue-700 shadow-2xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Annual <span className="text-emerald-600 text-[10px] font-extrabold">(Save 20%)</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {[
                        {
                          code: "STARTER",
                          name: "Starter Trial",
                          monthlyPrice: "₹2,999",
                          annualPrice: "₹2,399/mo",
                          jobs: "3 Active Postings",
                          credits: "100 Verified CV Unlocks",
                        },
                        {
                          code: "GROWTH",
                          name: "Growth Recruiter",
                          monthlyPrice: "₹6,999",
                          annualPrice: "₹5,499/mo",
                          jobs: "10 Active Postings",
                          credits: "250 Verified CV Unlocks",
                          badge: "Most Popular",
                        },
                        {
                          code: "SCALE",
                          name: "Enterprise Scale",
                          monthlyPrice: "₹14,999",
                          annualPrice: "₹11,999/mo",
                          jobs: "Unlimited Postings",
                          credits: "750 Verified CV Unlocks",
                          badge: "Enterprise",
                        },
                      ].map((plan) => {
                        const selected = formData.selectedPlanCode === plan.code;
                        return (
                          <div
                            key={plan.code}
                            onClick={() => setFormData({ ...formData, selectedPlanCode: plan.code })}
                            className={`cursor-pointer rounded-3xl border p-5 text-xs transition-all relative ${
                              selected
                                ? "border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20 scale-[1.02]"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            {plan.badge && (
                              <span className="absolute -top-3 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                                {plan.badge}
                              </span>
                            )}
                            <div className="font-black text-slate-900 text-sm sm:text-base">{plan.name}</div>
                            <div className="mt-1.5 font-mono text-lg font-black text-blue-700">
                              {formData.billingCycle === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice}
                            </div>
                            <div className="mt-3 space-y-1.5 text-slate-600 text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <Check size={13} className="text-emerald-600 shrink-0" />
                                <span>{plan.jobs}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Check size={13} className="text-emerald-600 shrink-0" />
                                <span>{plan.credits}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Check size={13} className="text-emerald-600 shrink-0" />
                                <span>AI Candidate Ranking & ATS</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* PAYMENT SECTION & CHECKOUT CHECKOUT */}
                  {/* ======================================================= */}
                  <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2">
                        <Receipt size={18} className="text-blue-600" />
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          Corporate Payment & Checkout Summary
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        GSTIN Ref: {formData.taxId || "Pending Verification"}
                      </span>
                    </div>

                    {/* Order Price Breakdown Table */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>{pricing.planLabel} ({formData.billingCycle.toLowerCase()} billing)</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{pricing.planAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Applicable GST (18% Input Tax Credit Eligible)</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{pricing.gstAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-900 font-extrabold text-sm sm:text-base">
                        <span>Total Payable (INR)</span>
                        <span className="font-mono text-blue-700 text-lg sm:text-xl">
                          ₹{pricing.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Payment Method Selector Tabs */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-800 block">
                        Select Corporate Payment Method
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "UPI_QR", label: "UPI & QR Pay", icon: QrCode },
                          { id: "CARD", label: "Credit / Debit Card", icon: CreditCard },
                          { id: "NETBANKING", label: "Corporate NetBanking", icon: Landmark },
                          { id: "NEFT_RTGS", label: "NEFT / RTGS Wire", icon: Receipt },
                        ].map((m) => {
                          const active = formData.paymentMethod === m.id;
                          const MIcon = m.icon;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, paymentMethod: m.id as any })}
                              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                                active
                                  ? "bg-blue-600 text-white border-blue-600 shadow-sm font-bold ring-2 ring-blue-500/20"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <MIcon size={18} />
                              <span className="text-[11px] leading-tight">{m.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Payment Method Details Box */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs space-y-4">
                        {formData.paymentMethod === "UPI_QR" && (
                          <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
                              <div className="h-32 w-32 bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-2xs">
                                <QrCode size={100} className="text-slate-900" />
                              </div>
                              <span className="text-[10px] font-bold text-blue-700 mt-2">
                                Scan with Any UPI App
                              </span>
                            </div>

                            <div className="space-y-3 flex-1 w-full">
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                  Corporate UPI ID / VPA
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={formData.paymentUpiId}
                                    onChange={(e) =>
                                      setFormData({ ...formData, paymentUpiId: e.target.value })
                                    }
                                    placeholder="company@okhdfcbank"
                                    className="w-full rounded-xl border border-slate-300 py-2 px-3 font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-semibold">
                                <span className="bg-slate-100 px-2 py-0.5 rounded">GPay</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded">PhonePe</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded">Paytm</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded">BHIM UPI</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded">Cred</span>
                              </div>

                              <p className="text-[11px] text-slate-400">
                                Instant automated reconciliation with zero transaction charges.
                              </p>
                            </div>
                          </div>
                        )}

                        {formData.paymentMethod === "CARD" && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                  Card Number
                                </label>
                                <input
                                  type="text"
                                  value={formData.paymentCardNumber}
                                  onChange={(e) =>
                                    setFormData({ ...formData, paymentCardNumber: e.target.value })
                                  }
                                  placeholder="4532 •••• •••• 8912"
                                  className="w-full rounded-xl border border-slate-300 py-2 px-3 font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                                />
                              </div>

                              <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                  Name on Corporate Card
                                </label>
                                <input
                                  type="text"
                                  value={formData.paymentCardHolder}
                                  onChange={(e) =>
                                    setFormData({ ...formData, paymentCardHolder: e.target.value.toUpperCase() })
                                  }
                                  placeholder="VIKRAM MALHOTRA"
                                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:outline-none focus:border-blue-600 uppercase"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 max-w-xs">
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                  Valid Thru (MM/YY)
                                </label>
                                <input
                                  type="text"
                                  value={formData.paymentCardExpiry}
                                  onChange={(e) =>
                                    setFormData({ ...formData, paymentCardExpiry: e.target.value })
                                  }
                                  placeholder="12/28"
                                  className="w-full rounded-xl border border-slate-300 py-2 px-3 font-mono text-slate-900 text-center"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-700 mb-1">CVV / CVC</label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  value={formData.paymentCardCvv}
                                  onChange={(e) =>
                                    setFormData({ ...formData, paymentCardCvv: e.target.value })
                                  }
                                  placeholder="•••"
                                  className="w-full rounded-xl border border-slate-300 py-2 px-3 font-mono text-slate-900 text-center"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.paymentMethod === "NETBANKING" && (
                          <div className="space-y-3">
                            <label className="block font-bold text-slate-700 mb-1">
                              Select Corporate Bank
                            </label>
                            <select
                              value={formData.paymentBank}
                              onChange={(e) => setFormData({ ...formData, paymentBank: e.target.value })}
                              className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 bg-white font-medium focus:border-blue-600 focus:outline-none"
                            >
                              <option value="HDFC Bank (Corporate NetBanking)">HDFC Bank Corporate</option>
                              <option value="ICICI Bank (Corporate NetBanking)">ICICI Bank Corporate</option>
                              <option value="State Bank of India (Corporate)">SBI Corporate Banking</option>
                              <option value="Axis Bank Corporate">Axis Bank Corporate</option>
                              <option value="Kotak Mahindra Corporate">Kotak Mahindra Corporate</option>
                              <option value="Standard Chartered Bank">Standard Chartered</option>
                            </select>
                            <p className="text-[11px] text-slate-500">
                              You will be authenticated via your bank's secure multi-token corporate portal.
                            </p>
                          </div>
                        )}

                        {formData.paymentMethod === "NEFT_RTGS" && (
                          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs">
                            <div className="font-bold text-slate-900">JobsGhuru Virtual Escrow Account</div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-400 block">Beneficiary Name:</span>
                                <span className="font-semibold text-slate-800">JobsGhuru Technologies Pvt Ltd</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Virtual Account Number:</span>
                                <span className="font-mono font-bold text-slate-900">CB-CORP-982148</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Bank IFSC Code:</span>
                                <span className="font-mono font-bold text-slate-900">HDFC0000123</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Branch:</span>
                                <span className="font-semibold text-slate-800">Koramangala, Bengaluru</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment Verification Status Badge */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Check size={14} strokeWidth={3} />
                            </span>
                            <span className="text-xs font-bold text-emerald-800">
                              Checkout Status: Payment Verified ({formData.paymentTransactionId})
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIsProcessingPayment(true);
                              setTimeout(() => {
                                setIsProcessingPayment(false);
                                setFormData((prev) => ({
                                  ...prev,
                                  paymentConfirmed: true,
                                  paymentTransactionId: `TXN-CB-${Math.floor(100000 + Math.random() * 900000)}`,
                                }));
                              }, 600);
                            }}
                            className="rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 text-xs transition cursor-pointer"
                          >
                            {isProcessingPayment ? "Validating..." : "Simulate Re-verification"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Corporate Governance Affirmations */}
                  <div className="rounded-3xl border border-slate-200/90 bg-slate-50/90 p-5 sm:p-6 space-y-4 text-xs text-slate-800">
                    <div className="font-extrabold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
                      <ShieldCheck size={18} className="text-emerald-600" />
                      <span>Corporate Governance & Compliance Affirmation</span>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 transition">
                      <input
                        type="checkbox"
                        checked={formData.authorizationCertified}
                        onChange={(e) =>
                          setFormData({ ...formData, authorizationCertified: e.target.checked })
                        }
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[11px] sm:text-xs leading-relaxed text-slate-700">
                        <strong className="text-slate-900">Authorized Talent Officer Affirmation:</strong> I certify that I am a duly authorized human resources executive, director, or corporate officer representing this registered entity with official legal capacity to onboard and recruit on JobsGhuru.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 transition">
                      <input
                        type="checkbox"
                        checked={formData.slaAgreed}
                        onChange={(e) => setFormData({ ...formData, slaAgreed: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[11px] sm:text-xs leading-relaxed text-slate-700">
                        <strong className="text-slate-900">Candidate Response SLA:</strong> Our organization agrees to uphold JobsGhuru Transparent Hiring Guidelines, pledging to provide application status responses to evaluated candidates within 14 business days.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 transition">
                      <input
                        type="checkbox"
                        checked={formData.auditConsent}
                        onChange={(e) => setFormData({ ...formData, auditConsent: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[11px] sm:text-xs leading-relaxed text-slate-700">
                        <strong className="text-slate-900">Ministry Audit & Credentials Notice:</strong> I understand that registration details and uploaded GST documents will be verified by the Jobsguru Admin team. Once approved, the system generates secure login credentials emailed directly to <span className="font-mono font-bold text-blue-700">{formData.businessEmail || "your official work email"}</span> for access at <code>/employer/login</code>.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 6: SUBMISSION SUCCESS & REAL-TIME AUDIT TRACKER */}
              {/* ============================================================ */}
              {currentStep === 6 && registeredResult && (
                <div className="py-6 space-y-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-xl ring-8 ring-emerald-50">
                    <CheckCircle2 size={44} />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                      Registration Received • Payment Confirmed • Pending Admin Verification
                    </span>
                    <h2 className="pt-2 font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Application & Payment Submitted Successfully!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                      Your enterprise registration and payment for <strong className="text-slate-900">{registeredResult.companyName}</strong> have been submitted to the JobsGuru Admin review queue.
                    </p>
                  </div>

                  {/* Payment Receipt & Audit Tracker Card */}
                  <div className="max-w-lg mx-auto text-left rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 space-y-4 text-xs shadow-sm">
                    <div className="font-extrabold text-slate-900 text-xs border-b border-slate-200 pb-3 flex items-center justify-between">
                      <span>Verification & Credential Dispatch Tracker</span>
                      <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        Invoice: {registeredResult.invoiceNumber || "INV-JG-8472"}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
                          <Check size={14} strokeWidth={3} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Step 1: Entity & Compliance Documents Submitted</div>
                          <div className="text-slate-500 text-[11px]">
                            {formData.documents.filter((d) => d.fileName).length} official verification documents attached & registered under <span className="font-mono font-bold text-blue-700">{registeredResult.registeredEmail}</span>.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
                          <Check size={14} strokeWidth={3} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Step 2: Corporate Payment Confirmed</div>
                          <div className="text-slate-500 text-[11px]">
                            Paid ₹{pricing.totalAmount.toLocaleString("en-IN")} INR ({pricing.planLabel}) via {formData.paymentMethod}.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shrink-0 mt-0.5 animate-pulse shadow-xs">
                          <Clock size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-amber-900">Step 3: JobsGuru Admin Review & Verification (Current)</div>
                          <div className="text-slate-500 text-[11px]">
                            JobsGuru Administrators audit company information (GST / PAN / CIN) and corporate verification files.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 opacity-75">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                          <Mail size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Step 4: Official Credentials Emailed Upon Approval</div>
                          <div className="text-slate-500 text-[11px]">
                            Once approved, an email with your login link, email ID, and password will be delivered directly to <span className="font-mono font-bold text-blue-700">{registeredResult.registeredEmail}</span>.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/"
                      className="w-full sm:w-auto rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      ← Back to Home
                    </Link>

                    <Link
                      href="/employer/login"
                      className="w-full sm:w-auto rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Go to Employer Login</span>
                      <ArrowRight size={14} />
                    </Link>

                    <Link
                      href="/admin/verifications"
                      className="w-full sm:w-auto rounded-2xl border border-blue-200 bg-blue-50/70 px-5 py-3.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                    >
                      Admin Queue Review →
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              {currentStep <= 5 && (
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Previous Step</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 px-7 py-3 text-xs font-extrabold text-white shadow-lg transition-all cursor-pointer scale-100 hover:scale-[1.02] active:scale-98"
                  >
                    {loading ? (
                      <span>Submitting Enterprise Profile...</span>
                    ) : currentStep === 5 ? (
                      <>
                        <span>Submit for Admin Audit</span>
                        <ShieldCheck size={16} />
                      </>
                    ) : (
                      <>
                        <span>Continue to Next Step</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Company Card Preview & Benefits */}
          {currentStep <= 5 && (
            <div className="lg:col-span-4 xl:col-span-3 space-y-5 sticky top-8">
              {/* Executive Branded Card Preview */}
              <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-card transition-all">
                {/* Header Gradient Banner */}
                <div className="h-24 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-4 relative">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-white/90 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      Live Entity Preview
                    </span>
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-white">
                      Real-Time Sync
                    </span>
                  </div>
                </div>

                {/* Profile Card Body with Negative Margin Avatar */}
                <div className="p-5 pt-0 relative">
                  <div className="-mt-10 mb-3 flex items-end justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-700 font-black text-2xl shadow-xl ring-4 ring-white border border-slate-100 shrink-0">
                      {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : "C"}
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                      <Clock size={11} className="animate-spin text-amber-600" />
                      Pending Audit
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-base truncate">
                      {formData.displayName || "Your Company Brand"}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate font-medium">
                      {formData.legalName || "Legal Entity Registered Name"}
                    </p>
                  </div>

                  {/* Metadata Chips Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Industry</span>
                      <span className="font-bold text-slate-800 truncate block mt-0.5">
                        {formData.industry}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Headcount</span>
                      <span className="font-bold text-slate-800 truncate block mt-0.5">
                        {formData.size}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Headquarters</span>
                      <span className="font-bold text-slate-800 truncate block mt-0.5">
                        {formData.city || "Bengaluru"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Tax / Registry</span>
                      <span className="font-mono font-bold text-slate-800 truncate block mt-0.5">
                        {formData.taxId || formData.cinNumber || "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Attached Documents Counter */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Attached Docs:</span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                        {formData.documents.filter((d) => d.fileName).length} of 4 Attached
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Roles Preview */}
                  {formData.hiringRoles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Target Roles ({formData.hiringRoles.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {formData.hiringRoles.slice(0, 3).map((r) => (
                          <span
                            key={r}
                            className="rounded-lg bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold"
                          >
                            {r}
                          </span>
                        ))}
                        {formData.hiringRoles.length > 3 && (
                          <span className="rounded-lg bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-semibold">
                            +{formData.hiringRoles.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recruiter contact preview */}
                  {formData.recruiterName && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 text-[10px] block mb-0.5">Primary Recruiter Contact:</span>
                      <div className="font-bold text-slate-900">{formData.recruiterName}</div>
                      <div className="text-blue-700 font-mono text-[10px] truncate">
                        {formData.businessEmail || "work@company.com"}
                      </div>
                    </div>
                  )}

                  {/* Audit Process Notice */}
                  <div className="mt-4 rounded-2xl border border-amber-200/90 bg-amber-50/70 p-3 text-[11px] text-amber-900 flex items-start gap-2.5">
                    <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-amber-950">Verification SLA: 24h</div>
                      <p className="mt-0.5 text-amber-800 text-[10px] leading-relaxed">
                        JobsGhuru admin audits tax records and dispatches active login credentials upon approval.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corporate Trust Badges */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-card space-y-3.5 text-xs">
                <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  Why Top Employers Choose JobsGhuru:
                </div>
                <div className="space-y-2.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Direct access to 50,000+ pre-vetted engineers</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Ministry of Corporate Affairs compliant verification</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>AI-powered candidate ranking & ATS integration</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Dedicated account governance & SLA monitoring</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal for registration preview */}
      <AdminDocumentViewerModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={previewingDoc}
        companyName={formData.displayName || "Company"}
      />
    </div>
  );
}
