"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function Home() {
  const [userType, setUserType] = useState<"company" | "applicant" | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [jobs, setJobs] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryJobs, setSearchQueryJobs] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") as "dark" | "light" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
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

  const handleRefreshJobs = () => {
    setJobs((prev) => [...prev]);
  };

  const handleRefreshResumes = () => {
    setResumes((prev) => [...prev]);
  };

  const handleJobUpload = (job: any) => {
    setJobs((prev) => [job, ...prev]);
  };

  const handleResumeUpload = (resume: any) => {
    setResumes((prev) => [resume, ...prev]);
  };

  if (userType === "company") {
    return (
      <CompanyDashboard
        onBack={() => setUserType(null)}
        onJobUpload={handleJobUpload}
      />
    );
  }

  if (userType === "applicant") {
    return (
      <ApplicantDashboard
        onBack={() => setUserType(null)}
        onResumeUpload={handleResumeUpload}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex flex-col gap-6 px-8 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold">AI Recruitment Hub</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Advanced AI-powered recruitment platform</p>
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

      <main className="grid gap-8 px-8 pb-12 xl:grid-cols-[1.25fr_0.95fr]">
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
                  <div className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                    {job.seniority || "Not specified"}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Environment</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{job.environment || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Required Skills</p>
                    <p className="mt-2 text-sm text-[var(--foreground)]">{job.requiredSkills?.join(", ") || "None specified"}</p>
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
          <div>
            <h2 className="text-3xl font-semibold">Applicant Ranking</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Ranked applicants based on selected job match. Click a job on the left to rank applicants.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
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
          </div>

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
        </section>
      </main>

      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--icon)] shadow-lg shadow-[var(--shadow)] transition hover:scale-105"
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
  );
}

function CompanyDashboard({ onBack, onJobUpload }: { onBack: () => void; onJobUpload: (job: any) => void }) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [uploadedJob, setUploadedJob] = useState<any>(null);

  const uploadJob = async () => {
    const formData = new FormData();
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);
    formData.append("jobSkills", jobSkills);

    const response = await fetch("/api/upload-job", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    setUploadedJob(result);
    onJobUpload(result);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <button onClick={onBack} className="mb-4 text-[var(--accent)] hover:text-[var(--accent)]/90">
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-8">Company Dashboard</h1>
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
            <p className="mt-2 text-sm text-[var(--muted)]">Title: {uploadedJob.title}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Seniority: {uploadedJob.seniority}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Environment: {uploadedJob.environment}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Required Skills: {uploadedJob.requiredSkills?.join(", ")}</p>
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
      <h1 className="text-3xl font-bold mb-8">Applicant Dashboard</h1>
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
