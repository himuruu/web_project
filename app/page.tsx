"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Dashboard from "./dashboard";

// --- Translation Dictionary ---
const translations: Record<string, any> = {
  English: {
    heroTitlePrefix: "AI-Powered ",
    heroTitleHighlight: "Recruitment",
    heroDesc: "Connect top talent with the right opportunities. Let AI match candidates to jobs with precision and speed.",
    exploreBtn: "Explore Platform",
    card1Title: "Smart Matching",
    card1Desc: "Our AI algorithm matches candidates based on skills, experience, and fit.",
    card2Title: "Instant Results",
    card2Desc: "Get ranked candidates immediately after posting a job vacancy list.",
    card3Title: "Verified Matches",
    card3Desc: "Every single match is analyzed by AI engines for premium accuracy metrics.",
    reportIssue: "Report an Issue",
    cancelReport: "Cancel Report",
    language: "Language",
  },
  Spanish: {
    heroTitlePrefix: "Reclutamiento con ",
    heroTitleHighlight: "IA",
    heroDesc: "Conecte el mejor talento con las oportunidades adecuadas. Deje que la IA empareje candidatos con trabajos con precisión y velocidad.",
    exploreBtn: "Explorar Plataforma",
    card1Title: "Emparejamiento Inteligente",
    card1Desc: "Nuestro algoritmo de IA empareja candidatos según habilidades, experiencia y ajuste.",
    card2Title: "Resultados Instantáneos",
    card2Desc: "Obtenga candidatos clasificados inmediatamente después de publicar una vacante.",
    card3Title: "Coincidencias Verificadas",
    card3Desc: "Cada coincidencia es analizada por motores de IA para obtener métricas de precisión.",
    reportIssue: "Reportar un Problema",
    cancelReport: "Cancelar Reporte",
    language: "Idioma",
  },
  French: {
    heroTitlePrefix: "Recrutement par ",
    heroTitleHighlight: "IA",
    heroDesc: "Connectez les meilleurs talents aux bonnes opportunités. Laissez l'IA associer les candidats aux emplois avec précision et rapidité.",
    exploreBtn: "Explorer la Plateforme",
    card1Title: "Correspondance Intelligente",
    card1Desc: "Notre algorithme d'IA associe les candidats en fonction de leurs compétences et de leur expérience.",
    card2Title: "Résultats Instantanés",
    card2Desc: "Obtenez des candidats classés immédiatement après avoir publié une offre d'emploi.",
    card3Title: "Correspondances Vérifiées",
    card3Desc: "Chaque correspondance est analysée par des moteurs d'IA pour une précision optimale.",
    reportIssue: "Signaler un Problème",
    cancelReport: "Annuler le Signalement",
    language: "Langue",
  }
};

interface Message {
  id: number;
  role: "user" | "bot" | "assistant";
  text: string;
}

export default function Home() {
  const [showDashboard, setShowDashboard] = useState<boolean | null>(null);
  
  // Chat Widget States
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

  // Settings Menu States
  const [showSettings, setShowSettings] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [issuesList, setIssuesList] = useState<string[]>([]);
  const [language, setLanguage] = useState("English");
  

  // Get current translations based on selected language (fallback to English)
  const t = translations[language] || translations["English"];

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
    e.preventDefault();
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

  const submitIssue = () => {
    if (issueText.trim()) {
      setIssuesList((prev) => [...prev, issueText.trim()]);
      setIssueText("");
    }
  };

  if (showDashboard === null) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  // ✅ THIS IS THE ONLY LINE THAT WAS CHANGED:
  // It now passes currentLanguage={language} to your dashboard
  if (showDashboard) {
    return <Dashboard onBackToHome={() => setShowDashboard(false)} currentLanguage={language} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col relative transition-colors duration-200">
      
      {/* Super Clean Top Header */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-35">
        <div className="flex items-center gap-2">
          <Image 
            src="/Ailogo.png" 
            alt="AIdeal Job Logo" 
            width={64} 
            height={32} 
            className="object-contain"
            priority
          />
          <span className="text-lg font-semibold hidden sm:inline">Aideal Recruit Hub</span>
        </div>
        
        {/* Settings Dropdown Container */}
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-[var(--background)] transition border border-transparent hover:border-[var(--border)]"
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Settings Menu Popup */}
          {showSettings && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="p-2 flex flex-col">
                
                {/* Translate Select */}
                <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
                  <span className="text-sm font-semibold">{t.language}</span>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-xs bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>

                {/* Report Issue Section */}
                <div className="p-3">
                  <button 
                    onClick={() => setShowReportIssue(!showReportIssue)}
                    className="w-full text-left text-sm font-semibold text-rose-400 hover:text-rose-500 transition mb-2"
                  >
                    {showReportIssue ? `- ${t.cancelReport}` : `+ ${t.reportIssue}`}
                  </button>
                  
                  {showReportIssue && (
                    <div className="space-y-2 mt-2">
                      <textarea 
                        value={issueText}
                        onChange={(e) => setIssueText(e.target.value)}
                        placeholder="Describe your issue..."
                        className="w-full h-20 text-xs p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] resize-none outline-none focus:border-[var(--accent)]"
                      />
                      <button 
                        onClick={submitIssue}
                        className="w-full py-2 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-500 hover:text-white transition"
                      >
                        Submit
                      </button>
                    </div>
                  )}

                  {/* Submitted Issues List */}
                  {issuesList.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                      <p className="text-[10px] uppercase text-[var(--muted)] font-bold tracking-wider">Reports</p>
                      {issuesList.map((issue, idx) => (
                        <div key={idx} className="text-xs p-2 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--muted)]">
                          {issue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              {t.heroTitlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">{t.heroTitleHighlight}</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              {t.heroDesc}
            </p>
          </div>

          {/* CTA Action Button Area */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShowDashboard(true)}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-[var(--accent)] text-[#020617] font-bold transition hover:opacity-90 shadow-lg text-base"
            >
              <span>{t.exploreBtn}</span>
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
              <h3 className="text-base font-bold mb-1.5">{t.card1Title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{t.card1Desc}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-1.5">{t.card2Title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{t.card2Desc}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-1.5">{t.card3Title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{t.card3Desc}</p>
            </div>
          </div>
        </div>
      </main>

      {/* CHATBOT REMAINS THE SAME DOWN HERE */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {showWidget && (
          <div className="w-80 h-[450px] flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold text-sm text-[var(--foreground)]">AI Support Bot</span>
              </div>
              <button 
                onClick={() => setShowWidget(false)} 
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-[var(--accent)] text-[#020617] rounded-br-none shadow-sm" 
                      : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[var(--background)] border border-[var(--border)] p-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border)] bg-[var(--background)]">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full py-2.5 pl-4 pr-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-all"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--accent)] text-[#020617] rounded-lg disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
              </div>
            </form>
          </div>
        )}
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