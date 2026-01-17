"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalSelector } from "@/components/steps/GoalSelector";
import { AnalyzingLoader } from "@/components/steps/AnalyzingLoader";
import { Results } from "@/components/steps/Results";
import { Step, DreamRole, RoastResult } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profileText, setProfileText] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dreamRole, setDreamRole] = useState<DreamRole | null>(null);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLinkedin, setIsLoadingLinkedin] = useState(false);
  const [inputSource, setInputSource] = useState<"linkedin" | "pdf">("linkedin");

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

  const handleLinkedinSubmit = async () => {
    if (!linkedinUrl && !profileText) return;

    // If we have manual profile text, go straight to goals
    if (profileText.trim().length > 50) {
      setInputSource("linkedin");
      setStep("goals");
      return;
    }

    // Try to fetch LinkedIn profile
    setIsLoadingLinkedin(true);
    setError(null);

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
      } else if (data.needsManual) {
        setShowManualInput(true);
        setError(data.message);
      } else {
        setError(data.error || "Failed to fetch LinkedIn profile");
      }
    } catch {
      setError("Failed to connect. Please paste your profile manually.");
      setShowManualInput(true);
    } finally {
      setIsLoadingLinkedin(false);
    }
  };

  const handlePdfSubmit = () => {
    if (file) {
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
      } else if (inputSource === "linkedin" && profileText) {
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
    setFile(null);
    setLinkedinUrl("");
    setProfileText("");
    setShowManualInput(false);
    setDreamRole(null);
    setResult(null);
    setError(null);
    setInputSource("linkedin");
  };

  const getInputName = () => {
    if (inputSource === "pdf" && file) return file.name;
    if (inputSource === "linkedin") return linkedinUrl || "LinkedIn Profile";
    return "Your Profile";
  };

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
          <span className="text-xs text-muted-foreground">by Lenny&apos;s AI</span>
        </div>
      </nav>

      {/* Main Content */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
                  Powered by 200+ PM interviews
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
                  Get brutally honest feedback on your PM career
                </h1>

                <p className="text-lg text-muted-foreground max-w-lg mx-auto text-balance">
                  Share your LinkedIn or resume. Get roasted by AI trained on the wisdom of world-class product leaders.
                </p>
              </div>

              {/* Upload Card */}
              <Card className="mt-12 w-full max-w-xl mx-auto p-6 bg-card border-border">
                <Tabs defaultValue="linkedin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                    <TabsTrigger value="resume">Upload PDF</TabsTrigger>
                  </TabsList>

                  <TabsContent value="linkedin" className="space-y-4">
                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-destructive text-sm">{error}</p>
                      </div>
                    )}

                    {!showManualInput ? (
                      <>
                        <div className="space-y-2">
                          <Input
                            type="url"
                            placeholder="https://linkedin.com/in/yourprofile"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="h-12 bg-secondary border-border focus:ring-[#6366f1]/20"
                          />
                          <p className="text-xs text-muted-foreground">
                            We&apos;ll try to fetch your public profile
                          </p>
                        </div>
                        <Button
                          onClick={handleLinkedinSubmit}
                          disabled={!linkedinUrl || isLoadingLinkedin}
                          className="w-full h-12 bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition-all glow-hover disabled:opacity-50"
                        >
                          {isLoadingLinkedin ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Fetching...
                            </span>
                          ) : (
                            "Continue"
                          )}
                        </Button>
                        <button
                          onClick={() => setShowManualInput(true)}
                          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Or paste your profile manually →
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground mb-2">
                            Copy your LinkedIn headline, about section, and experience, then paste below:
                          </p>
                          <textarea
                            placeholder="Paste your LinkedIn profile content here...

Example:
Senior Product Manager at Stripe
Building the future of payments...

Experience:
- Product Manager at Airbnb (2020-2023)
- Software Engineer at Google (2018-2020)
..."
                            value={profileText}
                            onChange={(e) => setProfileText(e.target.value)}
                            className="w-full h-48 p-4 bg-secondary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                          />
                          <p className="text-xs text-muted-foreground">
                            Include your headline, about section, and work experience for the best roast
                          </p>
                        </div>
                        <Button
                          onClick={handleLinkedinSubmit}
                          disabled={profileText.trim().length < 50}
                          className="w-full h-12 bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition-all glow-hover disabled:opacity-50"
                        >
                          Continue
                        </Button>
                        <button
                          onClick={() => {
                            setShowManualInput(false);
                            setError(null);
                          }}
                          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ← Back to URL input
                        </button>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="resume" className="space-y-4">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`
                        relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
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
                        <div className="space-y-2">
                          <div className="w-10 h-10 mx-auto rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">Click or drag to replace</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 mx-auto rounded-lg bg-secondary flex items-center justify-center">
                            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium">Drop your resume here</p>
                          <p className="text-xs text-muted-foreground">PDF only, max 10MB</p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handlePdfSubmit}
                      disabled={!file}
                      className="w-full h-12 bg-[#6366f1] text-white font-medium hover:bg-[#6366f1]/90 transition-all glow-hover disabled:opacity-50"
                    >
                      Continue
                    </Button>
                  </TabsContent>
                </Tabs>
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
