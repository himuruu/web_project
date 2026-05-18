"use client";

import React from "react";

// We define the props so TypeScript knows this component accepts the "onBackToHome" function
interface DashboardProps {
  onBackToHome: () => void;
}

export default function Dashboard({ onBackToHome }: DashboardProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 md:p-12 transition-colors duration-200">
      
      {/* Dashboard Top Navigation */}
      <nav className="flex items-center justify-between border-b border-[var(--border)] pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">
            Main Workspace
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">AI Recruitment Hub Dashboard</p>
        </div>
        
        {/* THIS IS THE CONNECTION BACK TO THE FRONT PAGE */}
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-[#020617] transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
      </nav>

      {/* Main Content Area Placeholder */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar / Stats */}
        <div className="col-span-1 space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <h2 className="font-bold mb-2">Active Jobs</h2>
            <p className="text-3xl font-extrabold text-cyan-400">12</p>
          </div>
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <h2 className="font-bold mb-2">Candidates Scanned</h2>
            <p className="text-3xl font-extrabold text-emerald-400">1,492</p>
          </div>
        </div>

        {/* Main Feed / Action Area */}
        <div className="col-span-1 lg:col-span-2 p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Your AI Engine is Ready</h3>
          <p className="text-sm text-[var(--muted)] max-w-md">
            This is your main dashboard. From here, you can start inputting job requirements and letting the AI filter through candidate resumes.
          </p>
        </div>

      </main>
    </div>
  );
}