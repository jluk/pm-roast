"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Results } from "@/components/steps/Results";
import { AnalyzingLoader } from "@/components/steps/AnalyzingLoader";
import { ExampleGallery } from "@/components/ExampleGallery";
import { Step, DreamRole, RoastResult, DREAM_ROLES } from "@/lib/types";
import { HeroCard } from "@/components/InteractiveCard";

// LinkedIn URL validation regex
const LINKEDIN_URL_REGEX = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
// General website URL validation regex
const WEBSITE_URL_REGEX = /^(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+\/?.*$/i;

type InputMode = "magic" | "manual";
type UrlType = "linkedin" | "website";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [inputMode, setInputMode] = useState<InputMode>("magic");
  const [urlType, setUrlType] = useState<UrlType>("linkedin");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profileText, setProfileText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dreamRole, setDreamRole] = useState<DreamRole | null>(null);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLinkedin, setIsLoadingLinkedin] = useState(false);
  const [inputSource, setInputSource] = useState<"linkedin" | "pdf" | "manual">("linkedin");
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [useProfilePic, setUseProfilePic] = useState(true);
  const [roastCount, setRoastCount] = useState<number>(1847);

  // Fetch roast count on mount
  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.totalRoasts) {
          setRoastCount(data.totalRoasts);
        }
      })
      .catch(() => {});
  }, []);

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
    if (!linkedinUrl || !dreamRole) return;

    setIsLoadingLinkedin(true);
    setError(null);

    // For website URLs, try to scrape content
    if (urlType === "website") {
      try {
        const response = await fetch("/api/website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: linkedinUrl }),
        });

        const data = await response.json();

        if (data.success && data.quality === "high" && data.profileText) {
          setProfileText(data.profileText);
          setInputSource("manual");
          setIsLoadingLinkedin(false);
          await handleAnalyzeWithData(data.profileText, null);
          return;
        }

        // Partial or failed - switch to manual mode with what we got
        setInputMode("manual");
        if (data.profileText) {
          setProfileText(data.profileText);
        } else {
          setProfileText(`Website: ${linkedinUrl}\n\nPlease paste your bio, work experience, and achievements below:`);
        }
        if (data.message) {
          setError(data.message);
        }
      } catch {
        setInputMode("manual");
        setProfileText(`Website: ${linkedinUrl}\n\nPlease paste your bio, work experience, and achievements below:`);
        setError("Could not fetch website. Please paste your content manually.");
      } finally {
        setIsLoadingLinkedin(false);
      }
      return;
    }

    // LinkedIn URL handling
    try {
      const response = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkedinUrl }),
      });

      const data = await response.json();

      // HIGH QUALITY: Proceed directly to analyzing
      if (data.success && data.quality === "high" && data.profileText && data.profileText.length >= 100) {
        setProfileText(data.profileText);
        setProfilePicUrl(data.profilePicUrl || null);
        setInputSource("linkedin");
        // Go directly to analyzing since we already have the goal
        setIsLoadingLinkedin(false);
        await handleAnalyzeWithData(data.profileText, data.profilePicUrl || null);
        return;
      }

      // PARTIAL QUALITY: Pre-fill manual mode with what we got, ask for more
      if (data.success && data.quality === "partial" && data.needsSupplement) {
        setProfileText(data.profileText || "");
        setProfilePicUrl(data.profilePicUrl || null);
        setInputMode("manual");
        setError(
          "We found your basic profile info, but we need more details to give you a quality roast. Please add your job descriptions, achievements, and what you've built below."
        );
        return;
      }

      // LOW QUALITY or ERROR: Switch to manual, pre-fill if we got anything
      setInputMode("manual");
      if (data.profileText) {
        setProfileText(data.profileText);
      }
      if (data.profilePicUrl) {
        setProfilePicUrl(data.profilePicUrl);
      }
      setError(
        data.message || "We couldn't fetch enough data from your LinkedIn profile. Please paste your experience details below so we can give you an accurate roast!"
      );
    } catch {
      setInputMode("manual");
      setError("Connection failed. Please paste your LinkedIn info or upload your resume below so we can roast you properly!");
    } finally {
      setIsLoadingLinkedin(false);
    }
  };

  // Direct analyze function that takes data as params (for inline flow)
  const handleAnalyzeWithData = async (text: string, picUrl: string | null) => {
    if (!dreamRole) return;

    setStep("analyzing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("profileText", text);

      if (picUrl && useProfilePic) {
        formData.append("profilePicUrl", picUrl);
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
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("upload");
      setInputMode("manual");
    }
  };

  const handleManualSubmit = async () => {
    if (!dreamRole) return;

    if (profileText.trim().length >= 50) {
      setInputSource("manual");
      // Go directly to analyzing
      await handleAnalyzeWithData(profileText, null);
    } else if (file) {
      setInputSource("pdf");
      // For PDF, handle file upload directly
      setStep("analyzing");
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
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
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setStep("upload");
        setInputMode("manual");
      }
    }
  };

  const handleStartOver = () => {
    setStep("upload");
    setInputMode("magic");
    setFile(null);
    setLinkedinUrl("");
    setProfileText("");
    setProfilePicUrl(null);
    setUseProfilePic(true);
    setDreamRole(null);
    setResult(null);
    setError(null);
    setInputSource("linkedin");
    window.scrollTo(0, 0);
  };

  const canSubmitManual = profileText.trim().length >= 50 || file !== null;

  // Check if URL is valid (LinkedIn or website based on urlType)
  const isValidUrl = useMemo(() => {
    const url = linkedinUrl.trim();
    if (urlType === "linkedin") {
      return LINKEDIN_URL_REGEX.test(url);
    }
    return WEBSITE_URL_REGEX.test(url);
  }, [linkedinUrl, urlType]);

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
      <section className="flex-1 flex flex-col items-center px-6 pt-20 pb-12">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {/* Hero Section - Two Column Layout */}
              <div className="max-w-6xl mx-auto">
                {/* Header - Compact */}
                <div className="text-center mb-4 lg:mb-6">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                    Get roasted.
                    <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                      {" "}Get your PM card.
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                    AI-generated cards customized to your career —{" "}
                    <a
                      href="https://www.youtube.com/@LennysPodcast"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground font-medium hover:text-[#6366f1] transition-colors"
                    >
                      Lenny&apos;s Podcast
                    </a>
                    {" "}informed
                  </p>
                </div>

                {/* Two Column: Preview + Form */}
                <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                  {/* Left: Card Preview (Desktop) */}
                  <div className="hidden lg:block flex-shrink-0">
                    <div className="relative">
                      <div className="absolute -inset-3 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl pointer-events-none" />
                      <div className="relative">
                        <HeroCard />
                      </div>
                    </div>
                  </div>

                  {/* Right: Input Form - Glassmorphism */}
                  <div className="relative w-[340px]">
                    {/* Glow behind form */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#6366f1]/30 via-purple-500/20 to-pink-500/30 rounded-2xl blur-lg pointer-events-none" />
                    <Card className="relative p-6 bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/20 rounded-xl">
                <AnimatePresence mode="wait">
                  {inputMode === "magic" ? (
                    <motion.div
                      key="magic"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* URL Type Toggle */}
                      <div className="flex justify-center">
                        <div className="inline-flex bg-white/10 rounded-lg p-0.5">
                          <button
                            onClick={() => { setUrlType("linkedin"); setLinkedinUrl(""); }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                              urlType === "linkedin"
                                ? "bg-white/20 text-white"
                                : "text-white/60 hover:text-white/80"
                            }`}
                          >
                            LinkedIn
                          </button>
                          <button
                            onClick={() => { setUrlType("website"); setLinkedinUrl(""); }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                              urlType === "website"
                                ? "bg-white/20 text-white"
                                : "text-white/60 hover:text-white/80"
                            }`}
                          >
                            Website
                          </button>
                        </div>
                      </div>

                      {/* URL Input - Glassmorphism style */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                          {urlType === "linkedin" ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder={urlType === "linkedin" ? "linkedin.com/in/yourprofile" : "yourwebsite.com"}
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className={`w-full h-12 pl-11 bg-white/10 backdrop-blur-sm border rounded-lg text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-transparent transition-all ${
                            isValidUrl ? "border-green-500/50 pr-10" : "border-white/20 pr-4"
                          }`}
                        />
                        {isValidUrl && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Inline Goal Selector - appears when URL is valid */}
                      <AnimatePresence>
                        {isValidUrl && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 pt-1">
                              <p className="text-xs text-white/60 text-center">
                                What&apos;s your dream role?
                              </p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {(Object.entries(DREAM_ROLES) as [DreamRole, typeof DREAM_ROLES[DreamRole]][]).map(([key, role]) => (
                                  <button
                                    key={key}
                                    onClick={() => setDreamRole(key)}
                                    className={`h-9 px-2 rounded-lg transition-all ${
                                      dreamRole === key
                                        ? "bg-[#6366f1]/30 border-[#6366f1] border"
                                        : "bg-white/5 border-white/10 border hover:bg-white/10"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1 w-full">
                                      <span className="text-sm shrink-0">{role.emoji}</span>
                                      <span className={`text-[11px] font-medium whitespace-nowrap truncate ${dreamRole === key ? "text-white" : "text-white/80"}`}>
                                        {role.label}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Use Profile Picture Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={useProfilePic}
                            onChange={(e) => setUseProfilePic(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-white/10 border border-white/20 rounded-full peer-checked:bg-[#6366f1] peer-checked:border-[#6366f1] transition-all" />
                          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
                        </div>
                        <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                          Use my photo for card
                        </span>
                      </label>

                      {/* Submit Button */}
                      <Button
                        onClick={handleMagicLinkSubmit}
                        disabled={!isValidUrl || !dreamRole || isLoadingLinkedin}
                        className="w-full h-12 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold text-base hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                      >
                        {isLoadingLinkedin ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Analyzing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            🔥 Roast Me
                          </span>
                        )}
                      </Button>

                      {/* Social Proof Ticker */}
                      <p className="text-[10px] text-white/50 text-center">
                        {roastCount.toLocaleString()} PMs roasted. 0 PRDs harmed.
                      </p>

                      {/* Manual Fallback Link */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-transparent px-2 text-white/40">or</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setInputMode("manual")}
                        className="w-full py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
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
                      className="space-y-3"
                    >
                      {/* Error Message (graceful) */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                        >
                          <p className="text-amber-500 text-xs text-center">{error}</p>
                        </motion.div>
                      )}

                      {/* Compact PDF Upload - Primary option */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                          relative border border-dashed rounded-lg p-3 text-center transition-all cursor-pointer
                          ${isDragging ? "border-[#6366f1] bg-[#6366f1]/10" : "border-white/20 hover:border-white/40"}
                          ${file ? "border-[#6366f1]/50 bg-[#6366f1]/10" : ""}
                        `}
                      >
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {file ? (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#6366f1] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs text-white truncate flex-1 text-left">{file.name}</span>
                            <button
                              onClick={(e) => { e.preventDefault(); setFile(null); }}
                              className="p-0.5 hover:bg-white/10 rounded shrink-0"
                            >
                              <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-xs text-white/60">Upload resume (PDF)</span>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[10px]">
                          <span className="bg-transparent px-2 text-white/30">or paste info</span>
                        </div>
                      </div>

                      {/* Compact Text Area */}
                      <textarea
                        placeholder="Paste LinkedIn headline, about, experience..."
                        value={profileText}
                        onChange={(e) => setProfileText(e.target.value)}
                        className="w-full h-24 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 placeholder:text-white/50"
                      />

                      {/* Inline Goal Selector - appears when we have enough content */}
                      <AnimatePresence>
                        {canSubmitManual && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 pt-1">
                              <p className="text-xs text-white/60 text-center">
                                What&apos;s your dream role?
                              </p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {(Object.entries(DREAM_ROLES) as [DreamRole, typeof DREAM_ROLES[DreamRole]][]).map(([key, role]) => (
                                  <button
                                    key={key}
                                    onClick={() => setDreamRole(key)}
                                    className={`h-9 px-2 rounded-lg transition-all ${
                                      dreamRole === key
                                        ? "bg-[#6366f1]/30 border-[#6366f1] border"
                                        : "bg-white/5 border-white/10 border hover:bg-white/10"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1 w-full">
                                      <span className="text-sm shrink-0">{role.emoji}</span>
                                      <span className={`text-[11px] font-medium whitespace-nowrap truncate ${dreamRole === key ? "text-white" : "text-white/80"}`}>
                                        {role.label}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <Button
                        onClick={handleManualSubmit}
                        disabled={!canSubmitManual || !dreamRole}
                        className="w-full h-12 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold text-base hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                      >
                        🔥 Roast Me
                      </Button>

                      {/* Back to Magic Link */}
                      <button
                        onClick={() => {
                          setInputMode("magic");
                          setError(null);
                        }}
                        className="w-full py-1 text-xs text-white/50 hover:text-white/80 transition-colors flex items-center justify-center gap-1"
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
                  </div>
                </div>
              </div>

              {/* Stats - Compact Row */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span><span className="font-bold text-white">10k+</span> cards</span>
                <span className="text-muted-foreground/30">•</span>
                <span><span className="font-bold text-white">9</span> archetypes</span>
                <span className="text-muted-foreground/30">•</span>
                <span><span className="font-bold text-white">6</span> elements</span>
              </div>

              {/* Mobile: Show card preview below form */}
              <div className="lg:hidden mt-6">
                <p className="text-center text-xs text-muted-foreground mb-3">Your personalized card</p>
                <div className="relative max-w-[280px] mx-auto">
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-blue-500/15 rounded-2xl blur-xl pointer-events-none" />
                  <div className="relative">
                    <HeroCard />
                  </div>
                </div>
              </div>

              {/* Example Gallery */}
              <ExampleGallery />
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
