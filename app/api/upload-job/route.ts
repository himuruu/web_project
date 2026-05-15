import { NextRequest, NextResponse } from "next/server";
import { data } from "../../../lib/data";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const jobTitle = formData.get("jobTitle") as string;
    const jobDescription = formData.get("jobDescription") as string;
    const jobSkills = formData.get("jobSkills") as string;
    const jobEnvironment = formData.get("jobEnvironment") as string;
    const jobMinPay = formData.get("jobMinPay") as string;
    const jobMaxPay = formData.get("jobMaxPay") as string;

    // Extract job details using AI-like logic
    const jobDetails = extractJobDetails(jobTitle, jobDescription, jobSkills, jobEnvironment, jobMinPay, jobMaxPay);

    const job = {
      id: Date.now().toString(),
      title: jobTitle,
      description: jobDescription,
      ...jobDetails,
      interviewQuestions: generateInterviewQuestions(jobDetails),
    };

    data.jobs.push(job);

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error uploading job:", error);
    return NextResponse.json({ error: "Failed to upload job" }, { status: 500 });
  }
}

function extractJobDetails(
  title: string,
  description: string,
  skills: string,
  workEnvironment: string = "",
  workMinPay: string = "",
  workMaxPay: string = ""
) {
  const environment = workEnvironment?.trim() || "Not specified";
  const monthlyPayMin = Number(workMinPay);
  const monthlyPayMax = Number(workMaxPay);

  const requiredSkills = skills
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const skillWeights: { [key: string]: number } = {};
  requiredSkills.forEach(skill => skillWeights[skill] = 3);

  return {
    environment,
    requiredSkills,
    skillWeights,
    monthlyPayMin: Number.isFinite(monthlyPayMin) && monthlyPayMin > 0 ? monthlyPayMin : null,
    monthlyPayMax: Number.isFinite(monthlyPayMax) && monthlyPayMax > 0 ? monthlyPayMax : null,
  };
}

function generateInterviewQuestions(jobDetails: any) {
  const questions = [];

  jobDetails.requiredSkills.forEach((skill: string) => {
    questions.push(`Can you walk me through your experience with ${skill}?`);
    questions.push(`What challenges have you faced when working with ${skill}?`);
  });

  questions.push("Tell us about a recent project you're proud of.");

  const envQuestions = {
    frontend: ["How do you optimize frontend performance?", "Describe your experience with responsive design."],
    backend: ["How do you design scalable APIs?", "Describe your experience with database optimization."],
    fullstack: ["How do you coordinate between frontend and backend teams?", "Describe your full-stack development process."],
    devops: ["How do you implement CI/CD pipelines?", "Describe your experience with infrastructure as code."],
    mobile: ["How do you optimize mobile app performance?", "Describe your experience with app store deployments."],
  };

  const normalizedEnvironment = String(jobDetails.environment || "").toLowerCase();
  if (normalizedEnvironment in envQuestions) {
    questions.push(...envQuestions[normalizedEnvironment as keyof typeof envQuestions]);
  } else {
    questions.push(
      "How does this environment shape your approach to team collaboration?",
      "What tools or processes do you use to stay productive in this working environment?"
    );
  }

  return questions.slice(0, 10);
}