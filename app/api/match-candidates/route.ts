import { NextRequest, NextResponse } from "next/server";
import { data } from "../../../lib/data";

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();
    const job = data.jobs.find(j => j.id === jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Match candidates using AI-like logic
    const candidates = data.resumes.map(resume => {
      const skillMatchScore = calculateSkillMatchScore(resume, job);
      const contextFit = calculateContextFit(resume, job);
      const experienceRelevance = calculateExperienceRelevance(resume, job);

      const overallScore = Math.round((skillMatchScore + contextFit + experienceRelevance) / 3);

      const skillGaps = identifySkillGaps(resume, job);
      const explanation = generateMatchExplanation(resume, job, skillMatchScore, contextFit, experienceRelevance);
      const interviewQuestions = getInterviewSuggestion(job, resume);

      let recommendation = "Consider";
      if (overallScore > 80) recommendation = "Strong Match";
      else if (overallScore > 60) recommendation = "Good Match";
      else if (overallScore > 40) recommendation = "Potential Match";
      else recommendation = "Not Recommended";

      return {
        id: resume.id,
        name: resume.name,
        overallScore,
        skillMatchScore,
        contextFit,
        experienceRelevance,
        keyStrengths: resume.strengths.slice(0, 3),
        skillGaps,
        explanation,
        interviewQuestions,
        recommendation,
      };
    });

    // Sort by overall score descending
    candidates.sort((a, b) => b.overallScore - a.overallScore);

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("Error matching candidates:", error);
    return NextResponse.json({ error: "Failed to match candidates" }, { status: 500 });
  }
}

function calculateSkillMatchScore(resume: any, job: any): number {
  const resumeSkills = [...resume.skills.technical, ...resume.skills.soft].map(s => s.toLowerCase());
  const jobRequiredSkills = job.requiredSkills.map((s: string) => s.toLowerCase());

  let score = 0;
  let totalWeight = 0;

  jobRequiredSkills.forEach((skill: string) => {
    totalWeight += 3;
    if (resumeSkills.some((rs: string) => rs.includes(skill) || skill.includes(rs))) {
      score += 3;
    }
  });

  return totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
}

function calculateContextFit(resume: any, job: any): number {
  let score = 50; // Base score

  const environmentKeywords = {
    frontend: ["frontend", "ui", "ux", "react", "vue", "angular", "css", "html"],
    backend: ["backend", "api", "server", "database", "node", "python", "java"],
    fullstack: ["fullstack", "full-stack", "mern", "mean"],
    devops: ["devops", "infrastructure", "cloud", "docker", "kubernetes"],
    mobile: ["mobile", "ios", "android", "react native", "flutter"],
  };

  const resumeText = resume.text.toLowerCase();
  const normalizedEnvironment = String(job.environment || "").toLowerCase().trim();
  const jobEnvKeywords = environmentKeywords[normalizedEnvironment as keyof typeof environmentKeywords] || [];

  let envMatches = jobEnvKeywords.filter((keyword: string) => resumeText.includes(keyword)).length;
  if (!jobEnvKeywords.length && normalizedEnvironment && normalizedEnvironment !== "not specified") {
    envMatches += resumeText.includes(normalizedEnvironment) ? 1 : 0;
    const fallbackKeywords = ["remote", "on-site", "onsite", "hybrid", "office"];
    envMatches += fallbackKeywords.filter(keyword => normalizedEnvironment.includes(keyword) && resumeText.includes(keyword)).length;
  }

  score += Math.min(envMatches * 5, 20);

  return Math.max(0, Math.min(100, score));
}

function calculateExperienceRelevance(resume: any, job: any): number {
  let score = resume.experienceQuality;

  const relevantKeywords = [
    ...job.requiredSkills,
    ...(job.environment && job.environment !== "Not specified" ? [job.environment] : []),
  ];

  const resumeText = resume.text.toLowerCase();
  const keywordMatches = relevantKeywords.filter((keyword: string) =>
    resumeText.includes(keyword.toLowerCase())
  ).length;

  score += Math.min(keywordMatches * 3, 15);

  return Math.max(0, Math.min(100, score));
}

function identifySkillGaps(resume: any, job: any): string[] {
  const resumeSkills = [...resume.skills.technical, ...resume.skills.soft].map(s => s.toLowerCase());
  const allJobSkills = [...job.requiredSkills].map((s: string) => s.toLowerCase());

  return allJobSkills.filter(jobSkill =>
    !resumeSkills.some(resumeSkill =>
      resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)
    )
  );
}

function generateMatchExplanation(resume: any, job: any, skillMatch: number, contextFit: number, experienceRelevance: number): string {
  const explanations = [];

  if (skillMatch > 80) {
    explanations.push("Excellent skill alignment with job requirements");
  } else if (skillMatch > 60) {
    explanations.push("Good skill match with some gaps that can be addressed");
  } else {
    explanations.push("Significant skill gaps that may require training");
  }

  if (contextFit > 80) {
    explanations.push("Strong contextual fit for the role and company environment");
  } else if (contextFit > 60) {
    explanations.push("Reasonable contextual alignment");
  } else {
    explanations.push("Contextual fit may need evaluation");
  }

  if (experienceRelevance > 80) {
    explanations.push("Experience level is well aligned with the role");
  } else if (experienceRelevance > 60) {
    explanations.push("Experience level is appropriate for the role");
  } else {
    explanations.push("Experience level may not fully meet requirements");
  }

  return explanations.join(". ") + ".";
}

function getInterviewSuggestion(job: any, resume: any): string[] {
  const questions = [];

  // Technical questions based on matched skills
  const matchedSkills = [...resume.skills.technical, ...resume.skills.soft].filter(skill =>
    job.requiredSkills.some((js: string) => js.toLowerCase().includes(skill.toLowerCase()))
  );

  matchedSkills.slice(0, 2).forEach(skill => {
    questions.push(`Can you walk me through a project where you used ${skill}?`);
  });

  // Experience-based questions
  if (resume.experienceQuality > 70) {
    questions.push("Describe a challenging technical problem you solved and its impact.");
  } else {
    questions.push("How do you approach learning new technologies?");
  }

  // Behavioral questions based on job environment
  const behavioralQuestions = {
    frontend: "How do you ensure your code works across different browsers and devices?",
    backend: "How do you approach database design and optimization?",
    fullstack: "How do you coordinate between frontend and backend development?",
    devops: "Describe your experience with deployment and monitoring.",
    mobile: "How do you handle platform-specific challenges in mobile development?",
  };

  questions.push(behavioralQuestions[job.environment as keyof typeof behavioralQuestions] || "Tell us about a recent project you're proud of.");

  // Culture fit question
  questions.push("What type of work environment helps you perform at your best?");

  return questions.slice(0, 5);
}