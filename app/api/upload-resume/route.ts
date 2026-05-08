import { NextRequest, NextResponse } from "next/server";
import { data } from "../../../lib/data";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File;
    const text = formData.get("text") as string;

    let resumeText = text;
    if (!resumeText && resumeFile) {
      // If no text provided and it's a text file, read it
      if (resumeFile.type === "text/plain") {
        resumeText = await resumeFile.text();
      } else if (resumeFile.type === "application/pdf") {
        return NextResponse.json({ error: "PDF text extraction failed. Please ensure the PDF contains selectable text." }, { status: 400 });
      } else {
        return NextResponse.json({ error: "Unsupported file type. Please upload a PDF or text file." }, { status: 400 });
      }
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ error: "No resume text found. Please ensure your file contains readable text." }, { status: 400 });
    }

    // Extract resume information using AI-like logic
    const resumeAnalysis = analyzeResume(resumeText);

    const resume = {
      id: Date.now().toString(),
      text: resumeText,
      ...resumeAnalysis,
    };

    data.resumes.push(resume);

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 });
  }
}

function analyzeResume(text: string) {
  const lowerText = text.toLowerCase();

  // Extract skills
  const skills = extractSkills(lowerText);

  // Detect experience quality
  const experienceQuality = detectExperienceQuality(lowerText);

  // Infer strengths
  const strengths = inferStrengths(lowerText, skills);

  // Calculate strength score
  const strengthScore = calculateStrengthScore(skills, experienceQuality, strengths);

  // Generate career trajectory insight
  const careerTrajectory = generateCareerTrajectory(lowerText);

  return {
    name: extractName(text),
    skills,
    experienceQuality,
    strengths,
    strengthScore,
    careerTrajectory,
  };
}

function extractName(text: string): string {
  // Simple name extraction - first line or first few words
  const lines = text.split('\n').filter(line => line.trim());
  const firstLine = lines[0]?.trim();
  if (firstLine && firstLine.length < 50) return firstLine;
  return "Anonymous Candidate";
}

function extractSkills(text: string) {
  const technicalSkills = [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "php",
    "react", "vue", "angular", "node.js", "express", "django", "flask", "spring",
    "html", "css", "sass", "tailwind", "bootstrap",
    "sql", "mysql", "postgresql", "mongodb", "redis",
    "docker", "kubernetes", "aws", "azure", "gcp",
    "git", "linux", "bash", "powershell"
  ];

  const softSkills = [
    "leadership", "communication", "teamwork", "problem-solving", "analytical",
    "project management", "agile", "scrum", "time management", "mentoring",
    "collaboration", "creativity", "adaptability", "critical thinking"
  ];

  const foundTechnical = technicalSkills.filter(skill => text.includes(skill));
  const foundSoft = softSkills.filter(skill => text.includes(skill));

  return {
    technical: foundTechnical,
    soft: foundSoft,
  };
}

function detectExperienceQuality(text: string): number {
  let score = 50; // Base score

  // Keywords indicating high quality experience
  const highQualityKeywords = [
    "architect", "principal", "staff", "senior", "lead", "manager",
    "phd", "masters", "bachelor", "certified", "aws certified", "google cloud",
    "published", "patent", "conference", "speaker", "mentor",
    "scalable", "high-performance", "enterprise", "production",
    "million users", "thousands", "complex systems"
  ];

  // Keywords indicating lower quality experience
  const lowQualityKeywords = [
    "intern", "junior", "entry", "trainee", "bootcamp", "self-taught only",
    "no experience", "learning", "beginner"
  ];

  highQualityKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 5;
  });

  lowQualityKeywords.forEach(keyword => {
    if (text.includes(keyword)) score -= 3;
  });

  // Experience duration indicators
  if (text.includes("10+ years") || text.includes("15+ years")) score += 15;
  else if (text.includes("5-10 years") || text.includes("7+ years")) score += 10;
  else if (text.includes("3-5 years")) score += 5;
  else if (text.includes("1-3 years")) score += 2;

  return Math.max(0, Math.min(100, score));
}

function inferStrengths(text: string, skills: any): string[] {
  const strengths = [];

  // Technical strengths
  if (skills.technical.length > 5) strengths.push("Strong technical foundation");
  if (skills.technical.some((s: string) => ["react", "vue", "angular"].includes(s))) strengths.push("Frontend expertise");
  if (skills.technical.some((s: string) => ["node.js", "python", "java"].includes(s))) strengths.push("Backend development");
  if (skills.technical.some((s: string) => ["docker", "kubernetes", "aws"].includes(s))) strengths.push("DevOps/Cloud experience");

  // Experience-based strengths
  if (text.includes("team") && text.includes("lead")) strengths.push("Team leadership");
  if (text.includes("mentor") || text.includes("mentoring")) strengths.push("Mentoring experience");
  if (text.includes("architect") || text.includes("architecture")) strengths.push("System architecture");
  if (text.includes("performance") && text.includes("optimization")) strengths.push("Performance optimization");

  // Soft skills
  if (skills.soft.includes("leadership")) strengths.push("Leadership skills");
  if (skills.soft.includes("communication")) strengths.push("Strong communication");
  if (skills.soft.includes("problem-solving")) strengths.push("Problem-solving ability");

  return strengths.slice(0, 5); // Limit to top 5
}

function calculateStrengthScore(skills: any, experienceQuality: number, strengths: string[]): number {
  const skillScore = Math.min(100, (skills.technical.length + skills.soft.length) * 5);
  const strengthMultiplier = strengths.length > 3 ? 1.2 : 1.0;

  return Math.round((skillScore + experienceQuality) / 2 * strengthMultiplier);
}

function generateCareerTrajectory(text: string): string {
  const lines = text.split('\n');
  const experienceLines = lines.filter(line =>
    line.toLowerCase().includes('experience') ||
    line.toLowerCase().includes('worked') ||
    line.toLowerCase().includes('developer') ||
    line.toLowerCase().includes('engineer') ||
    /\d{4}/.test(line) // Contains years
  );

  if (experienceLines.length === 0) {
    return "Career trajectory shows consistent growth in software development roles.";
  }

  // Simple analysis - look for progression patterns
  const hasSenior = text.toLowerCase().includes('senior');
  const hasLead = text.toLowerCase().includes('lead') || text.toLowerCase().includes('principal');
  const hasManager = text.toLowerCase().includes('manager');

  if (hasManager) {
    return "Career shows progression from developer to management roles, indicating strong leadership growth.";
  } else if (hasLead || hasSenior) {
    return "Career demonstrates advancement to senior technical roles with increasing responsibility.";
  } else {
    return "Career shows solid foundation in development with potential for further advancement.";
  }
}