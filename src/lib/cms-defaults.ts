export const DEFAULT_CMS_PAGES: Record<string, { title: string; metaDescription: string; contentHtml: string }> = {
  about: {
    title: "About JobsGhuru",
    metaDescription: "JobsGhuru is India's premier AI-driven recruitment intelligence & talent mobility platform.",
    contentHtml: `
      <h2>1. About JobsGhuru</h2>
      <p><strong>JobsGhuru</strong> is a next-generation recruitment intelligence & talent mobility platform bridging top talent and accredited corporate employers across India and worldwide. Built on high-precision AI matching, real-time skill analytics, and transparent pay governance, JobsGhuru empowers job seekers and enterprise recruiters with seamless hiring workflows.</p>

      <h2>2. Our Core Pillars</h2>
      <ul>
        <li><strong>AI Career Assistant & Matching:</strong> Advanced LLM copilot that evaluates candidate skill matrices, career paths, experience trajectory, and culture alignment.</li>
        <li><strong>Verified Corporate Governance:</strong> Multi-step employer verification ensuring 100% scam-free, authentic job requisitions with verified Tax ID and corporate domain checks.</li>
        <li><strong>Pay Transparency & Fair Hiring:</strong> Mandatory salary range disclosures and non-discriminatory hiring standards across all active requisitions.</li>
        <li><strong>End-to-End Recruitment Suite:</strong> Structured pipeline stages, automated interview scheduling, real-time assessment scoring, and instant offer management.</li>
      </ul>

      <h2>3. Platform Ecosystem</h2>
      <p>JobsGhuru serves three core stakeholders across the hiring lifecycle:</p>
      <ul>
        <li><strong>For Job Seekers:</strong> One-click verified applications, instant resume pitch generators, AI interview practice simulators, and transparent compensation benchmarks.</li>
        <li><strong>For Employers & Recruiters:</strong> Plan-based requisition posting, candidate skill match scoring, candidate talent pools, and automated interview feedback loops.</li>
        <li><strong>For Enterprise Platform Admins:</strong> Live job moderation queues, fraud detection monitoring, subscription ledger tracking, and platform-wide analytics.</li>
      </ul>

      <h2>4. Corporate Vision & Compliance</h2>
      <p>We envision an efficient, transparent talent marketplace where every job seeker finds meaningful career growth and every enterprise builds world-class engineering, product, and operational teams. JobsGhuru strictly complies with India's Digital Personal Data Protection (DPDP) standards and global equal-opportunity hiring guidelines.</p>
    `,
  },
  privacy: {
    title: "Privacy Policy & Data Security",
    metaDescription: "JobsGhuru candidate & employer privacy framework, data encryption, and DPDP compliance.",
    contentHtml: `
      <h2>1. Introduction & Scope</h2>
      <p>At <strong>JobsGhuru</strong>, protecting candidate personal information and corporate data sovereignty is our highest priority. This Privacy Policy details how we collect, process, store, and safeguard your data across the JobsGhuru ecosystem in full compliance with India's Digital Personal Data Protection (DPDP) Act 2023 and global privacy frameworks.</p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li><strong>Candidate Data:</strong> Full name, verified email address, phone number, work experience history, educational background, technical skills, resume documents, and expected CTC details.</li>
        <li><strong>Employer & Corporate Data:</strong> Company legal name, business registration tax numbers, corporate email domain, recruiter profile details, and job requisition parameters.</li>
        <li><strong>Technical Telemetry:</strong> IP addresses, browser types, device identifiers, session cookies, and login timestamp audit logs for account security and anti-fraud monitoring.</li>
      </ul>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>To power high-precision AI candidate matching and skill alignment scores.</li>
        <li>To allow verified corporate employers with active subscription plans to discover candidate profiles and initiate recruitment inquiries.</li>
        <li>To send important application status alerts, interview invitations, and job recommendations.</li>
        <li>To enforce platform safety, prevent fraud, and maintain audit logs.</li>
      </ul>

      <h2>4. Data Protection & Encryption</h2>
      <p>All candidate resumes, personal profiles, and communications are encrypted in transit via SSL/TLS 1.3 and at rest using military-grade AES-256 encryption. Access to candidate resume files is strictly restricted to verified recruiters belonging to verified company accounts.</p>

      <h2>5. Candidate Data Sovereignty & Rights</h2>
      <p>Candidates maintain full control over their personal data. You have the right to:</p>
      <ul>
        <li>Inspect and export your complete candidate profile data.</li>
        <li>Update or remove specific resume documents and work history records.</li>
        <li>Request permanent account deletion and data scrubbing from our active databases.</li>
      </ul>
    `,
  },
  terms: {
    title: "Terms & Conditions of Service",
    metaDescription: "Terms of service governing job seekers, recruiters, enterprise subscriptions, and platform usage.",
    contentHtml: `
      <h2>1. Acceptance of Terms</h2>
      <p>Welcome to <strong>JobsGhuru</strong>. By creating an account, posting a job requisition, or submitting a job application on our website or mobile portal, you agree to be bound by these Terms & Conditions of Service. If you do not agree to these terms, you must discontinue using our services immediately.</p>

      <h2>2. User Eligibility & Account Responsibilities</h2>
      <ul>
        <li><strong>Age Requirement:</strong> You must be at least 18 years of age (or the legal working age in your jurisdiction) to register an account on JobsGhuru.</li>
        <li><strong>Candidate Obligations:</strong> Job seekers agree to provide accurate, truthful information regarding employment history, skills, educational credentials, and legal right to work.</li>
        <li><strong>Account Security:</strong> Users are responsible for maintaining the confidentiality of their login credentials and for all activities under their account.</li>
      </ul>

      <h2>3. Employer Posting & Governance Guidelines</h2>
      <p>All employers and recruiters posting job requisitions on JobsGhuru must adhere to our Corporate Governance Policy:</p>
      <ul>
        <li>Job postings must represent actual, existing, and funded employment or internship opportunities.</li>
        <li>Every job requisition must include transparent salary ranges, clear work modes (Remote, Hybrid, Onsite), and explicit job responsibilities.</li>
        <li>Postings for multi-level marketing (MLM) schemes, commission-only pyramid setups, or any opportunity requiring financial payment from job candidates are strictly prohibited.</li>
      </ul>

      <h2>4. Subscription Tiers & Plan Usage</h2>
      <p>Corporate employer accounts are subject to subscription plan quotas (e.g. Starter Trial, Growth Scale, Enterprise VIP). Active job listing limits and resume search credits reset according to the contracted billing cycle. JobsGhuru reserves the right to suspend accounts that attempt to bypass plan quotas or share recruiter credentials across unverified users.</p>

      <h2>5. Intellectual Property & Termination</h2>
      <p>JobsGhuru retains all rights to platform technology, AI models, brand trademarks, and user interfaces. JobsGhuru reserves the right to suspend or terminate accounts that violate our anti-fraud, anti-discrimination, or fair use guidelines without prior notice.</p>
    `,
  },
  disclaimer: {
    title: "Platform Disclaimer & Anti-Fraud Safety",
    metaDescription: "JobsGhuru official anti-fraud guidelines, pay transparency compliance, and candidate protection.",
    contentHtml: `
      <h2>1. Platform Disclaimer</h2>
      <p><strong>JobsGhuru</strong> operates as an AI-powered talent marketplace connecting job seekers and employers. While we perform multi-tier verification on all corporate accounts, JobsGhuru does not act as an employment agency and is not a party to any eventual employment contract between candidates and hiring companies.</p>

      <h2>2. ZERO CANDIDATE PLACEMENT FEE GUARANTEE</h2>
      <p><strong>CRITICAL NOTICE FOR ALL JOB SEEKERS:</strong> JobsGhuru and our accredited corporate hiring partners will <strong>NEVER</strong> ask candidates for money, registration fees, security deposits, interview charges, or laptop/training kit payments at any stage of the recruitment process.</p>
      <p>If any person or entity claiming to represent JobsGhuru or a hiring company requests payment from you, do not pay them. Report the incident immediately to our <a href="/contact">Support Helpline</a> or via our <a href="/admin/reports">User Reports</a> safety channel.</p>

      <h2>3. Pay Transparency & Non-Discrimination</h2>
      <p>All job listings on JobsGhuru are required to specify honest salary indicators (CTC in LPA or monthly stipend) and adhere to equal opportunity hiring principles regardless of gender, religion, caste, or background.</p>

      <h2>4. Limitation of Warranties</h2>
      <p>Services are provided "as is" without warranty of any kind. JobsGhuru does not guarantee that a candidate will receive interview calls or job offers, nor that an employer will successfully fill every listed requisition.</p>
    `,
  },
  contact: {
    title: "Contact Us & Corporate Support",
    metaDescription: "Get in touch with JobsGhuru support, candidate helpline, and enterprise sales teams.",
    contentHtml: `
      <h2>1. Contact JobsGhuru Support</h2>
      <p>Have questions about candidate applications, employer subscription plans, API integrations, or platform safety? Our dedicated support and corporate account management teams are available to assist you.</p>

      <h2>2. Corporate Headquarters</h2>
      <p><strong>JobsGhuru Technologies Private Limited</strong><br/>
      Cyber City, Tower 4, 12th Floor, Sector 24<br/>
      Gurugram, Haryana - 122002, India</p>

      <h2>3. Direct Contact Channels</h2>
      <ul>
        <li><strong>Candidate Support Helpline:</strong> <a href="mailto:support@jobshuru.com">support@jobshuru.com</a> | +91 1800 200 4487 (Toll-Free, Mon-Sat 9 AM - 8 PM IST)</li>
        <li><strong>Enterprise Recruiter & Sales:</strong> <a href="mailto:sales@jobshuru.com">sales@jobshuru.com</a> | +91 124 459 9000</li>
        <li><strong>Legal & Compliance Officer:</strong> <a href="mailto:compliance@jobshuru.com">compliance@jobshuru.com</a></li>
      </ul>

      <h2>4. Response SLA</h2>
      <p>All candidate inquiries and recruiter technical support tickets are reviewed and answered within 2 hours during active business hours.</p>
    `,
  },
};
