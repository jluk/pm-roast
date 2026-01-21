"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Results } from "@/components/steps/Results";
import { AnalyzingLoader } from "@/components/steps/AnalyzingLoader";
import { ExampleGallery } from "@/components/ExampleGallery";
import { FamousCardsGallery } from "@/components/FamousCardsGallery";
import { Step, DreamRole, RoastResult, DREAM_ROLES } from "@/lib/types";
import { HeroCard } from "@/components/InteractiveCard";

// LinkedIn URL validation regex
const LINKEDIN_URL_REGEX = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
// General website URL validation regex
const WEBSITE_URL_REGEX = /^(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+\/?.*$/i;
// X handle validation regex (1-15 alphanumeric + underscore)
const X_HANDLE_REGEX = /^@?[a-zA-Z0-9_]{1,15}$/;

// Rotating placeholder examples
const PLACEHOLDER_EXAMPLES = [
  { text: "linkedin.com/in/yourprofile", type: "linkedin" as const },
  { text: "yoursite.com/about", type: "website" as const },
];

// Auto-detect input type from value
function detectInputType(value: string): "linkedin" | "website" | "x" | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  // Check for X/Twitter patterns
  if (trimmed.startsWith("@") || trimmed.includes("twitter.com") || trimmed.includes("x.com")) {
    return "x";
  }

  // Check for LinkedIn
  if (trimmed.includes("linkedin.com")) {
    return "linkedin";
  }

  // Check for any URL-like pattern
  if (trimmed.includes(".") || trimmed.startsWith("http")) {
    return "website";
  }

  // Could be an X handle without @ if it looks like a username
  if (/^[a-zA-Z0-9_]{1,15}$/.test(trimmed) && trimmed.length >= 2) {
    return "x"; // Likely an X handle
  }

  return null;
}

type InputMode = "magic" | "manual";
type UrlType = "linkedin" | "website" | "resume" | "x";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [inputMode, setInputMode] = useState<InputMode>("magic");
  const [urlType, setUrlType] = useState<UrlType>("linkedin");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Unified smart input state
  const [smartInput, setSmartInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [detectedType, setDetectedType] = useState<"linkedin" | "website" | "x" | null>(null);
  const [profileText, setProfileText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dreamRole, setDreamRole] = useState<DreamRole | null>("founder");
  const [result, setResult] = useState<RoastResult | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLinkedin, setIsLoadingLinkedin] = useState(false);
  const [inputSource, setInputSource] = useState<"linkedin" | "pdf" | "manual">("linkedin");
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [useProfilePic, setUseProfilePic] = useState(true);
  const [attemptedLinkedInFetch, setAttemptedLinkedInFetch] = useState(false);
  const [roastCount, setRoastCount] = useState<number>(1847);
  const [userProfileImage, setUserProfileImage] = useState<File | null>(null);
  const [userProfileImagePreview, setUserProfileImagePreview] = useState<string | null>(null);
  const [isImageDragging, setIsImageDragging] = useState(false);

  // Active navigation section tracking
  const [activeSection, setActiveSection] = useState<string>("roast-me");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up Intersection Observer for nav section tracking
  useEffect(() => {
    const sections = ["roast-me", "mt-roastmore", "archetypes"];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px", // Trigger when section is in top 30% of viewport
        threshold: 0,
      }
    );

    // Observe all sections
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // LinkedIn preview state
  const [linkedinPreview, setLinkedinPreview] = useState<{
    loading: boolean;
    fetched: boolean;
    name: string | null;
    headline: string | null;
    hasPhoto: boolean;
    experienceCount: number;
    qualityScore: number; // 0-100
    error: string | null;
  }>({
    loading: false,
    fetched: false,
    name: null,
    headline: null,
    hasPhoto: false,
    experienceCount: 0,
    qualityScore: 0,
    error: null,
  });

  // Website preview state
  const [websitePreview, setWebsitePreview] = useState<{
    loading: boolean;
    fetched: boolean;
    title: string | null;
    description: string | null;
    contentLength: number;
    qualityScore: number;
    error: string | null;
  }>({
    loading: false,
    fetched: false,
    title: null,
    description: null,
    contentLength: 0,
    qualityScore: 0,
    error: null,
  });

  // Resume preview state
  const [resumePreview, setResumePreview] = useState<{
    loading: boolean;
    analyzed: boolean;
    fileName: string | null;
    pageCount: number;
    textLength: number;
    qualityScore: number;
    error: string | null;
  }>({
    loading: false,
    analyzed: false,
    fileName: null,
    pageCount: 0,
    textLength: 0,
    qualityScore: 0,
    error: null,
  });

  // X handle state
  const [xHandle, setXHandle] = useState("");

  // X preview state
  const [xPreview, setXPreview] = useState<{
    loading: boolean;
    fetched: boolean;
    name: string | null;
    handle: string | null;
    bio: string | null;
    hasPhoto: boolean;
    profileImageUrl: string | null;
    followers: number;
    tweetCount: number;
    qualityScore: number;
    profileText: string | null;
    error: string | null;
  }>({
    loading: false,
    fetched: false,
    name: null,
    handle: null,
    bio: null,
    hasPhoto: false,
    profileImageUrl: null,
    followers: 0,
    tweetCount: 0,
    qualityScore: 0,
    profileText: null,
    error: null,
  });

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

  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    if (smartInput) return; // Don't rotate when user is typing
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [smartInput]);

  // Auto-detect input type and sync to appropriate state
  useEffect(() => {
    const detected = detectInputType(smartInput);
    setDetectedType(detected);

    if (detected) {
      setUrlType(detected);
      // Sync to the appropriate state variable
      if (detected === "linkedin") {
        setLinkedinUrl(smartInput);
        setWebsiteUrl("");
        setXHandle("");
      } else if (detected === "website") {
        setWebsiteUrl(smartInput);
        setLinkedinUrl("");
        setXHandle("");
      } else if (detected === "x") {
        setXHandle(smartInput);
        setLinkedinUrl("");
        setWebsiteUrl("");
      }
    }
  }, [smartInput]);

  // Fetch LinkedIn preview when URL is valid
  useEffect(() => {
    // Only fetch for LinkedIn URLs
    if (urlType !== "linkedin") {
      setLinkedinPreview(prev => ({ ...prev, fetched: false, loading: false }));
      return;
    }

    const url = linkedinUrl.trim();
    const isValid = LINKEDIN_URL_REGEX.test(url);

    if (!isValid) {
      setLinkedinPreview(prev => ({ ...prev, fetched: false, loading: false, error: null }));
      return;
    }

    // Debounce the fetch
    const timeoutId = setTimeout(async () => {
      setLinkedinPreview(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/linkedin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (data.success) {
          // Calculate quality score based on available data
          let qualityScore = 20; // Base score for having a valid profile

          const experiences = data.data?.experiences || [];
          const hasHeadline = data.data?.headline && data.data.headline.length > 10;
          const hasSummary = data.data?.summary && data.data.summary.length > 50;
          const hasDescriptions = experiences.some((e: { description?: string }) => e.description && e.description.length > 20);
          const hasPhoto = !!data.profilePicUrl;

          if (hasHeadline) qualityScore += 20;
          if (hasSummary) qualityScore += 20;
          if (experiences.length > 0) qualityScore += 15;
          if (experiences.length > 2) qualityScore += 10;
          if (hasDescriptions) qualityScore += 10;
          if (hasPhoto) qualityScore += 5;

          qualityScore = Math.min(qualityScore, 100);

          setLinkedinPreview({
            loading: false,
            fetched: true,
            name: data.data?.full_name || null,
            headline: data.data?.headline || null,
            hasPhoto,
            experienceCount: experiences.length,
            qualityScore,
            error: null,
          });

          // Also set the profile pic URL for the roast
          setProfilePicUrl(data.profilePicUrl || null);
          setProfileText(data.profileText || "");
        } else {
          setLinkedinPreview(prev => ({
            ...prev,
            loading: false,
            fetched: true,
            qualityScore: 0,
            error: data.message || "Could not fetch profile",
          }));
        }
      } catch {
        setLinkedinPreview(prev => ({
          ...prev,
          loading: false,
          fetched: true,
          qualityScore: 0,
          error: "Failed to fetch profile",
        }));
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [linkedinUrl, urlType]);

  // Fetch website preview when URL is valid
  useEffect(() => {
    if (urlType !== "website") {
      setWebsitePreview(prev => ({ ...prev, fetched: false, loading: false }));
      return;
    }

    const url = websiteUrl.trim();
    const isValid = WEBSITE_URL_REGEX.test(url);

    if (!isValid) {
      setWebsitePreview(prev => ({ ...prev, fetched: false, loading: false, error: null }));
      return;
    }

    const timeoutId = setTimeout(async () => {
      setWebsitePreview(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (data.success) {
          const textLength = data.profileText?.length || 0;
          let qualityScore = 10; // Base score

          if (textLength > 100) qualityScore += 15;
          if (textLength > 300) qualityScore += 20;
          if (textLength > 500) qualityScore += 15;
          if (textLength > 1000) qualityScore += 15;
          if (data.quality === "high") qualityScore += 25;

          qualityScore = Math.min(qualityScore, 100);

          // Extract title from content or URL
          const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
          const domain = urlObj.hostname.replace("www.", "");

          setWebsitePreview({
            loading: false,
            fetched: true,
            title: domain,
            description: data.profileText?.slice(0, 100) || null,
            contentLength: textLength,
            qualityScore,
            error: null,
          });

          setProfileText(data.profileText || "");
        } else {
          setWebsitePreview(prev => ({
            ...prev,
            loading: false,
            fetched: true,
            qualityScore: 0,
            error: data.message || "Could not fetch website",
          }));
        }
      } catch {
        setWebsitePreview(prev => ({
          ...prev,
          loading: false,
          fetched: true,
          qualityScore: 0,
          error: "Failed to fetch website",
        }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [websiteUrl, urlType]);

  // Fetch X profile preview when handle is valid
  useEffect(() => {
    if (urlType !== "x") {
      setXPreview(prev => ({ ...prev, fetched: false, loading: false }));
      return;
    }

    const handle = xHandle.trim().replace(/^@/, "");
    const isValid = handle.length > 0 && X_HANDLE_REGEX.test(handle);

    if (!isValid) {
      setXPreview(prev => ({ ...prev, fetched: false, loading: false, error: null }));
      return;
    }

    const timeoutId = setTimeout(async () => {
      setXPreview(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/x", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle }),
        });

        const data = await response.json();

        if (data.success) {
          setXPreview({
            loading: false,
            fetched: true,
            name: data.profile?.name || null,
            handle: data.profile?.handle || handle,
            bio: data.profile?.bio || null,
            hasPhoto: !!data.profile?.profileImageUrl,
            profileImageUrl: data.profile?.profileImageUrl || null,
            followers: data.profile?.followers || 0,
            tweetCount: data.profile?.tweetCount || 0,
            qualityScore: data.quality?.score || 50,
            profileText: data.profileText || null,
            error: null,
          });

          // Set the profile pic URL and text for roasting
          if (data.profile?.profileImageUrl) {
            setProfilePicUrl(data.profile.profileImageUrl);
          }
          setProfileText(data.profileText || "");
        } else {
          setXPreview(prev => ({
            ...prev,
            loading: false,
            fetched: true,
            qualityScore: 0,
            profileText: null,
            profileImageUrl: null,
            error: data.error || "Could not fetch X profile",
          }));
        }
      } catch {
        setXPreview(prev => ({
          ...prev,
          loading: false,
          fetched: true,
          qualityScore: 0,
          error: "Failed to fetch X profile",
        }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [xHandle, urlType]);

  // Analyze resume when file is selected
  useEffect(() => {
    if (!file || urlType !== "resume") {
      setResumePreview(prev => ({ ...prev, analyzed: false, loading: false }));
      return;
    }

    const analyzeResume = async () => {
      setResumePreview(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Read file size and estimate quality
        const fileSizeKB = file.size / 1024;
        let qualityScore = 20; // Base score for having a file

        // Larger files typically have more content
        if (fileSizeKB > 50) qualityScore += 20;
        if (fileSizeKB > 100) qualityScore += 20;
        if (fileSizeKB > 200) qualityScore += 15;

        // PDF files are better quality usually
        if (file.type === "application/pdf") qualityScore += 15;

        // Estimate page count from file size (rough heuristic: ~50KB per page)
        const estimatedPages = Math.max(1, Math.round(fileSizeKB / 50));

        qualityScore = Math.min(qualityScore, 100);

        setResumePreview({
          loading: false,
          analyzed: true,
          fileName: file.name,
          pageCount: estimatedPages,
          textLength: Math.round(fileSizeKB * 10), // Rough estimate
          qualityScore,
          error: null,
        });
      } catch {
        setResumePreview(prev => ({
          ...prev,
          loading: false,
          analyzed: true,
          qualityScore: 0,
          error: "Could not analyze resume",
        }));
      }
    };

    analyzeResume();
  }, [file, urlType]);

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

  // Image handling functions
  const handleImageFile = useCallback((imageFile: File) => {
    if (!imageFile.type.startsWith("image/")) return;

    setUserProfileImage(imageFile);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setUserProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(imageFile);
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageDragging(true);
  }, []);

  const handleImageDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageDragging(false);
  }, []);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type.startsWith("image/")) {
      handleImageFile(droppedFile);
    }
  }, [handleImageFile]);

  const handleImagePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          handleImageFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  }, [handleImageFile]);

  const handleImageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleImageFile(selectedFile);
    }
  }, [handleImageFile]);

  const clearUserImage = useCallback(() => {
    setUserProfileImage(null);
    setUserProfileImagePreview(null);
  }, []);

  // Global paste listener for images
  useEffect(() => {
    document.addEventListener("paste", handleImagePaste);
    return () => document.removeEventListener("paste", handleImagePaste);
  }, [handleImagePaste]);

  const handleMagicLinkSubmit = async () => {
    if (!currentUrl || !dreamRole) return;

    setIsLoadingLinkedin(true);
    setError(null);

    // For website URLs, try to scrape content
    if (detectedType === "website") {
      try {
        const response = await fetch("/api/website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: currentUrl }),
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
          setProfileText(`Website: ${currentUrl}\n\nPlease paste your bio, work experience, and achievements below:`);
        }
        if (data.message) {
          setError(data.message);
        }
      } catch {
        setInputMode("manual");
        setProfileText(`Website: ${currentUrl}\n\nPlease paste your bio, work experience, and achievements below:`);
        setError("Could not fetch website. Please paste your content manually.");
      } finally {
        setIsLoadingLinkedin(false);
      }
      return;
    }

    // X (Twitter) handle handling
    if (detectedType === "x") {
      try {
        // If we already have preview data with good quality, use it directly
        if (xPreview.fetched && !xPreview.error && xPreview.profileText) {
          // Check if quality is good enough to proceed directly
          if (xPreview.qualityScore >= 50) {
            setProfileText(xPreview.profileText);
            setProfilePicUrl(xPreview.profileImageUrl || null);
            setInputSource("manual");
            setIsLoadingLinkedin(false);
            await handleAnalyzeWithData(xPreview.profileText, xPreview.profileImageUrl || null);
            return;
          }
        }

        // Fetch fresh data
        const handle = xHandle.trim().replace(/^@/, "");
        const response = await fetch("/api/x", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle }),
        });

        const data = await response.json();

        if (data.success && data.profileText) {
          // Check quality score
          const qualityScore = data.quality?.score || 0;

          if (qualityScore >= 50) {
            // Good enough quality - proceed to analyze
            setProfileText(data.profileText);
            setProfilePicUrl(data.profile?.profileImageUrl || null);
            setInputSource("manual");
            setIsLoadingLinkedin(false);
            await handleAnalyzeWithData(data.profileText, data.profile?.profileImageUrl || null);
            return;
          }

          // Low quality - switch to manual mode with what we got
          setInputMode("manual");
          setProfileText(data.profileText);
          if (data.profile?.profileImageUrl) {
            setProfilePicUrl(data.profile.profileImageUrl);
          }
          setError(
            data.isMock
              ? "X API access is limited. Your profile data couldn't be fully fetched. Please add more details about your work experience and achievements below."
              : "We found your X profile, but need more details for a quality roast. Please add your work experience and achievements below."
          );
          return;
        }

        // Error case
        setInputMode("manual");
        setProfileText(`X Profile: @${handle}\n\nPlease paste your bio, work experience, and achievements below:`);
        setError(data.error || "Could not fetch your X profile. Please paste your professional details below.");
      } catch {
        setInputMode("manual");
        setProfileText(`X Profile: @${xHandle.trim().replace(/^@/, "")}\n\nPlease paste your bio, work experience, and achievements below:`);
        setError("Could not connect to X. Please paste your professional details below so we can roast you properly!");
      } finally {
        setIsLoadingLinkedin(false);
      }
      return;
    }

    // LinkedIn URL handling
    try {
      setAttemptedLinkedInFetch(true);

      // If we already have preview data, use it directly (avoid re-fetching)
      if (linkedinPreview.fetched && !linkedinPreview.error && profileText) {
        setInputSource("linkedin");
        setIsLoadingLinkedin(false);
        await handleAnalyzeWithData(profileText, profilePicUrl);
        return;
      }

      const response = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentUrl }),
      });

      const data = await response.json();

      // HIGH QUALITY: Proceed directly to analyzing
      if (data.success && data.quality === "high" && data.profileText && data.profileText.length >= 50) {
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
          "We found your basic LinkedIn profile info, but we need more details to give you a quality roast. Please add your job descriptions, achievements, and what you've built below."
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
        data.message || "We couldn't fetch enough data from your profile. Please paste your experience details below so we can give you an accurate roast!"
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

      // Priority: user-uploaded image > fetched profile pic URL
      if (userProfileImage && useProfilePic) {
        formData.append("profileImage", userProfileImage);
      } else if (picUrl && useProfilePic) {
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

      const data = await response.json();
      const { cardId: newCardId, ...roastResult } = data;
      setResult(roastResult);
      setCardId(newCardId || null);
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

        const data = await response.json();
        const { cardId: newCardId, ...roastResult } = data;
        setResult(roastResult);
        setCardId(newCardId || null);
        setStep("results");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setStep("upload");
        setInputMode("manual");
      }
    }
  };

  // Handle resume upload directly from main form
  const handleResumeSubmit = async () => {
    if (!dreamRole || !file) return;

    setInputSource("pdf");
    setIsLoadingLinkedin(true);
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

      const data = await response.json();
      const { cardId: newCardId, ...roastResult } = data;
      setResult(roastResult);
      setCardId(newCardId || null);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("upload");
    } finally {
      setIsLoadingLinkedin(false);
    }
  };

  const handleStartOver = () => {
    // Reset URL to home page
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/");
    }
    setStep("upload");
    setInputMode("magic");
    setFile(null);
    setLinkedinUrl("");
    setWebsiteUrl("");
    setProfileText("");
    setProfilePicUrl(null);
    setUseProfilePic(true);
    setAttemptedLinkedInFetch(false);
    setUserProfileImage(null);
    setUserProfileImagePreview(null);
    setLinkedinPreview({
      loading: false,
      fetched: false,
      name: null,
      headline: null,
      hasPhoto: false,
      experienceCount: 0,
      qualityScore: 0,
      error: null,
    });
    setWebsitePreview({
      loading: false,
      fetched: false,
      title: null,
      description: null,
      contentLength: 0,
      qualityScore: 0,
      error: null,
    });
    setResumePreview({
      loading: false,
      analyzed: false,
      fileName: null,
      pageCount: 0,
      textLength: 0,
      qualityScore: 0,
      error: null,
    });
    setDreamRole("founder");
    setResult(null);
    setCardId(null);
    setError(null);
    setInputSource("linkedin");
    setUrlType("linkedin");
    window.scrollTo(0, 0);
  };

  const canSubmitManual = profileText.trim().length >= 50 || file !== null;

  // Get the current URL based on smart input or resume mode
  const currentUrl = urlType === "resume" ? "" : smartInput;

  // Check if URL/handle is valid based on detected type
  const isValidUrl = useMemo(() => {
    if (urlType === "resume") return false;
    if (!detectedType || !smartInput.trim()) return false;

    if (detectedType === "linkedin") {
      return LINKEDIN_URL_REGEX.test(smartInput.trim());
    }
    if (detectedType === "x") {
      const handle = smartInput.trim().replace(/^@/, "");
      return handle.length > 0 && X_HANDLE_REGEX.test(handle);
    }
    return WEBSITE_URL_REGEX.test(smartInput.trim());
  }, [smartInput, detectedType, urlType]);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav - Sticky with backdrop blur */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Left: Logo */}
          <button
            onClick={handleStartOver}
            className="font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            PM Roast
          </button>

          {/* Center: Navigation Links */}
          <div className="hidden sm:flex items-center gap-1">
            <a
              href="/#roast-me"
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                activeSection === "roast-me"
                  ? "text-foreground bg-white/5 border-b-2 border-indigo-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              Roast Me
            </a>
            <a
              href="/#mt-roastmore"
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                activeSection === "mt-roastmore"
                  ? "text-foreground bg-white/5 border-b-2 border-indigo-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              Mt. Roastmore
            </a>
            <a
              href="/#archetypes"
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                activeSection === "archetypes"
                  ? "text-foreground bg-white/5 border-b-2 border-indigo-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              Archetypes
            </a>
          </div>

          {/* Right: Social Links */}
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
              <div id="roast-me" className="max-w-6xl mx-auto scroll-mt-20">
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
                      {/* Smart Unified Input */}
                      <div className="space-y-3">
                        {/* Input with dynamic icon */}
                        <div className="relative">
                          {/* Dynamic leading icon based on detected type */}
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={detectedType || "default"}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                className={detectedType ? "text-white" : "text-white/50"}
                              >
                                {detectedType === "linkedin" ? (
                                  <svg className="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                ) : detectedType === "x" ? (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                  </svg>
                                ) : detectedType === "website" ? (
                                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                )}
                              </motion.div>
                            </AnimatePresence>
                          </div>

                          {/* Input field with rotating placeholder */}
                          <input
                            type="text"
                            value={smartInput}
                            onChange={(e) => setSmartInput(e.target.value)}
                            className={`w-full h-12 pl-11 bg-white/10 backdrop-blur-sm border rounded-lg text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-transparent transition-all ${
                              isValidUrl ? "border-green-500/50 pr-10" : "border-white/20 pr-4"
                            }`}
                          />

                          {/* Animated placeholder (only show when input is empty) */}
                          {!smartInput && (
                            <div className="absolute left-11 top-1/2 -translate-y-1/2 pointer-events-none">
                              <AnimatePresence mode="wait">
                                <motion.span
                                  key={placeholderIndex}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.3 }}
                                  className="text-white/40 text-base"
                                >
                                  {PLACEHOLDER_EXAMPLES[placeholderIndex].text}
                                </motion.span>
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Validation checkmark */}
                          {isValidUrl && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}
                        </div>

                        {/* Supported platform badges */}
                        <div className="flex items-center justify-center gap-3">
                          {/* LinkedIn badge */}
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 ${
                            detectedType === "linkedin"
                              ? "bg-[#0A66C2]/20 border border-[#0A66C2]/40"
                              : "bg-white/5 border border-transparent"
                          }`}>
                            <svg className={`w-3.5 h-3.5 transition-colors duration-200 ${
                              detectedType === "linkedin" ? "text-[#0A66C2]" : "text-white/30"
                            }`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            <span className={`text-[10px] font-medium transition-colors duration-200 ${
                              detectedType === "linkedin" ? "text-[#0A66C2]" : "text-white/30"
                            }`}>LinkedIn</span>
                          </div>

                          {/* Portfolio badge */}
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 ${
                            detectedType === "website"
                              ? "bg-emerald-500/20 border border-emerald-500/40"
                              : "bg-white/5 border border-transparent"
                          }`}>
                            <svg className={`w-3.5 h-3.5 transition-colors duration-200 ${
                              detectedType === "website" ? "text-emerald-400" : "text-white/30"
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <span className={`text-[10px] font-medium transition-colors duration-200 ${
                              detectedType === "website" ? "text-emerald-400" : "text-white/30"
                            }`}>Portfolio</span>
                          </div>

                          {/* Resume upload button */}
                          <button
                            onClick={() => setUrlType(urlType === "resume" ? "linkedin" : "resume")}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 ${
                              urlType === "resume"
                                ? "bg-purple-500/20 border border-purple-500/40"
                                : "bg-white/5 border border-transparent hover:bg-white/10"
                            }`}
                          >
                            <svg className={`w-3.5 h-3.5 transition-colors duration-200 ${
                              urlType === "resume" ? "text-purple-400" : "text-white/30"
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className={`text-[10px] font-medium transition-colors duration-200 ${
                              urlType === "resume" ? "text-purple-400" : "text-white/30"
                            }`}>Resume</span>
                          </button>

                          {/* X badge - under construction */}
                          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-transparent opacity-40 cursor-not-allowed" title="Coming soon">
                            <svg className="w-3.5 h-3.5 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <span className="text-[8px]">🚧</span>
                          </div>
                        </div>
                      </div>

                      {/* Resume Upload (shown when resume is selected) */}
                      <AnimatePresence>
                        {urlType === "resume" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`
                                relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer
                                ${isDragging ? "border-[#6366f1] bg-[#6366f1]/10" : "border-white/30 hover:border-white/50"}
                                ${file ? "border-green-500/50 bg-green-500/10" : ""}
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
                                  <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-sm text-white truncate">{file.name}</span>
                                  <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); }}
                                    className="p-1 hover:bg-white/10 rounded shrink-0"
                                  >
                                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <span className="text-sm text-white/60">Drop your resume or click to upload</span>
                                  <span className="text-xs text-white/40">PDF only</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* LinkedIn Preview Card - shows quality score and photo status */}
                      <AnimatePresence>
                        {urlType === "linkedin" && isValidUrl && (linkedinPreview.loading || linkedinPreview.fetched) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              {linkedinPreview.loading ? (
                                <div className="flex items-center justify-center gap-2 py-2">
                                  <svg className="animate-spin h-4 w-4 text-white/60" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span className="text-xs text-white/60">Fetching profile...</span>
                                </div>
                              ) : linkedinPreview.error ? (
                                <div className="flex items-center gap-2 text-amber-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  <span className="text-xs">{linkedinPreview.error}</span>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {/* Profile Name & Headline */}
                                  {linkedinPreview.name && (
                                    <div className="flex items-start gap-2">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {linkedinPreview.name.charAt(0)}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white truncate">{linkedinPreview.name}</p>
                                        {linkedinPreview.headline && (
                                          <p className="text-[10px] text-white/50 truncate">{linkedinPreview.headline}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Quality Score Bar */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-white/50 uppercase tracking-wider">Profile Quality</span>
                                      <span className={`text-[10px] font-bold ${
                                        linkedinPreview.qualityScore >= 70 ? "text-green-400" :
                                        linkedinPreview.qualityScore >= 55 ? "text-emerald-400" :
                                        linkedinPreview.qualityScore >= 40 ? "text-amber-400" : "text-red-400"
                                      }`}>
                                        {linkedinPreview.qualityScore >= 70 ? "Excellent" :
                                         linkedinPreview.qualityScore >= 55 ? "Good" :
                                         linkedinPreview.qualityScore >= 40 ? "Bare Minimum" : "Not Enough"}
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${linkedinPreview.qualityScore}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`h-full rounded-full ${
                                          linkedinPreview.qualityScore >= 70 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                                          linkedinPreview.qualityScore >= 55 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                                          linkedinPreview.qualityScore >= 40 ? "bg-gradient-to-r from-amber-500 to-orange-400" :
                                          "bg-gradient-to-r from-red-500 to-rose-400"
                                        }`}
                                      />
                                    </div>
                                  </div>

                                  {/* Status Pills */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {/* Photo Status */}
                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                      linkedinPreview.hasPhoto || userProfileImagePreview
                                        ? "bg-green-500/15 text-green-400 border border-green-500/30"
                                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                    }`}>
                                      {linkedinPreview.hasPhoto || userProfileImagePreview ? (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                                        </svg>
                                      )}
                                      {linkedinPreview.hasPhoto
                                        ? "Photo found"
                                        : userProfileImagePreview
                                          ? "Photo uploaded"
                                          : "No photo - paste yours below"}
                                    </div>

                                    {/* Experience Count */}
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/60 border border-white/10">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      {linkedinPreview.experienceCount} role{linkedinPreview.experienceCount !== 1 ? "s" : ""} found
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Website Preview Card */}
                      <AnimatePresence>
                        {urlType === "website" && isValidUrl && (websitePreview.loading || websitePreview.fetched) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              {websitePreview.loading ? (
                                <div className="flex items-center justify-center gap-2 py-2">
                                  <svg className="animate-spin h-4 w-4 text-white/60" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span className="text-xs text-white/60">Scanning website...</span>
                                </div>
                              ) : websitePreview.error ? (
                                <div className="flex items-center gap-2 text-amber-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  <span className="text-xs">{websitePreview.error}</span>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {/* Website Info */}
                                  <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shrink-0">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                      </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-white truncate">{websitePreview.title}</p>
                                      <p className="text-[10px] text-white/50">Personal/Portfolio site</p>
                                    </div>
                                  </div>

                                  {/* Quality Score Bar */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-white/50 uppercase tracking-wider">Content Quality</span>
                                      <span className={`text-[10px] font-bold ${
                                        websitePreview.qualityScore >= 70 ? "text-green-400" :
                                        websitePreview.qualityScore >= 55 ? "text-emerald-400" :
                                        websitePreview.qualityScore >= 40 ? "text-amber-400" : "text-red-400"
                                      }`}>
                                        {websitePreview.qualityScore >= 70 ? "Excellent" :
                                         websitePreview.qualityScore >= 55 ? "Good" :
                                         websitePreview.qualityScore >= 40 ? "Bare Minimum" : "Not Enough"}
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${websitePreview.qualityScore}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`h-full rounded-full ${
                                          websitePreview.qualityScore >= 70 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                                          websitePreview.qualityScore >= 55 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                                          websitePreview.qualityScore >= 40 ? "bg-gradient-to-r from-amber-500 to-orange-400" :
                                          "bg-gradient-to-r from-red-500 to-rose-400"
                                        }`}
                                      />
                                    </div>
                                  </div>

                                  {/* Status Pills */}
                                  <div className="flex flex-wrap gap-1.5">
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/60 border border-white/10">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      {websitePreview.contentLength > 1000 ? `${Math.round(websitePreview.contentLength / 1000)}k` : websitePreview.contentLength} chars found
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* X Profile Preview Card */}
                      <AnimatePresence>
                        {urlType === "x" && isValidUrl && (xPreview.loading || xPreview.fetched) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              {xPreview.loading ? (
                                <div className="flex items-center justify-center gap-2 py-2">
                                  <svg className="animate-spin h-4 w-4 text-white/60" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span className="text-xs text-white/60">Fetching X profile...</span>
                                </div>
                              ) : xPreview.error ? (
                                <div className="flex items-center gap-2 text-amber-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  <span className="text-xs">{xPreview.error}</span>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {/* X Profile Info */}
                                  <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                      </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-white truncate">{xPreview.name}</p>
                                      <p className="text-[10px] text-white/50">@{xPreview.handle}</p>
                                    </div>
                                    {xPreview.hasPhoto && (
                                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                                        <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-[10px] text-green-400 font-medium">Photo</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Bio preview */}
                                  {xPreview.bio && (
                                    <p className="text-[11px] text-white/60 line-clamp-2">{xPreview.bio}</p>
                                  )}

                                  {/* Quality Score Bar */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-white/50 uppercase tracking-wider">Profile Quality</span>
                                      <span className={`text-[10px] font-bold ${
                                        xPreview.qualityScore >= 70 ? "text-green-400" :
                                        xPreview.qualityScore >= 50 ? "text-emerald-400" :
                                        xPreview.qualityScore >= 30 ? "text-amber-400" : "text-red-400"
                                      }`}>
                                        {xPreview.qualityScore >= 70 ? "Excellent" :
                                         xPreview.qualityScore >= 50 ? "Good" :
                                         xPreview.qualityScore >= 30 ? "Limited" : "Minimal"}
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${xPreview.qualityScore}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`h-full rounded-full ${
                                          xPreview.qualityScore >= 70 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                                          xPreview.qualityScore >= 50 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                                          xPreview.qualityScore >= 30 ? "bg-gradient-to-r from-amber-500 to-orange-400" :
                                          "bg-gradient-to-r from-red-500 to-rose-400"
                                        }`}
                                      />
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  <div className="flex flex-wrap gap-1.5">
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/60 border border-white/10">
                                      <span className="font-bold text-white">{xPreview.followers >= 1000 ? `${(xPreview.followers / 1000).toFixed(1)}k` : xPreview.followers}</span> followers
                                    </div>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/60 border border-white/10">
                                      <span className="font-bold text-white">{xPreview.tweetCount >= 1000 ? `${(xPreview.tweetCount / 1000).toFixed(1)}k` : xPreview.tweetCount}</span> posts
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Resume Preview Card */}
                      <AnimatePresence>
                        {urlType === "resume" && file && (resumePreview.loading || resumePreview.analyzed) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                              {resumePreview.loading ? (
                                <div className="flex items-center justify-center gap-2 py-2">
                                  <svg className="animate-spin h-4 w-4 text-white/60" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span className="text-xs text-white/60">Analyzing resume...</span>
                                </div>
                              ) : resumePreview.error ? (
                                <div className="flex items-center gap-2 text-amber-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  <span className="text-xs">{resumePreview.error}</span>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {/* Resume Info */}
                                  <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-white truncate">{resumePreview.fileName}</p>
                                      <p className="text-[10px] text-white/50">PDF Resume</p>
                                    </div>
                                  </div>

                                  {/* Quality Score Bar */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-white/50 uppercase tracking-wider">Document Quality</span>
                                      <span className={`text-[10px] font-bold ${
                                        resumePreview.qualityScore >= 70 ? "text-green-400" :
                                        resumePreview.qualityScore >= 55 ? "text-emerald-400" :
                                        resumePreview.qualityScore >= 40 ? "text-amber-400" : "text-red-400"
                                      }`}>
                                        {resumePreview.qualityScore >= 70 ? "Excellent" :
                                         resumePreview.qualityScore >= 55 ? "Good" :
                                         resumePreview.qualityScore >= 40 ? "Bare Minimum" : "Not Enough"}
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${resumePreview.qualityScore}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`h-full rounded-full ${
                                          resumePreview.qualityScore >= 70 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                                          resumePreview.qualityScore >= 55 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                                          resumePreview.qualityScore >= 40 ? "bg-gradient-to-r from-amber-500 to-orange-400" :
                                          "bg-gradient-to-r from-red-500 to-rose-400"
                                        }`}
                                      />
                                    </div>
                                  </div>

                                  {/* Status Pills */}
                                  <div className="flex flex-wrap gap-1.5">
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/60 border border-white/10">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                      ~{resumePreview.pageCount} page{resumePreview.pageCount !== 1 ? "s" : ""}
                                    </div>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/30">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Ready to analyze
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Profile Photo Upload - shown when no photo scraped or user wants to override */}
                      <AnimatePresence>
                        {(isValidUrl || (urlType === "resume" && file)) && useProfilePic && !linkedinPreview.hasPhoto && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pt-1">
                              {userProfileImagePreview ? (
                                /* Image Preview */
                                <div className="flex items-center gap-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                                  <div className="relative">
                                    <img
                                      src={userProfileImagePreview}
                                      alt="Profile"
                                      className="w-12 h-12 rounded-full object-cover border-2 border-green-500/50"
                                    />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-white truncate">Photo added</p>
                                    <p className="text-[10px] text-white/50">Will appear on your card</p>
                                  </div>
                                  <button
                                    onClick={clearUserImage}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4 text-white/50 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                /* Upload Area - more prominent when photo wasn't scraped */
                                <div
                                  onDragOver={handleImageDragOver}
                                  onDragLeave={handleImageDragLeave}
                                  onDrop={handleImageDrop}
                                  className={`relative border border-dashed rounded-lg p-3 text-center transition-all cursor-pointer ${
                                    isImageDragging
                                      ? "border-[#6366f1] bg-[#6366f1]/10"
                                      : "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
                                  }`}
                                >
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageInputChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span className="text-xs text-amber-300 font-medium">
                                        Add your photo for a personalized card
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-white/40">
                                      Copy from LinkedIn profile → paste here (or drop/click)
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Inline Goal Selector - appears when URL is valid OR file is selected */}
                      <AnimatePresence>
                        {(isValidUrl || (urlType === "resume" && file)) && (
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
                              <div className="flex flex-wrap justify-center gap-1.5">
                                {(Object.entries(DREAM_ROLES) as [DreamRole, typeof DREAM_ROLES[DreamRole]][]).map(([key, role]) => (
                                  <button
                                    key={key}
                                    onClick={() => setDreamRole(key)}
                                    className={`px-2.5 py-1.5 rounded-full transition-all text-[11px] font-medium whitespace-nowrap ${
                                      dreamRole === key
                                        ? "bg-[#6366f1]/30 border-[#6366f1] border text-white"
                                        : "bg-white/5 border-white/10 border hover:bg-white/10 text-white/70 hover:text-white/90"
                                    }`}
                                  >
                                    <span className={`mr-1 ${dreamRole === key ? "" : "grayscale opacity-60"}`}>{role.emoji}</span>
                                    {role.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <Button
                        onClick={urlType === "resume" ? handleResumeSubmit : handleMagicLinkSubmit}
                        disabled={urlType === "resume" ? (!file || !dreamRole || isLoadingLinkedin) : (!isValidUrl || !dreamRole || isLoadingLinkedin)}
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

                      {/* Manual fallback - centered */}
                      <div className="flex justify-center text-[10px]">
                        <button
                          onClick={() => setInputMode("manual")}
                          className="text-white/40 hover:text-white/70 transition-colors"
                        >
                          Enter manually
                        </button>
                      </div>

                      {/* Social Proof Ticker */}
                      <p className="text-[10px] text-white/40 text-center">
                        {roastCount.toLocaleString()} PMs roasted
                      </p>
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

                      {/* Profile Photo Status - shown when switching from LinkedIn with photo found */}
                      {attemptedLinkedInFetch && profilePicUrl && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-green-400 text-xs font-medium">Profile photo found</span>
                          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
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

                      {/* Profile Photo Upload - Manual Mode */}
                      <AnimatePresence>
                        {canSubmitManual && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pt-1">
                              {userProfileImagePreview ? (
                                /* Image Preview */
                                <div className="flex items-center gap-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                                  <div className="relative">
                                    <img
                                      src={userProfileImagePreview}
                                      alt="Profile"
                                      className="w-12 h-12 rounded-full object-cover border-2 border-green-500/50"
                                    />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-white truncate">Photo added</p>
                                    <p className="text-[10px] text-white/50">Will appear on your card</p>
                                  </div>
                                  <button
                                    onClick={clearUserImage}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4 text-white/50 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                /* Upload Area */
                                <div
                                  onDragOver={handleImageDragOver}
                                  onDragLeave={handleImageDragLeave}
                                  onDrop={handleImageDrop}
                                  className={`relative border border-dashed rounded-lg p-3 text-center transition-all cursor-pointer ${
                                    isImageDragging
                                      ? "border-[#6366f1] bg-[#6366f1]/10"
                                      : "border-white/20 hover:border-white/40"
                                  }`}
                                >
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageInputChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span className="text-xs text-white/60">
                                        Add your photo (optional)
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-white/40">
                                      Drop, paste, or click to upload
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

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
                              <div className="flex flex-wrap justify-center gap-1.5">
                                {(Object.entries(DREAM_ROLES) as [DreamRole, typeof DREAM_ROLES[DreamRole]][]).map(([key, role]) => (
                                  <button
                                    key={key}
                                    onClick={() => setDreamRole(key)}
                                    className={`px-2.5 py-1.5 rounded-full transition-all text-[11px] font-medium whitespace-nowrap ${
                                      dreamRole === key
                                        ? "bg-[#6366f1]/30 border-[#6366f1] border text-white"
                                        : "bg-white/5 border-white/10 border hover:bg-white/10 text-white/70 hover:text-white/90"
                                    }`}
                                  >
                                    <span className={`mr-1 ${dreamRole === key ? "" : "grayscale opacity-60"}`}>{role.emoji}</span>
                                    {role.label}
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

              {/* Famous Cards Gallery */}
              <div id="mt-roastmore" className="scroll-mt-20">
                <FamousCardsGallery />
              </div>

              {/* Example Gallery */}
              <div id="archetypes" className="scroll-mt-20">
                <ExampleGallery />
              </div>
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
              <AnalyzingLoader hasProfilePic={inputSource === "linkedin" ? !!profilePicUrl && useProfilePic : undefined} />
            </motion.div>
          )}

          {step === "results" && result && dreamRole && (
            <Results
              key="results"
              result={result}
              dreamRole={dreamRole}
              onStartOver={handleStartOver}
              cardId={cardId || undefined}
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
