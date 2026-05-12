"use client";

import { useState } from "react";
import Image from "next/image";
import Dashboard from "./dashboard";

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <Dashboard onBackToHome={() => setShowDashboard(false)} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <Image 
            src="/Ailogo.png" 
            alt="AIdeal Job Logo" 
            width={120} 
            height={40} 
            className="object-contain"
            priority
          />
          <span className="text-lg font-semibold hidden sm:inline">Ai Recruitment Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDashboard(true)}
            className="rounded-2xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[#020617] transition hover:bg-[#8be0f4]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">Recruitment</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              Connect top talent with the right opportunities. Let AI match candidates to jobs with precision and speed.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={() => setShowDashboard(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[var(--accent)] text-[#020617] font-semibold transition hover:bg-[#8be0f4] shadow-lg hover:shadow-xl"
            >
              <span>Explore Platform</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] font-semibold transition hover:bg-[var(--surface)]/80"
            >
              <span>Learn More</span>
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Matching</h3>
              <p className="text-sm text-[var(--muted)]">
                Our AI algorithm matches candidates to jobs based on skills, experience, and cultural fit.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
              <p className="text-sm text-[var(--muted)]">
                Get ranked candidates immediately after posting a job or uploading your resume.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified Matches</h3>
              <p className="text-sm text-[var(--muted)]">
                Every match is analyzed by AI for accuracy, ensuring quality connections.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
