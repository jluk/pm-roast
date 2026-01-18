"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GoalSelector } from "@/components/steps/GoalSelector";
import { AnalyzingLoader } from "@/components/steps/AnalyzingLoader";
import { Results } from "@/components/steps/Results";
import { ExampleGallery } from "@/components/ExampleGallery";
import { Step, DreamRole, RoastResult } from "@/lib/types";
import { HeroCard } from "@/components/InteractiveCard";

type InputMode = "magic" | "manual";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [inputMode, setInputMode] = useState<InputMode>("magic");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profileText, setProfileText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dreamRole, setDreamRole] = useState<DreamRole | null>(null);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLinkedin, setIsLoadingLinkedin] = useState(false);
  const [inputSource, setInputSource] = useState<"linkedin" | "pdf" | "manual">("linkedin");
  const [magicLinkTried, setMagicLinkTried] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleMagicLinkSubmit = async () => {
    if (!linkedinUrl) return;

    setIsLoadingLinkedin(true);
    setError(null);
    setMagicLinkTried(true);

    try {
      const response = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkedinUrl }),
      });

      const data = await response.json();

      if (data.success && data.profileText) {
        setProfileText(data.profileText);
        setInputSource("linkedin");
        setStep("goals");
      } else {
        // Graceful fallback to manual mode
        setInputMode("manual");
        setError(data.isMock
          ? null // Don't show error for mock mode, just switch
          : "We couldn't fetch your profile automatically. No worries - just paste your info below!"
        );
      }
    } catch {
      setInputMode("manual");
      setError("Connection failed. No worries - just paste your info or upload your resume below!");
    } finally {
      setIsLoadingLinkedin(false);
    }
  };

  const handleManualSubmit = () => {
    if (profileText.trim().length >= 50) {
      setInputSource("manual");
      setStep("goals");
    } else if (file) {
      setInputSource("pdf");
      setStep("goals");
    }
  };

  const handleAnalyze = async () => {
    if (!dreamRole) return;

    setStep("analyzing");
    setError(null);

    try {
      const formData = new FormData();

      if (inputSource === "pdf" && file) {
        formData.append("file", file);
      } else if ((inputSource === "linkedin" || inputSource === "manual") && profileText) {
        formData.append("profileText", profileText);
      }

      formData.append("dreamRole", dreamRole);

      const response = await fetch("/api/roast", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze");
      }

      const data: RoastResult = await response.json();
      setResult(data);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("goals");
    }
  };

  const handleStartOver = () => {
    setStep("upload");
    setInputMode("magic");
    setFile(null);
    setLinkedinUrl("");
    setProfileText("");
    setDreamRole(null);
    setResult(null);
    setError(null);
    setInputSource("linkedin");
    setMagicLinkTried(false);
  };

  const getInputName = () => {
    if (inputSource === "pdf" && file) return file.name;
    if (inputSource === "linkedin") return linkedinUrl || "LinkedIn Profile";
    return "Your Profile";
  };

  const canSubmitManual = profileText.trim().length >= 50 || file !== null;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={handleStartOver}
            className="font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            PM Roast
          </button>
          <span className="text-xs text-muted-foreground">Powered by Gemini</span>
        </div>
      </nav>

      {/* Main Content */}
      <section className="flex-1 flex flex-col items-center px-6 pt-24 pb-12">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {/* Hero Section with Card */}
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 max-w-6xl mx-auto">
                {/* Left side - Copy */}
                <div className="flex-1 text-center lg:text-left space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
                    Powered by 200+ PM interviews
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                    Get your PM
                    <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                      Trading Card
                    </span>
                  </h1>

                  <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 text-balance">
                    Share your LinkedIn or resume. Get roasted by AI and receive a collectible card showing your true PM archetype.
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-2">
                    <div className="text-center lg:text-left">
                      <p className="text-2xl font-bold text-white">10k+</p>
                      <p className="text-xs text-muted-foreground">Cards Generated</p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-2xl font-bold text-white">9</p>
                      <p className="text-xs text-muted-foreground">PM Archetypes</p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-2xl font-bold text-white">6</p>
                      <p className="text-xs text-muted-foreground">Element Types</p>
                    </div>
                  </div>
                </div>

                {/* Right side - Hero Card */}
                <div className="flex-shrink-0">
                  <HeroCard />
                </div>
              </div>

              {/* Input Card */}
              <Card className="mt-16 w-full max-w-xl mx-auto p-6 bg-card border-border">
                <AnimatePresence mode="wait">
                  {inputMode === "magic" ? (
                    <motion.div
                      key="magic"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Magic Link Header */}
                      <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 text-[#6366f1]">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="font-semibold">Magic Link</span>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Paste your LinkedIn URL and we&apos;ll do the rest
                        </p>
                      </div>

                      {/* URL Input */}
                      <div className="space-y-2">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </div>
                          <Input
                            type="url"
                            placeholder="linkedin.com/in/yourprofile"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="h-12 pl-11 bg-secondary border-border focus:ring-[#6366f1]/20"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        onClick={handleMagicLinkSubmit}
                        disabled={!linkedinUrl || isLoadingLinkedin}
                        className="w-full h-12 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium hover:from-[#5558e3] hover:to-[#7c4fe0] transition-all shadow-lg shadow-[#6366f1]/25 disabled:opacity-50 disabled:shadow-none"
                      >
                        {isLoadingLinkedin ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Extracting profile...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Extract My Profile
                          </span>
                        )}
                      </Button>

                      {/* Manual Fallback Link */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-card px-2 text-muted-foreground">or</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setInputMode("manual")}
                        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Enter info manually instead
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="manual"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* Manual Mode Header */}
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold text-lg">Tell us about yourself</h3>
                        <p className="text-sm text-muted-foreground">
                          Paste your LinkedIn profile or upload your resume
                        </p>
                      </div>

                      {/* Error Message (graceful) */}
                      {error && magicLinkTried && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                        >
                          <p className="text-amber-500 text-sm text-center">{error}</p>
                        </motion.div>
                      )}

                      {/* Paste Text Area */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Option 1: Paste your LinkedIn info
                        </label>
                        <textarea
                          placeholder="Copy and paste your LinkedIn headline, about section, and experience here...

Example:
Senior Product Manager at Stripe
Building the future of payments | Ex-Airbnb, Ex-Google

About:
Product leader with 8+ years building consumer and B2B products...

Experience:
- Senior PM at Stripe (2022-Present)
- PM at Airbnb (2019-2022)
..."
                          value={profileText}
                          onChange={(e) => setProfileText(e.target.value)}
                          className="w-full h-40 p-4 bg-secondary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 placeholder:text-muted-foreground/50"
                        />
                        {profileText.length > 0 && profileText.length < 50 && (
                          <p className="text-xs text-amber-500">
                            Please add more details ({50 - profileText.length} more characters needed)
                          </p>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-card px-2 text-muted-foreground">or</span>
                        </div>
                      </div>

                      {/* PDF Upload */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Option 2: Upload your resume
                        </label>
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`
                            relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
                            ${isDragging ? "border-[#6366f1] bg-[#6366f1]/5" : "border-border hover:border-muted-foreground"}
                            ${file ? "border-[#6366f1]/50 bg-[#6366f1]/5" : ""}
                          `}
                        >
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {file ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">Click to replace</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFile(null);
                                }}
                                className="ml-auto p-1 hover:bg-secondary rounded"
                              >
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <svg className="w-8 h-8 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="text-sm">Drop PDF here or click to browse</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        onClick={handleManualSubmit}
                        disabled={!canSubmitManual}
                        className="w-full h-12 bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition-all disabled:opacity-50"
                      >
                        Continue
                      </Button>

                      {/* Back to Magic Link */}
                      <button
                        onClick={() => {
                          setInputMode("magic");
                          setError(null);
                        }}
                        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Magic Link
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Social proof */}
              <div className="mt-12 text-center space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Wisdom sourced from
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Lenny&apos;s Podcast</span> — 200+ episodes with PMs from
                  <span className="text-foreground"> Airbnb</span>,
                  <span className="text-foreground"> Stripe</span>,
                  <span className="text-foreground"> Figma</span>,
                  <span className="text-foreground"> Linear</span>, and more
                </p>
              </div>

              {/* Example Gallery */}
              <ExampleGallery />
            </motion.div>
          )}

          {step === "goals" && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center max-w-2xl mx-auto">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
              <GoalSelector
                selectedGoal={dreamRole}
                onSelectGoal={setDreamRole}
                onBack={() => setStep("upload")}
                onContinue={handleAnalyze}
                fileName={getInputName()}
              />
            </motion.div>
          )}

          {step === "analyzing" && (
            <AnalyzingLoader key="analyzing" />
          )}

          {step === "results" && result && dreamRole && (
            <Results
              key="results"
              result={result}
              dreamRole={dreamRole}
              onStartOver={handleStartOver}
            />
          )}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Built by{" "}
            <a
              href="https://jluk.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-accent transition-colors"
            >
              Justin Luk
            </a>
          </span>
          <a
            href="https://github.com/jluk/pm-roast"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Source
          </a>
        </div>
      </footer>
    </main>
  );
}
