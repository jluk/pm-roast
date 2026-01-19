"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GoalSelector } from "@/components/steps/GoalSelector";
import { Results } from "@/components/steps/Results";
import { AnalyzingLoader } from "@/components/steps/AnalyzingLoader";
import { ExampleGallery } from "@/components/ExampleGallery";
import { Step, DreamRole, RoastResult } from "@/lib/types";
import { HeroCard } from "@/components/InteractiveCard";
import { OutputPreview } from "@/components/OutputPreview";

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
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

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

      if (data.success && data.profileText && data.profileText.length >= 100) {
        setProfileText(data.profileText);
        setProfilePicUrl(data.profilePicUrl || null);
        setInputSource("linkedin");
        setStep("goals");
      } else {
        // Graceful fallback to manual mode - never proceed with insufficient data
        setInputMode("manual");
        setError(
          "We couldn't fetch enough data from your LinkedIn profile. Please paste your experience details below so we can give you an accurate roast!"
        );
      }
    } catch {
      setInputMode("manual");
      setError("Connection failed. Please paste your LinkedIn info or upload your resume below so we can roast you properly!");
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

      // Include profile picture URL if available (from LinkedIn)
      if (profilePicUrl) {
        formData.append("profilePicUrl", profilePicUrl);
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
      setStep("results"); // Go directly to results
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("error");
    }
  };

  const handleStartOver = () => {
    setStep("upload");
    setInputMode("magic");
    setFile(null);
    setLinkedinUrl("");
    setProfileText("");
    setProfilePicUrl(null);
    setDreamRole(null);
    setResult(null);
    setError(null);
    setInputSource("linkedin");
    setMagicLinkTried(false);
    window.scrollTo(0, 0);
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
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Built by{" "}
              <span className="text-foreground font-medium">Justin Luk</span>
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://twitter.com/whosjluk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/lukjustin/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
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
              {/* Hero Section - CTA First */}
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
                  Powered by 200+ PM interviews
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                  Get roasted.
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    {" "}Get your card.
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                  Share your LinkedIn and get roasted by AI. Receive a collectible Pokemon-style card showing your true PM archetype.
                </p>
              </div>

              {/* Primary CTA - Input Card */}
              <Card className="mt-10 w-full max-w-xl mx-auto p-6 bg-card border-2 border-[#6366f1]/30 shadow-xl shadow-[#6366f1]/10">
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

                      {/* Submit Button - Fire gradient CTA */}
                      <Button
                        onClick={handleMagicLinkSubmit}
                        disabled={!linkedinUrl || isLoadingLinkedin}
                        className="w-full h-14 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold text-lg hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100 animate-pulse hover:animate-none"
                      >
                        {isLoadingLinkedin ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            🔥 Roast Me
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

                      {/* Submit Button - Fire gradient CTA */}
                      <Button
                        onClick={handleManualSubmit}
                        disabled={!canSubmitManual}
                        className="w-full h-14 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold text-lg hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                      >
                        🔥 Roast Me
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

              {/* Stats */}
              <div className="mt-10 flex flex-wrap justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">10k+</p>
                  <p className="text-xs text-muted-foreground">Cards Generated</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">9</p>
                  <p className="text-xs text-muted-foreground">PM Archetypes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">6</p>
                  <p className="text-xs text-muted-foreground">Element Types</p>
                </div>
              </div>

              {/* Social proof */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Wisdom from{" "}
                  <a
                    href="https://www.youtube.com/@LennysPodcast"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground font-medium hover:text-[#6366f1] transition-colors"
                  >
                    Lenny&apos;s Podcast
                  </a>
                  {" "}— PMs from
                  <span className="text-foreground"> Airbnb</span>,
                  <span className="text-foreground"> Stripe</span>,
                  <span className="text-foreground"> Figma</span>,
                  <span className="text-foreground"> Linear</span>, and more
                </p>
              </div>

              {/* Output Preview - Full experience preview */}
              <OutputPreview />

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
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg mx-auto py-12"
            >
              <AnalyzingLoader />
            </motion.div>
          )}

          {step === "results" && result && dreamRole && (
            <Results
              key="results"
              result={result}
              dreamRole={dreamRole}
              onStartOver={handleStartOver}
            />
          )}

          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg mx-auto text-center"
            >
              <Card className="p-8 bg-card border-amber-500/20">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <span className="text-3xl">📝</span>
                </div>

                <h2 className="text-xl font-bold text-white mb-3">We Need More Info</h2>

                <p className="text-gray-400 mb-6">
                  {error || "We couldn't generate an accurate roast. We need more details about your PM experience to avoid making things up!"}
                </p>

                <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-medium text-white mb-2">Please include:</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Your job titles (PM, Senior PM, etc.)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Companies you&apos;ve worked at
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Products you&apos;ve built or shipped
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Key achievements or metrics
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setError(null);
                      setStep("upload");
                      setInputMode("manual");
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold"
                  >
                    Add More Details
                  </Button>

                  <Button
                    onClick={handleStartOver}
                    variant="outline"
                    className="w-full"
                  >
                    Start Over
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Powered by Gemini</span>
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
