"use client";

import { useState } from "react";

export default function Home() {
  const [userType, setUserType] = useState<"company" | "applicant" | null>(null);

  if (userType === "company") {
    return <CompanyDashboard onBack={() => setUserType(null)} />;
  }

  if (userType === "applicant") {
    return <ApplicantDashboard onBack={() => setUserType(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">AI Recruitment Hub</h1>
          <p className="mt-2 text-slate-400">Advanced AI-powered recruitment platform</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => setUserType("company")}
            className="w-full bg-cyan-500 text-slate-950 py-3 px-4 rounded-lg font-semibold hover:bg-cyan-400 transition"
          >
            Login as Company
          </button>
          <button
            onClick={() => setUserType("applicant")}
            className="w-full bg-slate-700 text-slate-100 py-3 px-4 rounded-lg font-semibold hover:bg-slate-600 transition"
          >
            Login as Applicant
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyDashboard({ onBack }: { onBack: () => void }) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [uploadedJob, setUploadedJob] = useState<any>(null);
  const [matchedCandidates, setMatchedCandidates] = useState<any[]>([]);

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
  };

  const matchCandidates = async () => {
    if (!uploadedJob) return;
    const response = await fetch("/api/match-candidates", {
      method: "POST",
      body: JSON.stringify({ jobId: uploadedJob.id }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    setMatchedCandidates(result.candidates);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <button onClick={onBack} className="mb-4 text-cyan-400 hover:text-cyan-300">← Back</button>
      <h1 className="text-3xl font-bold mb-8">Company Dashboard</h1>
      <div className="space-y-6 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title</label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Required Skills (comma-separated)</label>
            <input
              value={jobSkills}
              onChange={(e) => setJobSkills(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
          />
        </div>
        <button
          onClick={uploadJob}
          className="bg-cyan-500 text-slate-950 px-6 py-2 rounded-lg font-semibold hover:bg-cyan-400"
        >
          Upload Job Opening
        </button>
        {uploadedJob && (
          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            <h3 className="text-lg font-semibold">Job Uploaded</h3>
            <p>Title: {uploadedJob.title}</p>
            <p>Seniority: {uploadedJob.seniority}</p>
            <p>Environment: {uploadedJob.environment}</p>
            <p>Required Skills: {uploadedJob.requiredSkills.join(", ")}</p>
            <p>Optional Skills: {uploadedJob.optionalSkills.join(", ")}</p>
            <button
              onClick={matchCandidates}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400"
            >
              Match Candidates
            </button>
          </div>
        )}
        {matchedCandidates.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">AI-Matched Candidates</h3>
            {matchedCandidates.map((candidate, idx) => (
              <div key={idx} className="p-6 bg-slate-800 rounded-lg mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{candidate.name}</h4>
                    <p className="text-slate-400">Overall Score: {candidate.overallScore}/100</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    candidate.overallScore > 80 ? 'bg-green-500/20 text-green-300' :
                    candidate.overallScore > 60 ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {candidate.recommendation}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mb-4">
                  <div>
                    <p className="text-sm text-slate-400">Skill Match</p>
                    <p className="text-lg font-semibold text-cyan-400">{candidate.skillMatchScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Context Fit</p>
                    <p className="text-lg font-semibold text-cyan-400">{candidate.contextFit}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Experience Relevance</p>
                    <p className="text-lg font-semibold text-cyan-400">{candidate.experienceRelevance}%</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">Key Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.keyStrengths.map((strength: string, i: number) => (
                      <span key={i} className="bg-cyan-500/10 text-cyan-300 px-2 py-1 rounded text-sm">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>

                {candidate.skillGaps.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-2">Skill Gaps</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skillGaps.map((gap: string, i: number) => (
                        <span key={i} className="bg-red-500/10 text-red-300 px-2 py-1 rounded text-sm">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">AI Explanation</p>
                  <p className="text-slate-300">{candidate.explanation}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Personalized Interview Questions</p>
                  <ul className="space-y-2">
                    {candidate.interviewQuestions.slice(0, 3).map((question: string, i: number) => (
                      <li key={i} className="text-slate-300 text-sm">• {question}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantDashboard({ onBack }: { onBack: () => void }) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadedResume, setUploadedResume] = useState<any>(null);

  const uploadResume = async () => {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append("resume", resumeFile);

    // If PDF, extract text client-side
    if (resumeFile.type === "application/pdf" || resumeFile.name.toLowerCase().endsWith(".pdf")) {
      try {
        console.log("Starting PDF parsing...");
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
        
        // Set worker source to local file
        GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        console.log("Worker source set:", GlobalWorkerOptions.workerSrc);
        
        const arrayBuffer = await resumeFile.arrayBuffer();
        console.log("PDF file loaded, size:", arrayBuffer.byteLength);
        
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        console.log("PDF document loaded, pages:", pdf.numPages);
        
        let text = "";
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          console.log(`Processing page ${pageNumber}/${pdf.numPages}`);
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => (item.str ? item.str : "")).join(" ");
          text += pageText + "\n";
          console.log(`Page ${pageNumber} text length:`, pageText.length);
        }
        
        console.log("PDF parsing complete, total text length:", text.length);
        formData.append("text", text);
      } catch (error) {
        console.error("PDF parsing error:", error);
        alert(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try uploading a text file instead.`);
        return;
      }
    }

    const response = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    setUploadedResume(result);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <button onClick={onBack} className="mb-4 text-cyan-400 hover:text-cyan-300">← Back</button>
      <h1 className="text-3xl font-bold mb-8">Applicant Dashboard</h1>
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">Upload Resume (PDF or Text)</label>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white file:bg-cyan-500 file:text-slate-950 file:px-3 file:py-1 file:rounded file:border-0"
          />
          <p className="text-xs text-slate-400 mt-1">PDF files will be parsed automatically. Text files are also supported.</p>
        </div>
        <button
          onClick={uploadResume}
          className="bg-cyan-500 text-slate-950 px-6 py-2 rounded-lg font-semibold hover:bg-cyan-400"
        >
          Upload Resume
        </button>
        {uploadedResume && (
          <div className="mt-6 p-6 bg-slate-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">AI Resume Analysis</h3>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div>
                <p className="text-sm text-slate-400">Strength Score</p>
                <p className="text-2xl font-bold text-cyan-400">{uploadedResume.strengthScore}/100</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Experience Quality</p>
                <p className="text-2xl font-bold text-cyan-400">{uploadedResume.experienceQuality}/100</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Technical Skills</p>
              <div className="flex flex-wrap gap-2">
                {uploadedResume.skills.technical.map((skill: string, i: number) => (
                  <span key={i} className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Soft Skills</p>
              <div className="flex flex-wrap gap-2">
                {uploadedResume.skills.soft.map((skill: string, i: number) => (
                  <span key={i} className="bg-green-500/10 text-green-300 px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Inferred Strengths</p>
              <div className="flex flex-wrap gap-2">
                {uploadedResume.strengths.map((strength: string, i: number) => (
                  <span key={i} className="bg-purple-500/10 text-purple-300 px-2 py-1 rounded text-sm">
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">Career Trajectory Insight</p>
              <p className="text-slate-300">{uploadedResume.careerTrajectory}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
