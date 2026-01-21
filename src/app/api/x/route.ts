/**
 * X (Twitter) Profile API Route
 * Fetches public profile data from X/Twitter for roasting
 *
 * Uses Twitter API v2 with Bearer Token authentication
 */

import { NextRequest, NextResponse } from "next/server";

// Twitter API v2 base URL
const TWITTER_API_BASE = "https://api.twitter.com/2";

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  description?: string;
  profile_image_url?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  verified?: boolean;
  verified_type?: string;
  created_at?: string;
  location?: string;
  url?: string;
  pinned_tweet_id?: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { handle } = await request.json();

    if (!handle) {
      return NextResponse.json(
        { error: "X handle is required" },
        { status: 400 }
      );
    }

    // Clean the handle (remove @ if present)
    const cleanHandle = handle.replace(/^@/, "").trim();

    if (!cleanHandle || !/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
      return NextResponse.json(
        { error: "Invalid X handle format" },
        { status: 400 }
      );
    }

    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!bearerToken) {
      console.warn("TWITTER_BEARER_TOKEN not configured, returning mock data");
      return NextResponse.json(getMockXProfile(cleanHandle));
    }

    try {
      // Fetch user profile data
      const userResponse = await fetch(
        `${TWITTER_API_BASE}/users/by/username/${cleanHandle}?user.fields=description,profile_image_url,public_metrics,verified,verified_type,created_at,location,url,pinned_tweet_id`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          return NextResponse.json(
            { error: "X profile not found" },
            { status: 404 }
          );
        }
        if (userResponse.status === 429) {
          return NextResponse.json(
            { error: "Rate limited by X API. Please try again later." },
            { status: 429 }
          );
        }
        if (userResponse.status === 401) {
          console.error("Twitter API: Invalid or expired bearer token");
          return NextResponse.json(getMockXProfile(cleanHandle));
        }
        if (userResponse.status === 402 || userResponse.status === 403) {
          console.warn("Twitter API: Access tier does not include user lookup. Returning mock data.");
          return NextResponse.json(getMockXProfile(cleanHandle));
        }
        throw new Error(`Twitter API error: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      const user: TwitterUser = userData.data;

      if (!user) {
        return NextResponse.json(
          { error: "X profile not found" },
          { status: 404 }
        );
      }

      // Fetch recent tweets for more context
      let recentTweets: TwitterTweet[] = [];
      try {
        const tweetsResponse = await fetch(
          `${TWITTER_API_BASE}/users/${user.id}/tweets?max_results=10&tweet.fields=created_at,public_metrics`,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );

        if (tweetsResponse.ok) {
          const tweetsData = await tweetsResponse.json();
          recentTweets = tweetsData.data || [];
        }
      } catch (tweetError) {
        console.warn("Could not fetch tweets:", tweetError);
      }

      // Build profile text for roasting
      const profileText = buildProfileText(user, recentTweets);

      // Calculate quality score
      const quality = calculateQuality(user, recentTweets);

      // Get high-res profile image URL
      const profileImageUrl = user.profile_image_url
        ? user.profile_image_url.replace("_normal", "_400x400")
        : null;

      return NextResponse.json({
        success: true,
        profile: {
          name: user.name,
          handle: user.username,
          bio: user.description || "",
          profileImageUrl,
          followers: user.public_metrics?.followers_count || 0,
          following: user.public_metrics?.following_count || 0,
          tweetCount: user.public_metrics?.tweet_count || 0,
          verified: user.verified || false,
          verifiedType: user.verified_type,
          location: user.location,
          website: user.url,
          createdAt: user.created_at,
        },
        profileText,
        quality,
        recentTweets: recentTweets.slice(0, 5).map((t) => ({
          text: t.text,
          likes: t.public_metrics?.like_count || 0,
          retweets: t.public_metrics?.retweet_count || 0,
        })),
      });
    } catch (apiError) {
      console.error("Twitter API error:", apiError);
      // Return mock data on API failure
      return NextResponse.json(getMockXProfile(cleanHandle));
    }
  } catch (error) {
    console.error("X profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch X profile" },
      { status: 500 }
    );
  }
}

function buildProfileText(user: TwitterUser, tweets: TwitterTweet[]): string {
  const lines: string[] = [];

  lines.push(`X Profile: @${user.username}`);
  lines.push(`Name: ${user.name}`);

  if (user.description) {
    lines.push(`\nBio: ${user.description}`);
  }

  if (user.location) {
    lines.push(`Location: ${user.location}`);
  }

  if (user.url) {
    lines.push(`Website: ${user.url}`);
  }

  if (user.public_metrics) {
    lines.push(`\nStats:`);
    lines.push(`- Followers: ${user.public_metrics.followers_count.toLocaleString()}`);
    lines.push(`- Following: ${user.public_metrics.following_count.toLocaleString()}`);
    lines.push(`- Tweets: ${user.public_metrics.tweet_count.toLocaleString()}`);
  }

  if (user.verified) {
    lines.push(`\nVerified: Yes ${user.verified_type === "business" ? "(Business)" : user.verified_type === "government" ? "(Government)" : ""}`);
  }

  if (user.created_at) {
    const joinDate = new Date(user.created_at);
    lines.push(`Joined X: ${joinDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`);
  }

  if (tweets.length > 0) {
    lines.push(`\nRecent Tweets:`);
    tweets.slice(0, 5).forEach((tweet, i) => {
      const engagement = (tweet.public_metrics?.like_count || 0) + (tweet.public_metrics?.retweet_count || 0);
      lines.push(`${i + 1}. "${tweet.text.substring(0, 200)}${tweet.text.length > 200 ? "..." : ""}" (${engagement.toLocaleString()} engagements)`);
    });
  }

  return lines.join("\n");
}

function calculateQuality(user: TwitterUser, tweets: TwitterTweet[]): {
  score: number;
  level: "high" | "medium" | "low";
  breakdown: Record<string, number>;
} {
  let score = 0;
  const breakdown: Record<string, number> = {};

  // Bio presence (20 points)
  if (user.description && user.description.length > 20) {
    breakdown.bio = 20;
    score += 20;
  } else if (user.description) {
    breakdown.bio = 10;
    score += 10;
  } else {
    breakdown.bio = 0;
  }

  // Follower count (25 points)
  const followers = user.public_metrics?.followers_count || 0;
  if (followers > 10000) {
    breakdown.followers = 25;
    score += 25;
  } else if (followers > 1000) {
    breakdown.followers = 20;
    score += 20;
  } else if (followers > 100) {
    breakdown.followers = 15;
    score += 15;
  } else {
    breakdown.followers = 5;
    score += 5;
  }

  // Tweet activity (25 points)
  const tweetCount = user.public_metrics?.tweet_count || 0;
  if (tweetCount > 1000) {
    breakdown.activity = 25;
    score += 25;
  } else if (tweetCount > 100) {
    breakdown.activity = 20;
    score += 20;
  } else if (tweetCount > 10) {
    breakdown.activity = 10;
    score += 10;
  } else {
    breakdown.activity = 5;
    score += 5;
  }

  // Recent tweets available (20 points)
  if (tweets.length >= 5) {
    breakdown.recentTweets = 20;
    score += 20;
  } else if (tweets.length > 0) {
    breakdown.recentTweets = tweets.length * 4;
    score += tweets.length * 4;
  } else {
    breakdown.recentTweets = 0;
  }

  // Profile completeness (10 points)
  let completeness = 0;
  if (user.location) completeness += 2;
  if (user.url) completeness += 3;
  if (user.profile_image_url && !user.profile_image_url.includes("default_profile")) completeness += 5;
  breakdown.completeness = completeness;
  score += completeness;

  return {
    score: Math.min(100, score),
    level: score >= 70 ? "high" : score >= 40 ? "medium" : "low",
    breakdown,
  };
}

function getMockXProfile(handle: string) {
  return {
    success: true,
    profile: {
      name: handle.charAt(0).toUpperCase() + handle.slice(1),
      handle: handle,
      bio: "Product enthusiast. Building things. Shipping fast. (Mock profile - X API not configured)",
      profileImageUrl: null,
      followers: 1234,
      following: 567,
      tweetCount: 890,
      verified: false,
      verifiedType: null,
      location: "San Francisco, CA",
      website: null,
      createdAt: "2020-01-01T00:00:00.000Z",
    },
    profileText: `X Profile: @${handle}
Name: ${handle.charAt(0).toUpperCase() + handle.slice(1)}

Bio: Product enthusiast. Building things. Shipping fast. (Mock profile - X API not configured)

Location: San Francisco, CA

Stats:
- Followers: 1,234
- Following: 567
- Tweets: 890

Note: This is mock data. Configure TWITTER_BEARER_TOKEN for real X profile fetching.`,
    quality: {
      score: 50,
      level: "medium" as const,
      breakdown: {
        bio: 15,
        followers: 15,
        activity: 10,
        recentTweets: 5,
        completeness: 5,
      },
    },
    recentTweets: [],
    isMock: true,
  };
}
