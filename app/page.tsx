"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Dashboard from "./dashboard";

interface Message {
  id: number;
  role: "user" | "bot" | "assistant";
  text: string;
}

export default function Home() {
  const [showDashboard, setShowDashboard] = useState<boolean | null>(null);
  const [showWidget, setShowWidget] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hello! Welcome to AI Recruitment Hub. Looking to explore the platform or have any questions? Ask me anything!"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedState = localStorage.getItem("showDashboard");
    setShowDashboard(savedState === "true");
  }, []);

  useEffect(() => {
    if (showDashboard === null) return;
    localStorage.setItem("showDashboard", showDashboard.toString());
  }, [showDashboard]);

  useEffect(() => {
    if (showWidget) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showWidget, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { id: Date.now(), role: "user", text: userText }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let botReplyText = "I can help guide you through our AI smart matching tools! Try clicking 'Explore Platform' to test the system pipeline.";
      const lowerText = userText.toLowerCase();

      if (lowerText.includes("hello") || lowerText.includes("hi")) {
        botReplyText = "Hi there! Welcome to the AI Recruitment Hub. Let me know if you need help finding anything!";
      } else if (lowerText.includes("dashboard") || lowerText.includes("explore")) {
        botReplyText = "Clicking the 'Explore Platform' button will take you directly into our main workspace suite.";
      }

      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: botReplyText }
      ]);
      setIsTyping(false);
    }, 700);
  };

  if (showDashboard === null) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  if (showDashboard) {
    return <Dashboard onBackToHome={() => setShowDashboard(false)} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col relative transition-colors duration-200">
      
      {/* Super Clean Top Header */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-40">
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
        <div></div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">Recruitment</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              Connect top talent with the right opportunities. Let AI match candidates to jobs with precision and speed.
            </p>
          </div>

          {/* CTA Action Button Area */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShowDashboard(true)}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-[var(--accent)] text-[#020617] font-bold transition hover:opacity-90 shadow-lg text-base"
            >
              <span>Explore Platform</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-1.5">Smart Matching</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">Our AI algorithm matches candidates based on skills, experience, and fit.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-1.5">Instant Results</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">Get ranked candidates immediately after posting a job vacancy list.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-1.5">Verified Matches</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">Every single match is analyzed by AI engines for premium accuracy metrics.</p>
            </div>
          </div>
        </div>
      </main>

      {/* CHATBOT ONLY FLOATING WINDOW HUB (BOTTOM RIGHT) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Chatbot Interface Panel */}
        {showWidget && (
          <div className="w-80 md:w-[360px] h-[450px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 mb-3">
            
            {/* Header Area */}
            <div className="p-4 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 className="font-bold text-xs text-[var(--foreground)]">Support Assistant</h3>
              </div>
              <button onClick={() => setShowWidget(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Chat Message Box Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--background)]/20">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-[var(--accent)] text-[#020617] font-semibold" 
                      : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] text-[10px] rounded-2xl px-3 py-1 italic">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Form Input Subsystem Footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--border)] bg-[var(--surface)] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-1.5 text-xs bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--foreground)]"
              />
              <button type="submit" className="px-3 py-1.5 bg-[var(--accent)] text-[#020617] rounded-xl text-xs font-bold">
                Send
              </button>
            </form>
          </div>
        )}

        {/* CHAT ACTUATOR BUBBLE BUTTON */}
        <button
          onClick={() => setShowWidget(!showWidget)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border transition-all duration-200 ${
            showWidget 
              ? "bg-[var(--accent)] border-[var(--accent)] text-[#020617] scale-90" 
              : "bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] hover:scale-105 active:scale-95"
          }`}
          title="Open Support Chat"
        >
          {showWidget ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )}
        </button>

      </div>
    </div>
  );
}

function preventDefault() {
  throw new Error("Function not implemented.");
}
