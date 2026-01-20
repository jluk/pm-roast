import axios, { AxiosError } from "axios";

// LinkdAPI endpoint - correct URL is linkdapi.com (not api.linkdapi.com)
const LINKDAPI_URL = "https://linkdapi.com/api/v1/profile/overview";

// Types for the LinkedIn profile data we care about
export interface LinkedInExperience {
  title: string | null;
  company: string | null;
  company_linkedin_profile_url: string | null;
  description: string | null;
  starts_at: { day: number; month: number; year: number } | null;
  ends_at: { day: number; month: number; year: number } | null;
  location: string | null;
}

export interface LinkedInEducation {
  school: string | null;
  degree_name: string | null;
  field_of_study: string | null;
  starts_at: { day: number; month: number; year: number } | null;
  ends_at: { day: number; month: number; year: number } | null;
  description: string | null;
}

export interface LinkedInProfileData {
  full_name: string | null;
  occupation: string | null;
  headline: string | null;
  summary: string | null;
  profile_pic_url: string | null;
  experiences: LinkedInExperience[];
  education: LinkedInEducation[];
}

export interface FetchLinkedInResult {
  success: boolean;
  data?: LinkedInProfileData;
  profileText?: string;
  profilePicUrl?: string | null;
  error?: string;
  errorCode?: "NOT_FOUND" | "RATE_LIMITED" | "UNAUTHORIZED" | "UNKNOWN";
  isMock?: boolean;
}

// Mock profile data for development/testing when API key is missing
const MOCK_PROFILE: LinkedInProfileData = {
  full_name: "Alex Johnson",
  occupation: "Senior Product Manager at TechCorp",
  headline: "Building products that users love | Ex-Google, Ex-Meta",
  summary: "Product leader with 8+ years of experience shipping consumer and B2B products at scale. Passionate about user research, data-driven decision making, and building high-performing teams.",
  profile_pic_url: null, // Mock profiles don't have photos
  experiences: [
    {
      title: "Senior Product Manager",
      company: "TechCorp",
      company_linkedin_profile_url: "https://linkedin.com/company/techcorp",
      description: "Leading product strategy for the core platform team. Shipped 3 major features that increased user engagement by 40%. Managing a team of 2 APMs.",
      starts_at: { day: 1, month: 3, year: 2022 },
      ends_at: null,
      location: "San Francisco, CA",
    },
    {
      title: "Product Manager",
      company: "Google",
      company_linkedin_profile_url: "https://linkedin.com/company/google",
      description: "Owned the search suggestions feature for Google Search. Ran 50+ A/B tests and improved CTR by 15%.",
      starts_at: { day: 1, month: 6, year: 2019 },
      ends_at: { day: 1, month: 2, year: 2022 },
      location: "Mountain View, CA",
    },
    {
      title: "Associate Product Manager",
      company: "Meta",
      company_linkedin_profile_url: "https://linkedin.com/company/meta",
      description: "Part of the APM program. Worked on Facebook Marketplace seller tools.",
      starts_at: { day: 1, month: 8, year: 2017 },
      ends_at: { day: 1, month: 5, year: 2019 },
      location: "Menlo Park, CA",
    },
  ],
  education: [
    {
      school: "Stanford University",
      degree_name: "Master of Business Administration",
      field_of_study: "Business Administration",
      starts_at: { day: 1, month: 9, year: 2015 },
      ends_at: { day: 1, month: 6, year: 2017 },
      description: null,
    },
    {
      school: "UC Berkeley",
      degree_name: "Bachelor of Science",
      field_of_study: "Computer Science",
      starts_at: { day: 1, month: 9, year: 2011 },
      ends_at: { day: 1, month: 5, year: 2015 },
      description: null,
    },
  ],
};

/**
 * Converts LinkedIn profile data to a readable text format for LLM processing
 */
function profileToText(profile: LinkedInProfileData): string {
  const lines: string[] = [];

  if (profile.full_name) {
    lines.push(`Name: ${profile.full_name}`);
  }

  if (profile.occupation) {
    lines.push(`Current Role: ${profile.occupation}`);
  }

  if (profile.headline) {
    lines.push(`Headline: ${profile.headline}`);
  }

  if (profile.summary) {
    lines.push(`\nSummary:\n${profile.summary}`);
  }

  if (profile.experiences && profile.experiences.length > 0) {
    lines.push("\n--- Experience ---");
    for (const exp of profile.experiences) {
      const dateRange = formatDateRange(exp.starts_at, exp.ends_at);
      lines.push(`\n${exp.title || "Unknown Role"} at ${exp.company || "Unknown Company"}`);
      if (dateRange) lines.push(`  ${dateRange}`);
      if (exp.location) lines.push(`  Location: ${exp.location}`);
      if (exp.description) lines.push(`  ${exp.description}`);
    }
  }

  if (profile.education && profile.education.length > 0) {
    lines.push("\n--- Education ---");
    for (const edu of profile.education) {
      const dateRange = formatDateRange(edu.starts_at, edu.ends_at);
      lines.push(`\n${edu.school || "Unknown School"}`);
      if (edu.degree_name || edu.field_of_study) {
        lines.push(`  ${[edu.degree_name, edu.field_of_study].filter(Boolean).join(" in ")}`);
      }
      if (dateRange) lines.push(`  ${dateRange}`);
      if (edu.description) lines.push(`  ${edu.description}`);
    }
  }

  return lines.join("\n");
}

/**
 * Formats a date range from date objects
 */
function formatDateRange(
  start: { day: number; month: number; year: number } | null,
  end: { day: number; month: number; year: number } | null
): string | null {
  if (!start) return null;

  const startStr = `${start.month}/${start.year}`;
  const endStr = end ? `${end.month}/${end.year}` : "Present";

  return `${startStr} - ${endStr}`;
}

/**
 * Parse date string or object from LinkdAPI response
 */
function parseDate(dateInput: unknown): { day: number; month: number; year: number } | null {
  if (!dateInput) return null;

  // If it's already in the right format
  if (typeof dateInput === "object" && dateInput !== null) {
    const dateObj = dateInput as Record<string, unknown>;
    if (dateObj.year) {
      return {
        day: (dateObj.day as number) || 1,
        month: (dateObj.month as number) || 1,
        year: dateObj.year as number,
      };
    }
  }

  // If it's a string like "2022-03" or "2022-03-01" or "March 2022"
  if (typeof dateInput === "string") {
    // Try ISO format first (2022-03-01 or 2022-03)
    const isoMatch = dateInput.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
    if (isoMatch) {
      return {
        year: parseInt(isoMatch[1], 10),
        month: parseInt(isoMatch[2], 10),
        day: isoMatch[3] ? parseInt(isoMatch[3], 10) : 1,
      };
    }

    // Try "Month Year" format (March 2022)
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthYearMatch = dateInput.toLowerCase().match(/([a-z]+)\s*(\d{4})/);
    if (monthYearMatch) {
      const monthIndex = monthNames.findIndex(m => monthYearMatch[1].startsWith(m));
      if (monthIndex !== -1) {
        return {
          year: parseInt(monthYearMatch[2], 10),
          month: monthIndex + 1,
          day: 1,
        };
      }
    }

    // Try just year
    const yearMatch = dateInput.match(/^(\d{4})$/);
    if (yearMatch) {
      return {
        year: parseInt(yearMatch[1], 10),
        month: 1,
        day: 1,
      };
    }
  }

  return null;
}

/**
 * Maps LinkdAPI response to our internal LinkedInProfileData structure
 * LinkdAPI uses camelCase field names and different structure than Proxycurl
 */
function mapLinkdAPIResponse(data: Record<string, unknown>): LinkedInProfileData {
  // Log the raw response keys to understand the API structure
  console.log("=== LINKDAPI RAW RESPONSE KEYS ===");
  console.log("Top-level keys:", Object.keys(data));

  // LinkdAPI uses different field names - check for all variations
  // Experience data may be in: experiences, experience, positions, CurrentPositions, PastPositions
  const currentPositions = (data.CurrentPositions || []) as Record<string, unknown>[];
  const pastPositions = (data.PastPositions || []) as Record<string, unknown>[];
  const experiences = (data.experiences || data.experience || data.positions || [...currentPositions, ...pastPositions]) as Record<string, unknown>[];

  // Education data
  const education = (data.education || data.educations || data.Education || []) as Record<string, unknown>[];

  // Log what we found
  console.log("=== LINKDAPI FIELD MAPPING ===");
  console.log("full_name sources:", {
    fullName: data.fullName,
    full_name: data.full_name,
    name: data.name,
    firstName: data.firstName,
    lastName: data.lastName
  });
  console.log("headline sources:", {
    headline: data.headline,
    tagline: data.tagline,
    title: data.title
  });
  console.log("summary/about sources:", {
    summary: typeof data.summary === 'string' ? data.summary?.slice(0, 100) + '...' : data.summary,
    about: typeof data.about === 'string' ? (data.about as string)?.slice(0, 100) + '...' : data.about,
    About: typeof data.About === 'string' ? (data.About as string)?.slice(0, 100) + '...' : data.About,
    bio: typeof data.bio === 'string' ? (data.bio as string)?.slice(0, 100) + '...' : data.bio,
    description: typeof data.description === 'string' ? (data.description as string)?.slice(0, 100) + '...' : data.description,
    aboutSection: data.aboutSection,
    profileSummary: data.profileSummary,
    personalBio: data.personalBio,
  });

  // Log ALL keys to find where About might be hiding
  console.log("=== ALL TOP-LEVEL KEYS ===");
  for (const key of Object.keys(data)) {
    const value = data[key];
    const valuePreview = typeof value === 'string'
      ? value.slice(0, 100) + (value.length > 100 ? '...' : '')
      : Array.isArray(value)
        ? `[Array of ${value.length}]`
        : typeof value === 'object' && value !== null
          ? `{Object with keys: ${Object.keys(value).join(', ')}}`
          : String(value);
    console.log(`  ${key}: ${valuePreview}`);
  }
  console.log("profile_pic sources:", {
    profilePictureUrl: data.profilePictureUrl,
    profilePicture: data.profilePicture,
    profile_pic_url: data.profile_pic_url,
    avatarUrl: data.avatarUrl,
    avatar: data.avatar,
    photoUrl: data.photoUrl
  });
  console.log("CurrentPositions count:", currentPositions.length);
  console.log("PastPositions count:", pastPositions.length);
  console.log("experiences count:", experiences.length);
  console.log("education count:", education.length);

  if (currentPositions.length > 0) {
    console.log("First CurrentPosition keys:", Object.keys(currentPositions[0]));
    console.log("First CurrentPosition sample:", JSON.stringify(currentPositions[0]).slice(0, 500));
  }

  if (experiences.length > 0 && experiences !== currentPositions) {
    console.log("First experience keys:", Object.keys(experiences[0]));
    console.log("First experience sample:", JSON.stringify(experiences[0]).slice(0, 500));
  }

  // Build full name from parts if not directly available
  let fullName = (data.fullName || data.full_name || data.name) as string | null;
  if (!fullName && (data.firstName || data.lastName)) {
    fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || null;
  }

  // Map experiences - handle LinkdAPI's CurrentPositions/PastPositions format
  const mappedExperiences: LinkedInExperience[] = [];

  // Process CurrentPositions (these are company associations, not full experience entries)
  for (const pos of currentPositions) {
    mappedExperiences.push({
      title: (pos.title || pos.position || pos.role || "Current Position") as string | null,
      company: (pos.name || pos.company || pos.companyName || pos.organization) as string | null,
      company_linkedin_profile_url: (pos.url || pos.linkedinUrl || pos.company_url) as string | null,
      description: (pos.description || pos.summary) as string | null,
      starts_at: parseDate(pos.startDate || pos.starts_at || pos.from),
      ends_at: null, // Current positions have no end date
      location: (pos.location || pos.geoLocation) as string | null,
    });
  }

  // Process PastPositions
  for (const pos of pastPositions) {
    mappedExperiences.push({
      title: (pos.title || pos.position || pos.role) as string | null,
      company: (pos.name || pos.company || pos.companyName || pos.organization) as string | null,
      company_linkedin_profile_url: (pos.url || pos.linkedinUrl || pos.company_url) as string | null,
      description: (pos.description || pos.summary) as string | null,
      starts_at: parseDate(pos.startDate || pos.starts_at || pos.from),
      ends_at: parseDate(pos.endDate || pos.ends_at || pos.to),
      location: (pos.location || pos.geoLocation) as string | null,
    });
  }

  // If we got experiences from another field, process those too
  if (experiences.length > 0 && experiences !== currentPositions && experiences !== pastPositions) {
    for (const exp of experiences) {
      mappedExperiences.push({
        title: (exp.title || exp.position || exp.role) as string | null,
        company: (exp.company || exp.company_name || exp.companyName || exp.organization || exp.name) as string | null,
        company_linkedin_profile_url: (exp.company_linkedin_profile_url || exp.company_url || exp.companyUrl || exp.url) as string | null,
        description: (exp.description || exp.summary) as string | null,
        starts_at: parseDate(exp.starts_at || exp.start_date || exp.startDate || exp.from),
        ends_at: parseDate(exp.ends_at || exp.end_date || exp.endDate || exp.to),
        location: (exp.location || exp.company_location || exp.geoLocation) as string | null,
      });
    }
  }

  // Extract About/Summary - check many possible field names
  const aboutSection = (
    data.summary ||
    data.about ||
    data.About ||
    data.bio ||
    data.description ||
    data.aboutSection ||
    data.profileSummary ||
    data.personalBio ||
    data.aboutMe ||
    data.overview ||
    data.intro
  ) as string | null;

  const mapped = {
    full_name: fullName,
    occupation: (data.occupation || data.headline || data.title || data.currentPosition) as string | null,
    headline: (data.headline || data.tagline || data.title) as string | null,
    summary: aboutSection,
    profile_pic_url: (data.profilePictureUrl || data.profilePicture || data.profile_pic_url || data.avatarUrl || data.avatar || data.photoUrl || data.photo_url || data.image_url) as string | null,
    experiences: mappedExperiences,
    education: education.map((edu: Record<string, unknown>) => ({
      school: (edu.school || edu.school_name || edu.schoolName || edu.institution || edu.name) as string | null,
      degree_name: (edu.degree_name || edu.degree || edu.degreeName) as string | null,
      field_of_study: (edu.field_of_study || edu.field || edu.fieldOfStudy || edu.major) as string | null,
      starts_at: parseDate(edu.starts_at || edu.start_date || edu.startDate || edu.from),
      ends_at: parseDate(edu.ends_at || edu.end_date || edu.endDate || edu.to),
      description: (edu.description || edu.activities) as string | null,
    })),
  };

  // Log what we actually mapped
  console.log("=== MAPPED PROFILE SUMMARY ===");
  console.log("Mapped full_name:", mapped.full_name);
  console.log("Mapped occupation:", mapped.occupation);
  console.log("Mapped headline:", mapped.headline);
  console.log("Mapped summary length:", mapped.summary?.length || 0);
  console.log("Mapped profile_pic_url:", mapped.profile_pic_url ? "present" : "null");
  console.log("Mapped experiences count:", mapped.experiences.length);
  console.log("Mapped experiences with titles:", mapped.experiences.filter(e => e.title).length);
  console.log("Mapped experiences with companies:", mapped.experiences.filter(e => e.company).length);
  console.log("Mapped experiences with descriptions:", mapped.experiences.filter(e => e.description).length);
  console.log("Mapped education entries:", mapped.education.length);

  return mapped;
}

/**
 * Fetches LinkedIn profile data using the LinkdAPI
 *
 * @param linkedinUrl - The LinkedIn profile URL to fetch
 * @returns Promise with the profile data or error information
 */
export async function fetchLinkedInData(linkedinUrl: string): Promise<FetchLinkedInResult> {
  const apiKey = process.env.LINKDAPI_API_KEY;

  // Mock mode: return static profile if API key is missing
  if (!apiKey) {
    console.log("LINKDAPI_API_KEY not set, using mock profile data");
    return {
      success: true,
      data: MOCK_PROFILE,
      profileText: profileToText(MOCK_PROFILE),
      profilePicUrl: MOCK_PROFILE.profile_pic_url,
      isMock: true,
    };
  }

  try {
    // Extract username from LinkedIn URL (e.g., "linkedin.com/in/username" -> "username")
    const usernameMatch = linkedinUrl.match(/linkedin\.com\/in\/([^/?]+)/);
    const username = usernameMatch ? usernameMatch[1] : linkedinUrl;

    console.log("=== LINKEDIN FETCH START ===");
    console.log("Input URL:", linkedinUrl);
    console.log("Extracted username:", username);
    console.log("API endpoint:", LINKDAPI_URL);

    const response = await axios.get(LINKDAPI_URL, {
      headers: {
        "X-linkdapi-apikey": apiKey,
        "Content-Type": "application/json",
      },
      params: {
        username: username,
      },
    });

    console.log("=== LINKDAPI RESPONSE STATUS ===");
    console.log("Status:", response.status);
    console.log("Response data type:", typeof response.data);
    console.log("Response data preview:", JSON.stringify(response.data).slice(0, 1000));

    // LinkdAPI wraps the actual profile data inside a "data" property
    const profileData = response.data.data || response.data;
    console.log("=== EXTRACTING NESTED DATA ===");
    console.log("Has nested data object:", !!response.data.data);
    console.log("Using data from:", response.data.data ? "response.data.data" : "response.data");

    // Log ALL keys in the raw response AND nested data to find the About section
    console.log("=== RAW RESPONSE.DATA KEYS ===");
    if (response.data && typeof response.data === 'object') {
      for (const key of Object.keys(response.data)) {
        const value = response.data[key];
        if (typeof value === 'string' && value.length > 20) {
          console.log(`  response.data.${key}: "${value.slice(0, 150)}${value.length > 150 ? '...' : ''}"`);
        }
      }
    }

    // Check for About specifically in various places
    console.log("=== SEARCHING FOR ABOUT SECTION ===");
    const possibleAboutLocations = [
      { path: 'response.data.about', value: response.data?.about },
      { path: 'response.data.About', value: response.data?.About },
      { path: 'response.data.summary', value: response.data?.summary },
      { path: 'response.data.data.about', value: response.data?.data?.about },
      { path: 'response.data.data.About', value: response.data?.data?.About },
      { path: 'response.data.data.summary', value: response.data?.data?.summary },
      { path: 'profileData.about', value: profileData?.about },
      { path: 'profileData.About', value: profileData?.About },
      { path: 'profileData.summary', value: profileData?.summary },
    ];
    for (const loc of possibleAboutLocations) {
      if (loc.value) {
        console.log(`  FOUND at ${loc.path}: "${String(loc.value).slice(0, 100)}..."`);
      }
    }

    // Map the LinkdAPI response to our internal structure
    const mappedProfile = mapLinkdAPIResponse(profileData);
    const profileText = profileToText(mappedProfile);

    // Log the final profile text quality
    console.log("=== PROFILE TEXT QUALITY CHECK ===");
    console.log("Profile text length:", profileText.length);
    console.log("Has name:", !!mappedProfile.full_name);
    console.log("Has occupation:", !!mappedProfile.occupation);
    console.log("Has headline:", !!mappedProfile.headline);
    console.log("Has summary:", !!mappedProfile.summary);
    console.log("Experience count:", mappedProfile.experiences.length);
    console.log("Experiences with descriptions:", mappedProfile.experiences.filter(e => e.description).length);
    console.log("Education count:", mappedProfile.education.length);
    console.log("Profile pic URL:", mappedProfile.profile_pic_url || "none");

    // Check if we have enough data
    const hasMinimalData = profileText.length >= 100;
    const hasExperience = mappedProfile.experiences.length > 0;
    const hasBasicInfo = mappedProfile.full_name || mappedProfile.occupation || mappedProfile.headline;

    console.log("=== DATA SUFFICIENCY CHECK ===");
    console.log("Has minimal data (100+ chars):", hasMinimalData, `(${profileText.length} chars)`);
    console.log("Has experience:", hasExperience);
    console.log("Has basic info:", hasBasicInfo);

    if (!hasMinimalData) {
      console.log("=== INSUFFICIENT DATA WARNING ===");
      console.log("Profile text is too short. Full text:");
      console.log(profileText);
    }

    console.log("=== LINKEDIN FETCH END ===");

    return {
      success: true,
      data: mappedProfile,
      profileText: profileText,
      profilePicUrl: mappedProfile.profile_pic_url,
    };
  } catch (error) {
    const axiosError = error as AxiosError;

    console.log("=== LINKEDIN FETCH ERROR ===");
    console.log("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.log("Error message:", error instanceof Error ? error.message : String(error));

    // Handle specific error codes
    if (axiosError.response) {
      const status = axiosError.response.status;
      console.log("HTTP Status:", status);
      console.log("Response headers:", JSON.stringify(axiosError.response.headers));
      console.log("Response data:", JSON.stringify(axiosError.response.data).slice(0, 500));

      if (status === 404) {
        console.log("Error code: NOT_FOUND - Profile does not exist or is private");
        return {
          success: false,
          error: "LinkedIn profile not found. Please check the URL and try again.",
          errorCode: "NOT_FOUND",
        };
      }

      if (status === 429) {
        console.log("Error code: RATE_LIMITED - Too many requests");
        return {
          success: false,
          error: "Rate limit exceeded. Please try again in a few minutes.",
          errorCode: "RATE_LIMITED",
        };
      }

      if (status === 401 || status === 403) {
        console.log("Error code: UNAUTHORIZED - API key issue");
        return {
          success: false,
          error: "API authentication failed. Please check your API key.",
          errorCode: "UNAUTHORIZED",
        };
      }

      console.log("Error code: UNKNOWN - Unhandled HTTP status:", status);
    } else if (axiosError.request) {
      console.log("No response received - network error or timeout");
      console.log("Request details:", axiosError.request?._header || "no headers");
    } else {
      console.log("Error setting up request:", axiosError.message);
    }

    // Generic error
    console.error("=== LINKDAPI FULL ERROR ===");
    console.error(error);
    return {
      success: false,
      error: "Failed to fetch LinkedIn profile. Please try again or paste your profile manually.",
      errorCode: "UNKNOWN",
    };
  }
}
