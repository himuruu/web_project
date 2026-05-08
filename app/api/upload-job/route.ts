import { NextRequest, NextResponse } from "next/server";
import { data } from "../../../lib/data";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const jobTitle = formData.get("jobTitle") as string;
    const jobDescription = formData.get("jobDescription") as string;
    const jobSkills = formData.get("jobSkills") as string;

    // Extract job details using AI-like logic
    const jobDetails = extractJobDetails(jobTitle, jobDescription, jobSkills);

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

function extractJobDetails(title: string, description: string, skills: string) {
  const seniorityKeywords = {
    junior: ["junior", "entry", "beginner", "0-2 years", "1-3 years"],
    mid: ["mid", "intermediate", "3-5 years", "4-6 years"],
    senior: ["senior", "lead", "principal", "7+ years", "5+ years"],
  };

  const environmentKeywords = {
    frontend: ["react", "vue", "angular", "javascript", "typescript", "html", "css"],
    backend: ["node", "python", "java", "go", "ruby", "api", "database"],
    fullstack: ["full stack", "full-stack", "mern", "mean"],
    devops: ["docker", "kubernetes", "aws", "azure", "ci/cd", "jenkins"],
    mobile: ["react native", "flutter", "ios", "android", "swift", "kotlin"],
  };

  const allText = `${title} ${description} ${skills}`.toLowerCase();

  // Determine seniority
  let seniority = "mid";
  if (seniorityKeywords.junior.some(k => allText.includes(k))) seniority = "junior";
  if (seniorityKeywords.senior.some(k => allText.includes(k))) seniority = "senior";

  // Determine environment
  let environment = "fullstack";
  for (const [env, keywords] of Object.entries(environmentKeywords)) {
    if (keywords.some(k => allText.includes(k))) {
      environment = env;
      break;
    }
  }

  // Parse skills
  const skillList = skills.split(",").map(s => s.trim().toLowerCase());
  const requiredSkills = skillList.slice(0, Math.ceil(skillList.length / 2));
  const optionalSkills = skillList.slice(Math.ceil(skillList.length / 2));

  // Weight skills based on context
  const skillWeights: { [key: string]: number } = {};
  requiredSkills.forEach(skill => skillWeights[skill] = 3);
  optionalSkills.forEach(skill => skillWeights[skill] = 1);

  return {
    seniority,
    environment,
    requiredSkills,
    optionalSkills,
    skillWeights,
  };
}

function generateInterviewQuestions(jobDetails: any) {
  const questions = [];

  // Technical questions based on skills
  jobDetails.requiredSkills.forEach((skill: string) => {
    questions.push(`Can you walk me through your experience with ${skill}?`);
    questions.push(`What challenges have you faced when working with ${skill}?`);
  });

  // Behavioral questions based on seniority
  if (jobDetails.seniority === "junior") {
    questions.push("How do you approach learning new technologies?");
    questions.push("Describe a time when you received constructive feedback.");
  } else if (jobDetails.seniority === "mid") {
    questions.push("How do you mentor junior developers?");
    questions.push("Describe a technical decision you made and its impact.");
  } else {
    questions.push("How do you lead technical architecture decisions?");
    questions.push("Describe how you've scaled a system or team.");
  }

  // Environment-specific questions
  const envQuestions = {
    frontend: ["How do you optimize frontend performance?", "Describe your experience with responsive design."],
    backend: ["How do you design scalable APIs?", "Describe your experience with database optimization."],
    fullstack: ["How do you coordinate between frontend and backend teams?", "Describe your full-stack development process."],
    devops: ["How do you implement CI/CD pipelines?", "Describe your experience with infrastructure as code."],
    mobile: ["How do you optimize mobile app performance?", "Describe your experience with app store deployments."],
  };

  questions.push(...envQuestions[jobDetails.environment as keyof typeof envQuestions]);

  return questions.slice(0, 10); // Limit to 10 questions
}