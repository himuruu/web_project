"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";

const dashboardTranslations: Record<string, any> = {
  English: {
    headerTitle: "Applicant Dashboard",
  },
  Spanish: {
    headerTitle: "Panel de Solicitantes",
  },
  French: {
    headerTitle: "Tableau de Bord des Candidats",
  },
};

const sampleResumes = [
  {
    id: "candidate-1",
    name: "Anonymous Candidate",
    career:
      "Career shows progression from developer to management roles, indicating strong leadership growth.",
    strength: 74,
    experience: 74,
    skills: ["javascript", "java", "go", "html"],
  },
  {
    id: "candidate-2",
    name: "Tech Specialist",
    career: "Strong product delivery experience across SaaS and cloud-native systems.",
    strength: 68,
    experience: 69,
    skills: ["react", "node.js", "aws", "typescript"],
  },
];

const currencyFormatter = new Intl.NumberFormat("en-PH");

function formatCurrency(n?: number) {
  if (n == null) return "";
  return currencyFormatter.format(n);
}

function normalizeResumeSkills(skills: any): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  const technical = Array.isArray(skills.technical) ? skills.technical : [];
  const soft = Array.isArray(skills.soft) ? skills.soft : [];
  return Array.from(new Set([...technical, ...soft]));
}

function getResumeSummaryText(resume: any) {
  return resume.careerTrajectory || resume.career || "No career summary available.";
}

function calculateMatchScore(resume: any, job: any): number {
  if (!job) return 0;
  const resumeSkills = normalizeResumeSkills(resume.skills);
  const jobSkills = job.requiredSkills || [];
  const skillOverlap = resumeSkills.filter(skill =>
    jobSkills.some((jobSkill: string) => jobSkill.toLowerCase().includes(skill.toLowerCase()))
  ).length;
  const skillMatch = (skillOverlap / Math.max(jobSkills.length, 1)) * 100;
  const experienceBonus = resume.experienceQuality || 0;
  const strengthBonus = resume.strengthScore || 0;
  return Math.round(skillMatch * 0.5 + experienceBonus * 0.3 + strengthBonus * 0.2);
}

interface DashboardProps {
  onBackToHome?: () => void;
  currentLanguage: string;
}

export default function Dashboard({ onBackToHome, currentLanguage }: DashboardProps) {
  const t = dashboardTranslations[currentLanguage] || dashboardTranslations["English"];
  const [userType, setUserType] = useState<"company" | "applicant" | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [jobs, setJobs] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [searchQueryJobs, setSearchQueryJobs] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [rightPanelView, setRightPanelView] = useState<"ranking" | "detail">("ranking");
  
  // Floating Widget States
  const [showAbout, setShowAbout] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Chatbot States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, role: "bot", text: "Hello! I'm your AI Support Assistant. Having trouble uploading a resume, posting a job, or experiencing an error? Let me know!" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") as "dark" | "light" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (showChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showChat]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const toggleAbout = () => {
    setShowAbout(!showAbout);
    if (!showAbout) setShowChat(false); // Close chat if opening about
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) setShowAbout(false); // Close about if opening chat
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMsg = { id: Date.now(), role: "user", text: userText };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    // AI Chatbot Troubleshooting Logic
    setTimeout(() => {
      let botReply = "I'm not quite sure about that. Could you provide a bit more detail about the issue you're facing?";
      const lowerInput = userText.toLowerCase();

      if (lowerInput.includes("upload") || lowerInput.includes("resume") || lowerInput.includes("pdf")) {
        botReply = "To upload a resume, log in as an Applicant. We accept PDF and Text files. If a PDF fails to parse, ensure it's not encrypted or a scanned image, as our AI needs readable text.";
      } else if (lowerInput.includes("job") || lowerInput.includes("company") || lowerInput.includes("post")) {
        botReply = "If you're a company, log into the Company Dashboard to post jobs. Ensure you list 'Required Skills' clearly (e.g., React, AWS) so our AI can match candidates accurately.";
      } else if (lowerInput.includes("score") || lowerInput.includes("match") || lowerInput.includes("rank")) {
        botReply = "Our AI calculates match scores based on a combination of Skill Overlap (50%), Experience Quality (30%), and Overall Strength (20%). If scores look wrong, check the job's required skills.";
      } else if (lowerInput.includes("error") || lowerInput.includes("bug") || lowerInput.includes("malfunction") || lowerInput.includes("not working")) {
        botReply = "I'm sorry you're encountering an error! Please try refreshing the page. If the system is unresponsive, clear your browser cache. For persistent issues, contact charlie.ponciano@email.lcup.edu.ph.";
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
        botReply = "Hello! How can I help you troubleshoot the Recruitment Hub today?";
      }

      setChatMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: botReply }]);
    }, 600);
  };

  const filteredJobs = useMemo(() => {
    if (!searchQueryJobs.trim()) return jobs;
    const query = searchQueryJobs.toLowerCase();
    return jobs.filter(job =>
      job.title?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query) ||
      job.requiredSkills?.some((skill: string) => skill.toLowerCase().includes(query))
    );
  }, [searchQueryJobs, jobs]);

  const rankedResumes = useMemo(() => {
    const selectedJob = jobs.find(job => job.id === selectedJobId);
    if (!selectedJob) return resumes;
    return [...resumes].sort((a, b) => calculateMatchScore(b, selectedJob) - calculateMatchScore(a, selectedJob));
  }, [resumes, selectedJobId, jobs]);

  const handleRefreshJobs = () => setJobs((prev) => [...prev]);
  const handleRefreshResumes = () => setResumes((prev) => [...prev]);
  const handleJobUpload = (job: any) => setJobs((prev) => [job, ...prev]);
  const handleResumeUpload = (resume: any) => setResumes((prev) => [resume, ...prev]);

  if (userType === "company") {
    return <CompanyDashboard onBack={() => setUserType(null)} onJobUpload={handleJobUpload} />;
  }

  if (userType === "applicant") {
    return <ApplicantDashboard onBack={() => setUserType(null)} onResumeUpload={handleResumeUpload} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex flex-col gap-6 px-8 py-8 lg:flex-row lg:items-center lg:justify-between">
        
        {/* LOGO AND BRANDING */}
        <div className="flex items-center gap-5 cursor-pointer" onClick={onBackToHome}>
          <Image 
            src="/Ailogo.png" 
            alt="AIdeal Job Logo" 
            width={64} 
            height={64} 
            className="object-contain w-16 h-16 shrink-0"
            priority
          />
          <div className="flex flex-col border-l-2 border-[var(--border)] pl-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">Aideal Recruit Hub</h1>
            <p className="mt-1 text-sm sm:text-base font-medium text-[var(--muted)] max-w-[360px] leading-snug">
              Hire smarter, not harder- let AI find the talent your business deserves
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--accent)]">{t.headerTitle}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setUserType("company")}
            className="rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#020617] transition hover:bg-[#8be0f4]"
          >
            Login as Company
          </button>
          <button
            onClick={() => setUserType("applicant")}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface)]/90"
          >
            Login as Applicant
          </button>
        </div>
      </div>

      <main className="grid gap-8 px-8 pb-8 xl:grid-cols-[1.25fr_0.95fr]">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-lg shadow-[var(--shadow)]">
          <div>
            <h2 className="text-3xl font-semibold">Company Jobs</h2>
            <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
              Jobs uploaded by hiring teams appear here, ready for AI candidate matching.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              value={searchQueryJobs}
              onChange={(e) => setSearchQueryJobs(e.target.value)}
              placeholder="Search jobs by title, description, or skills"
              className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-5 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
            <button className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#020617] transition hover:bg-[#8be0f4]">
              Search
            </button>
            <button
              onClick={handleRefreshJobs}
              className="rounded-full border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] transition hover:bg-[var(--surface)]/90"
              title="Refresh jobs"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
            </button>
          </div>

          <div className="mt-8 space-y-6">
            {filteredJobs.map((job) => (
              <article
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`cursor-pointer rounded-[1.75rem] border p-6 shadow-sm shadow-[var(--shadow)] transition hover:bg-[var(--surface)]/50 ${
                  selectedJobId === job.id
                    ? "border-[var(--accent)] bg-[var(--accent)]/5"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{job.description}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Environment</p>
                    <p className="mt-2 text-base font-semibold text-[var(--foreground)] break-words">{job.environment || "Not specified"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Monthly Pay</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--foreground)] break-words">
                      {job.monthlyPayMin && job.monthlyPayMax
                        ? `₱${formatCurrency(job.monthlyPayMin)} - ₱${formatCurrency(job.monthlyPayMax)}`
                        : "Not specified"}
                    </p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1 min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Required Skills</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {job.requiredSkills?.length > 0 ? (
                        job.requiredSkills.map((skill: string, i: number) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--border)] text-[var(--foreground)]">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--muted)]">None specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {filteredJobs.length === 0 && (
              <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-6 text-sm text-[var(--muted)]">
                No jobs match your search. Try another keyword.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-lg shadow-[var(--shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-semibold">
                {rightPanelView === "ranking" ? "Applicant Ranking" : "Job Detail"}
              </h2>
              <p className="mt-3 text-sm text-[var(--muted)]">
                {rightPanelView === "ranking" 
                  ? "Ranked applicants based on selected job match. Click a job on the left to rank applicants."
                  : "Detailed information about the selected job. Click a job on the left to view details."
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-full p-1">
                <button
                  onClick={() => setRightPanelView("ranking")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    rightPanelView === "ranking"
                      ? "bg-[var(--accent)] text-[#020617] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                  title="View Applicant Rankings"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 2l-4 4-4-4" />
                  </svg>
                  Rankings
                </button>
                <button
                  onClick={() => setRightPanelView("detail")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    rightPanelView === "detail"
                      ? "bg-[var(--accent)] text-[#020617] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                  title="View Job Details"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                  Details
                </button>
              </div>
              {rightPanelView === "ranking" && (
                <button
                  onClick={handleRefreshResumes}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--foreground)] transition hover:bg-[var(--surface)]/90"
                  title="Refresh resumes"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {rightPanelView === "ranking" ? (
            <div className="mt-8 space-y-6">
              {rankedResumes.map((resume, index) => {
                const selectedJob = jobs.find(job => job.id === selectedJobId);
                const matchScore = selectedJob ? calculateMatchScore(resume, selectedJob) : 0;
                return (
                  <article key={resume.id} className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm shadow-[var(--shadow)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{resume.name} <span className="text-sm text-[var(--muted)]">#{index + 1}</span></h3>
                        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{getResumeSummaryText(resume)}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <div className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                          Match Score {matchScore}%
                        </div>
                        <div className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                          Strength {resume.strengthScore ?? resume.strength}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Experience Quality</p>
                        <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{resume.experienceQuality ?? resume.experience}%</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Skills</p>
                        <p className="mt-2 text-sm text-[var(--foreground)]">{normalizeResumeSkills(resume.skills).join(", ")}</p>
                      </div>
                    </div>
                  </article>
                );
              })}

              {rankedResumes.length === 0 && (
                <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-6 text-sm text-[var(--muted)]">
                  {selectedJobId ? "No applicants available for this job." : "Click a job on the left to rank applicants."}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8">
              {selectedJobId ? (
                (() => {
                  const selectedJob = jobs.find(job => job.id === selectedJobId);
                  return selectedJob ? (
                    <div className="space-y-6">
                      <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-8 shadow-sm shadow-[var(--shadow)]">
                        <div className="flex flex-col gap-6">
                          <div>
                            <h3 className="text-2xl font-semibold text-[var(--foreground)]">{selectedJob.title}</h3>
                            <div className="mt-6">
                              <h4 className="text-lg font-semibold text-[var(--foreground)] mb-4">Job Description</h4>
                              <div className="prose prose-sm max-w-none text-[var(--foreground)] leading-relaxed">
                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
                                  <div className="whitespace-pre-line text-base leading-7">
                                    {selectedJob.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 flex flex-col min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 7h-3V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z" />
                                  <path d="M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
                                </svg>
                                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[var(--muted)]">Work Environment</p>
                              </div>
                              <p className="text-base font-medium text-[var(--foreground)] break-words leading-relaxed">{selectedJob.environment || "Not specified"}</p>
                            </div>
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 flex flex-col min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="1" x2="12" y2="23" />
                                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[var(--muted)]">Monthly Salary</p>
                              </div>
                              <p className="text-base font-medium text-[var(--foreground)] break-words leading-relaxed">
                                  {selectedJob.monthlyPayMin && selectedJob.monthlyPayMax
                                    ? `₱${formatCurrency(selectedJob.monthlyPayMin)} - ₱${formatCurrency(selectedJob.monthlyPayMax)}`
                                    : "Not specified"}
                              </p>
                            </div>
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 flex flex-col min-w-0 md:col-span-2 lg:col-span-1">
                              <div className="flex items-center gap-2 mb-2">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[var(--muted)]">Required Skills</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.requiredSkills?.length > 0 ? (
                                  selectedJob.requiredSkills.map((skill: string, index: number) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 whitespace-normal text-center">
                                      {skill}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-[var(--muted)]">None specified</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {selectedJob.interviewQuestions && selectedJob.interviewQuestions.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
                                </svg>
                                <h4 className="text-lg font-semibold text-[var(--foreground)]">Interview Questions</h4>
                              </div>
                              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
                                <div className="space-y-4">
                                  {selectedJob.interviewQuestions.slice(0, 5).map((question: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-6 h-6 bg-[var(--accent)] text-[#020617] rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                                        {index + 1}
                                      </div>
                                      <p className="text-sm text-[var(--foreground)] leading-relaxed">{question}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-6 text-sm text-[var(--muted)]">
                      Job not found.
                    </div>
                  );
                })()
              ) : (
                <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-6 text-sm text-[var(--muted)]">
                  Click a job on the left to view details.
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* FEATURED PARTNERS BANNER */}
      <div className="mx-8 mb-8 rounded-[2rem] bg-gradient-to-r from-cyan-500/10 via-[var(--surface)] to-[var(--background)] border border-cyan-500/20 p-8 shadow-lg transition-transform hover:-translate-y-1">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-xl xl:w-1/3 shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500">Featured Partners</h2>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Empowering Global Talent</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Join industry leaders who are actively shaping the future. Explore premier career opportunities and resources with our top trusted partners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full xl:w-2/3">
            <a
              href="https://www.intel.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] px-6 py-4 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[#0071c5] hover:text-[#0071c5]"
            >
              <span>Intel Inside - Built for AI</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <a
              href="https://www.nvidia.com/en-us/drivers/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] px-6 py-4 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[#76b900] hover:text-[#76b900]"
            >
              <span>NVIDIA Official Drivers</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <a
              href="https://www.tesla.com/en_PH"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] px-6 py-4 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-gray-400 hover:text-gray-400"
            >
              <span>Tesla Philippines</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <a
              href="https://www.amd.com/en/support"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] px-6 py-4 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[#ed1c24] hover:text-[#ed1c24]"
            >
              <span>AMD Processors & Graphics</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION WIDGETS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        
        {/* CHATBOT POPOVER */}
        {showChat && (
          <div className="w-80 h-[420px] flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-[var(--shadow)] animate-in fade-in slide-in-from-bottom-10 origin-bottom-right overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between bg-[var(--background)] px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <h3 className="text-[15px] font-bold text-[var(--foreground)]">AI Support Bot</h3>
              </div>
              <button onClick={() => setShowChat(false)} className="text-[var(--muted)] transition hover:text-[var(--foreground)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--surface)]">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user" 
                      ? "bg-[var(--accent)] text-[#020617] rounded-br-sm" 
                      : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--border)] bg-[var(--background)]">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Describe your issue..."
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-full pl-4 pr-10 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim()}
                  className="absolute right-1.5 top-1.5 p-1.5 rounded-full bg-[var(--accent)] text-[#020617] disabled:opacity-50 disabled:bg-[var(--muted)] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ABOUT US POPOVER */}
{showAbout && (
  <div className="w-80 md:w-96 max-h-[80vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl shadow-[var(--shadow)] animate-in fade-in slide-in-from-bottom-10 origin-bottom-right custom-scrollbar">
    
    {/* Popover Header */}
    <div className="mb-5 flex items-center justify-between sticky top-0 bg-[var(--surface)] pb-2 border-b border-[var(--border)]">
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <h3 className="text-lg font-bold text-[var(--foreground)]">Our Team</h3>
      </div>
      <button onClick={() => setShowAbout(false)} className="text-[var(--muted)] transition hover:text-[var(--foreground)] p-1 rounded-md hover:bg-[var(--border)]/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    {/* Team Members Directory List */}
    <div className="flex flex-col gap-5">
      {[
        { name: "Ralph Xaviery Joson", email: "ralphxaviery.joson@email.lcup.edu.ph", phone: "09625309970" },
        { name: "Jansen Ashley De Vera", email: "jansenashley.devera@email.lcup.edu.ph", phone: "09947495408" },
        { name: "James Dominic Ventura", email: "jamesdominic.ventura@email.lcup.edu.ph", phone: "09684188734" },
        { name: "Rainier Andrei Rodriguez", email: "rainierandrei.rodriguez@email.lcup.edu.ph", phone: "09626768096" },
        { name: "Charlie Ponciano", email: "charlie.ponciano@email.lcup.edu.ph", phone: "09098297670" }
      ].map((member, idx) => (
        <div key={idx} className="pb-4 border-b border-[var(--border)]/50 last:border-0 last:pb-0">
          {/* Member Name */}
          <h4 className="font-semibold text-[var(--foreground)] mb-2 text-sm">{member.name}</h4>
          
          <div className="flex flex-col gap-2 text-xs text-[var(--muted)]">
            
            {/* Phone Item - Opens Contact/Dialer */}
            <a 
              href={`tel:${member.phone}`} 
              className="flex items-center gap-2.5 transition-colors hover:text-[var(--foreground)] hover:underline group w-fit"
              title="Click to call or add to contacts"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>{member.phone}</span>
            </a>
            
            {/* Email Item - Opens Gmail/Mail client */}
            <a 
              href={`mailto:${member.email}`} 
              className="flex items-center gap-2.5 transition-colors text-[var(--muted)] hover:text-[var(--accent)] break-all hover:underline group w-fit"
              title="Click to compose an email"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>{member.email}</span>
            </a>

          </div>
        </div>
      ))}
    </div>

  </div>
)}

        <div className="flex flex-col gap-4">
          
          {/* CHATBOT WIDGET BUTTON */}
          <button
            onClick={toggleChat}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition hover:scale-105 ${
              showChat 
                ? "bg-[var(--accent)] text-[#020617] border-[var(--accent)]" 
                : "bg-[var(--surface)] text-[var(--accent)] border-[var(--border)] shadow-[var(--shadow)]"
            }`}
            aria-label="Toggle AI Chat Support"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>

          {/* ABOUT US TOGGLE BUTTON */}
          <button
            onClick={toggleAbout}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition hover:scale-105 ${
              showAbout 
                ? "bg-[var(--accent)] text-[#020617] border-[var(--accent)]" 
                : "bg-[var(--surface)] text-[var(--accent)] border-[var(--border)] shadow-[var(--shadow)]"
            }`}
            aria-label="Toggle About Us"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>

          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--icon)] shadow-lg shadow-[var(--shadow)] transition hover:scale-105"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyDashboard({ onBack, onJobUpload }: { onBack: () => void; onJobUpload: (job: any) => void }) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobEnvironment, setJobEnvironment] = useState("");
  const [jobMinPay, setJobMinPay] = useState("");
  const [jobMaxPay, setJobMaxPay] = useState("");
  const [uploadedJob, setUploadedJob] = useState<any>(null);

  const uploadJob = async () => {
    if (!jobTitle || !jobDescription || !jobSkills) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("jobTitle", jobTitle);
      formData.append("jobDescription", jobDescription);
      formData.append("jobSkills", jobSkills);
      formData.append("jobEnvironment", jobEnvironment);
      formData.append("jobMinPay", jobMinPay);
      formData.append("jobMaxPay", jobMaxPay);

      const response = await fetch("/api/upload-job", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Uploaded job:", result);
      setUploadedJob(result);
      onJobUpload(result);
    } catch (error) {
      console.error("Error uploading job:", error);
      alert("Failed to upload job. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <button onClick={onBack} className="mb-4 text-[var(--accent)] hover:text-[var(--accent)]/90">
        ← Back
      </button>
      
      {/* LOGO AND BRANDING */}
      <div className="flex items-center gap-5 mb-8">
        <Image 
          src="/Ailogo.png" 
          alt="AIdeal Job Logo" 
          width={64} 
          height={64} 
          className="object-contain w-16 h-16 shrink-0" 
          priority
        />
        <div className="flex flex-col border-l-2 border-[var(--border)] pl-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">Ai Recruitment Hub</h1>
          <p className="mt-1 text-sm font-medium text-[var(--muted)] max-w-[320px] leading-snug">
            Hire smarter, not harder- let AI find the talent your business deserves
          </p>
        </div>
      </div>
      
      <div className="space-y-6 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title</label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--foreground)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Required Skills</label>
            <input
              value={jobSkills}
              onChange={(e) => setJobSkills(e.target.value)}
              placeholder="React, TypeScript, AWS"
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--foreground)]"
            />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">Environment</label>
            <input
              value={jobEnvironment}
              onChange={(e) => setJobEnvironment(e.target.value)}
              placeholder="e.g., Remote, On-site, Hybrid"
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--foreground)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Min Pay / month</label>
            <input
              type="number"
              value={jobMinPay}
              onChange={(e) => setJobMinPay(e.target.value)}
              placeholder="e.g., 25000"
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--foreground)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Pay / month</label>
            <input
              type="number"
              value={jobMaxPay}
              onChange={(e) => setJobMaxPay(e.target.value)}
              placeholder="e.g., 45000"
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--foreground)]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            className="w-full bg-[var(--input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--foreground)]"
          />
        </div>
        <button
          onClick={uploadJob}
          className="bg-[var(--accent)] text-[#020617] px-6 py-2 rounded-lg font-semibold hover:bg-[#8be0f4]"
        >
          Upload Job Opening
        </button>
        {uploadedJob && (
          <div className="mt-6 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
            <h3 className="text-lg font-semibold">Uploaded Job</h3>
            <p className="mt-2 text-sm text-[var(--muted)] break-words">Title: {uploadedJob.title}</p>
            <p className="mt-1 text-sm text-[var(--muted)] break-words">Description: {uploadedJob.description}</p>
            <p className="mt-1 text-sm text-[var(--muted)] break-words">Environment: {uploadedJob.environment}</p>
            <p className="mt-1 text-sm text-[var(--muted)] break-words">
              Monthly Pay: {uploadedJob.monthlyPayMin && uploadedJob.monthlyPayMax
                ? `₱${formatCurrency(uploadedJob.monthlyPayMin)} - ₱${formatCurrency(uploadedJob.monthlyPayMax)}`
                : "Not specified"}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="text-sm text-[var(--muted)]">Required Skills: </span>
              {uploadedJob.requiredSkills?.map((skill: string, i: number) => (
                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-[var(--border)] text-[var(--muted)]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantDashboard({ onBack, onResumeUpload }: { onBack: () => void; onResumeUpload: (resume: any) => void }) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadedResume, setUploadedResume] = useState<any>(null);

  const resumeSkills = uploadedResume ? normalizeResumeSkills(uploadedResume.skills) : [];

  const skillMatchPercent = uploadedResume
    ? Math.min(
        100,
        Math.round(
          resumeSkills.length * 8 + (uploadedResume.experienceQuality ?? 0) * 0.15 +
            (uploadedResume.strengths?.length ?? 0) * 4
        )
      )
    : 0;
  const contextFitPercent = uploadedResume
    ? Math.min(100, Math.round((uploadedResume.experienceQuality ?? 0) * 0.95 + (uploadedResume.strengthScore ?? 0) * 0.05))
    : 0;
  const experiencePercent = uploadedResume?.experienceQuality ?? 0;

  const uploadResume = async () => {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append("resume", resumeFile);

    if (resumeFile.type === "application/pdf" || resumeFile.name.toLowerCase().endsWith(".pdf")) {
      try {
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
        GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        const arrayBuffer = await resumeFile.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => (item.str ? item.str : "")).join(" ");
          text += pageText + "\n";
        }
        formData.append("text", text);
      } catch (error) {
        alert(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }

    const response = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    setUploadedResume(result);
    onResumeUpload(result);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <button onClick={onBack} className="mb-4 text-[var(--accent)] hover:text-[var(--accent)]/90">
        ← Back
      </button>

      {/* LOGO AND BRANDING */}
      <div className="flex items-center gap-5 mb-8">
        <Image 
          src="/Ailogo.png" 
          alt="AIdeal Job Logo" 
          width={64} 
          height={64} 
          className="object-contain w-16 h-16 shrink-0" 
          priority
        />
        <div className="flex flex-col border-l-2 border-[var(--border)] pl-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">Ai Recruitment Hub</h1>
          <p className="mt-1 text-sm font-medium text-[var(--muted)] max-w-[320px] leading-snug">
            Hire smarter, not harder- let AI find the talent your business deserves
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">Upload Resume (PDF or Text)</label>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className="w-full bg-[var(--input)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--foreground)] file:bg-[var(--accent)] file:text-[#020617] file:px-3 file:py-1 file:rounded file:border-0"
          />
          <p className="text-xs text-[var(--muted)] mt-1">PDF files will be parsed automatically. Text files are also supported.</p>
        </div>
        <button
          onClick={uploadResume}
          className="bg-[var(--accent)] text-[#020617] px-6 py-2 rounded-lg font-semibold hover:bg-[#8be0f4]"
        >
          Upload Resume
        </button>
        {uploadedResume && (
          <div className="mt-6 rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] p-6 shadow-lg shadow-[var(--shadow)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold">Resume AI Insights</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">Detailed candidate metrics based on resume analysis.</p>
              </div>
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                  uploadedResume.strengthScore > 80
                    ? "bg-emerald-500/20 text-emerald-300"
                    : uploadedResume.strengthScore > 60
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {uploadedResume.strengthScore > 70 ? "Good Match" : "Potential Match"}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-[var(--background)] p-4">
                <p className="text-sm text-[var(--muted)]">AI Fit Score</p>
                <p className="mt-3 text-3xl font-bold text-cyan-400">{uploadedResume.strengthScore}/100</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${uploadedResume.strengthScore}%` }} />
                </div>
              </div>
              <div className="rounded-3xl bg-[var(--background)] p-4">
                <p className="text-sm text-[var(--muted)]">Experience Quality</p>
                <p className="mt-3 text-3xl font-bold text-emerald-300">{experiencePercent}%</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-emerald-300" style={{ width: `${experiencePercent}%` }} />
                </div>
              </div>
              <div className="rounded-3xl bg-[var(--background)] p-4">
                <p className="text-sm text-[var(--muted)]">Skill Match</p>
                <p className="mt-3 text-3xl font-bold text-amber-300">{skillMatchPercent}%</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-amber-300" style={{ width: `${skillMatchPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 text-sm text-[var(--muted)]">
              <div className="rounded-3xl bg-[var(--background)] p-4">
                <p className="uppercase tracking-[0.2em]">Context Fit</p>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{contextFitPercent}%</p>
              </div>
              <div className="rounded-3xl bg-[var(--background)] p-4">
                <p className="uppercase tracking-[0.2em]">Skills Identified</p>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{resumeSkills.length}</p>
              </div>
              <div className="rounded-3xl bg-[var(--background)] p-4">
                <p className="uppercase tracking-[0.2em]">Career Trajectory</p>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{uploadedResume.careerTrajectory ? "Analyzed" : "Unknown"}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <div>
                <p className="text-sm text-[var(--muted)] mb-2">Key Strengths</p>
                <div className="flex flex-wrap gap-2">
                  {(uploadedResume.strengths || []).map((strength: string, index: number) => (
                    <span key={index} className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {resumeSkills.map((skill: string, index: number) => (
                    <span key={index} className="rounded-full bg-slate-700 px-3 py-1 text-xs text-[var(--foreground)]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
