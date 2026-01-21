/**
 * X (Twitter) API Integration Tests
 *
 * Tests the /api/x endpoint for fetching Twitter profile data.
 * Requires TWITTER_BEARER_TOKEN environment variable to be set.
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const API_BASE_URL = "http://localhost:3000";

// Check if we have the bearer token configured
const hasTwitterToken = !!process.env.TWITTER_BEARER_TOKEN;

describe("X (Twitter) API Route", () => {
  beforeAll(() => {
    if (!hasTwitterToken) {
      console.warn(
        "TWITTER_BEARER_TOKEN not configured - some tests will use mock data"
      );
    }
  });

  describe("POST /api/x", () => {
    it("should fetch profile data for @whosjluk", async () => {
      const response = await fetch(`${API_BASE_URL}/api/x`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle: "whosjluk" }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();

      // Verify successful response structure
      expect(data.success).toBe(true);
      expect(data.profile).toBeDefined();
      expect(data.profileText).toBeDefined();
      expect(data.quality).toBeDefined();

      // Verify profile fields
      const { profile } = data;
      expect(profile.handle).toBe("whosjluk");
      expect(profile.name).toBeDefined();
      expect(typeof profile.followers).toBe("number");
      expect(typeof profile.following).toBe("number");
      expect(typeof profile.tweetCount).toBe("number");

      // Verify quality score structure
      expect(data.quality.score).toBeGreaterThanOrEqual(0);
      expect(data.quality.score).toBeLessThanOrEqual(100);
      expect(["high", "medium", "low"]).toContain(data.quality.level);
      expect(data.quality.breakdown).toBeDefined();

      // Log profile info for debugging
      console.log("\n--- @whosjluk Profile Data ---");
      console.log(`Name: ${profile.name}`);
      console.log(`Bio: ${profile.bio || "(no bio)"}`);
      console.log(`Followers: ${profile.followers}`);
      console.log(`Following: ${profile.following}`);
      console.log(`Tweets: ${profile.tweetCount}`);
      console.log(`Quality Score: ${data.quality.score}/100 (${data.quality.level})`);
      console.log(`Is Mock Data: ${data.isMock || false}`);
    });

    it("should handle @ prefix in handle", async () => {
      const response = await fetch(`${API_BASE_URL}/api/x`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle: "@whosjluk" }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.profile.handle).toBe("whosjluk");
    });

    it("should return 400 for missing handle", async () => {
      const response = await fetch(`${API_BASE_URL}/api/x`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should return 400 for invalid handle format", async () => {
      const response = await fetch(`${API_BASE_URL}/api/x`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle: "invalid handle with spaces!" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid X handle format");
    });

    it("should return 400 for handle that is too long", async () => {
      const response = await fetch(`${API_BASE_URL}/api/x`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle: "thishandleiswaytoolongfortwitter" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid X handle format");
    });

    it("should include recent tweets when available", async () => {
      const response = await fetch(`${API_BASE_URL}/api/x`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle: "whosjluk" }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();

      // recentTweets should be an array (may be empty if mock data)
      expect(Array.isArray(data.recentTweets)).toBe(true);

      if (data.recentTweets.length > 0 && !data.isMock) {
        const tweet = data.recentTweets[0];
        expect(tweet.text).toBeDefined();
        expect(typeof tweet.likes).toBe("number");
        expect(typeof tweet.retweets).toBe("number");

        console.log("\n--- Recent Tweets ---");
        data.recentTweets.slice(0, 3).forEach((t: { text: string; likes: number; retweets: number }, i: number) => {
          console.log(`${i + 1}. "${t.text.substring(0, 80)}..." (${t.likes} likes)`);
        });
      }
    });

    it("should return profile image URL in high resolution", async () => {
      const response = await fetch(`${API_BASE_URL}/api/x`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle: "whosjluk" }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();

      // If we have a real profile image (not mock), it should be high-res
      if (data.profile.profileImageUrl && !data.isMock) {
        expect(data.profile.profileImageUrl).toContain("_400x400");
        expect(data.profile.profileImageUrl).not.toContain("_normal");
      }
    });
  });

  describe("Quality Score Calculation", () => {
    it("should calculate quality breakdown correctly", async () => {
      const response = await fetch(`${API_BASE_URL}/api/x`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handle: "whosjluk" }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();

      const { breakdown } = data.quality;

      // Check all breakdown categories exist
      expect(typeof breakdown.bio).toBe("number");
      expect(typeof breakdown.followers).toBe("number");
      expect(typeof breakdown.activity).toBe("number");
      expect(typeof breakdown.recentTweets).toBe("number");
      expect(typeof breakdown.completeness).toBe("number");

      // All scores should be non-negative
      Object.values(breakdown).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
      });

      console.log("\n--- Quality Breakdown ---");
      console.log(`Bio: ${breakdown.bio}/20`);
      console.log(`Followers: ${breakdown.followers}/25`);
      console.log(`Activity: ${breakdown.activity}/25`);
      console.log(`Recent Tweets: ${breakdown.recentTweets}/20`);
      console.log(`Completeness: ${breakdown.completeness}/10`);
    });
  });
});
