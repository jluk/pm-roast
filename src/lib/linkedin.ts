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
 */
function mapLinkdAPIResponse(data: Record<string, unknown>): LinkedInProfileData {
  // LinkdAPI may use different field names - handle common variations
  const experiences = (data.experiences || data.experience || data.positions || []) as Record<string, unknown>[];
  const education = (data.education || data.educations || []) as Record<string, unknown>[];

  return {
    full_name: (data.full_name || data.fullName || data.name || null) as string | null,
    occupation: (data.occupation || data.current_position || data.title || null) as string | null,
    headline: (data.headline || data.tagline || null) as string | null,
    summary: (data.summary || data.about || data.bio || null) as string | null,
    profile_pic_url: (data.profile_pic_url || data.profile_picture_url || data.profilePicture || data.avatar || data.photo_url || data.image_url || null) as string | null,
    experiences: experiences.map((exp: Record<string, unknown>) => ({
      title: (exp.title || exp.position || exp.role || null) as string | null,
      company: (exp.company || exp.company_name || exp.companyName || exp.organization || null) as string | null,
      company_linkedin_profile_url: (exp.company_linkedin_profile_url || exp.company_url || exp.companyUrl || null) as string | null,
      description: (exp.description || exp.summary || null) as string | null,
      starts_at: parseDate(exp.starts_at || exp.start_date || exp.startDate || exp.from),
      ends_at: parseDate(exp.ends_at || exp.end_date || exp.endDate || exp.to),
      location: (exp.location || exp.company_location || null) as string | null,
    })),
    education: education.map((edu: Record<string, unknown>) => ({
      school: (edu.school || edu.school_name || edu.schoolName || edu.institution || null) as string | null,
      degree_name: (edu.degree_name || edu.degree || edu.degreeName || null) as string | null,
      field_of_study: (edu.field_of_study || edu.field || edu.fieldOfStudy || edu.major || null) as string | null,
      starts_at: parseDate(edu.starts_at || edu.start_date || edu.startDate || edu.from),
      ends_at: parseDate(edu.ends_at || edu.end_date || edu.endDate || edu.to),
      description: (edu.description || edu.activities || null) as string | null,
    })),
  };
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

    console.log("Fetching LinkedIn profile for username:", username);

    const response = await axios.get(LINKDAPI_URL, {
      headers: {
        "X-linkdapi-apikey": apiKey,
        "Content-Type": "application/json",
      },
      params: {
        username: username,
      },
    });

    // Map the LinkdAPI response to our internal structure
    const mappedProfile = mapLinkdAPIResponse(response.data);

    return {
      success: true,
      data: mappedProfile,
      profileText: profileToText(mappedProfile),
      profilePicUrl: mappedProfile.profile_pic_url,
    };
  } catch (error) {
    const axiosError = error as AxiosError;

    // Handle specific error codes
    if (axiosError.response) {
      const status = axiosError.response.status;

      if (status === 404) {
        return {
          success: false,
          error: "LinkedIn profile not found. Please check the URL and try again.",
          errorCode: "NOT_FOUND",
        };
      }

      if (status === 429) {
        return {
          success: false,
          error: "Rate limit exceeded. Please try again in a few minutes.",
          errorCode: "RATE_LIMITED",
        };
      }

      if (status === 401 || status === 403) {
        return {
          success: false,
          error: "API authentication failed. Please check your API key.",
          errorCode: "UNAUTHORIZED",
        };
      }
    }

    // Generic error
    console.error("LinkdAPI error:", error);
    return {
      success: false,
      error: "Failed to fetch LinkedIn profile. Please try again or paste your profile manually.",
      errorCode: "UNKNOWN",
    };
  }
}
