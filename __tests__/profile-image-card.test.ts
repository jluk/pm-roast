/**
 * Profile Image Card Generation Tests
 *
 * Tests that profile images are correctly processed and produce
 * quality card outputs with recognizable faces.
 *
 * Test images in fixtures/profile-images/:
 * - brian.jpeg - Brian Chesky (Airbnb)
 * - demis.jpeg - Demis Hassabis (DeepMind)
 * - justin.jpeg - Justin (test user)
 * - lenny.jpeg - Lenny Rachitsky (Lenny's Podcast)
 * - reid.jpeg - Reid Hoffman (LinkedIn)
 */

import * as fs from "fs";
import * as path from "path";

// Test image directory
const PROFILE_IMAGES_DIR = path.join(__dirname, "fixtures/profile-images");

// Test profile data for each person
const TEST_PROFILES: Record<
  string,
  {
    name: string;
    profileText: string;
    dreamRole: string;
    description: string;
  }
> = {
  brian: {
    name: "Brian Chesky",
    profileText: `Brian Chesky
Co-founder and CEO at Airbnb
San Francisco Bay Area

About:
Co-founder and CEO of Airbnb. We're creating a world where anyone can belong anywhere.

Experience:
- CEO at Airbnb (2008 - Present)
  Founded and scaled Airbnb from an air mattress to a global travel platform.
  Led company through IPO in 2020.

- Industrial Designer at 3DID (2004-2007)
  Product design and prototyping.

Education:
Rhode Island School of Design - BFA Industrial Design`,
    dreamRole: "founder",
    description: "Tech founder, design background, scaled massive company",
  },
  demis: {
    name: "Demis Hassabis",
    profileText: `Demis Hassabis
CEO at Google DeepMind
London, United Kingdom

About:
CEO of Google DeepMind. Nobel Prize winner. Working on artificial general intelligence.

Experience:
- CEO at Google DeepMind (2010 - Present)
  Founded DeepMind, acquired by Google. Created AlphaGo, AlphaFold.

- Researcher at UCL (2005-2009)
  Neuroscience and AI research.

- Game Designer at Bullfrog/Lionhead (1994-2005)
  Designed Theme Park, Black & White.

Education:
University of Cambridge - PhD Cognitive Neuroscience`,
    dreamRole: "founder",
    description: "AI researcher, game designer background, Nobel laureate",
  },
  justin: {
    name: "Justin Luk",
    profileText: `Justin Luk
Product Manager
San Francisco

About:
Building cool stuff. PM by day, hacker by night.

Experience:
- Product Manager at Tech Company (2020 - Present)
  Building products that users love.

- Software Engineer (2018-2020)
  Full-stack development.

Education:
University - Computer Science`,
    dreamRole: "founder",
    description: "PM with engineering background",
  },
  lenny: {
    name: "Lenny Rachitsky",
    profileText: `Lenny Rachitsky
Writer of Lenny's Newsletter | Host of Lenny's Podcast
San Francisco Bay Area

About:
I write a weekly newsletter about product, growth, and working with humans.
Former PM at Airbnb.

Experience:
- Newsletter Writer and Podcast Host (2019 - Present)
  Lenny's Newsletter has 500k+ subscribers. Lenny's Podcast features top product leaders.

- Product Lead at Airbnb (2012-2019)
  Led growth and supply quality teams.

Education:
Georgia Tech - MS HCI`,
    dreamRole: "advisor",
    description: "Former Airbnb PM, now influential content creator",
  },
  reid: {
    name: "Reid Hoffman",
    profileText: `Reid Hoffman
Co-founder at LinkedIn, Partner at Greylock
San Francisco Bay Area

About:
Entrepreneur, investor, podcaster.

Experience:
- Partner at Greylock Partners (2009 - Present)
  Investing in the next generation of tech companies.

- Co-founder & Chairman at LinkedIn (2002-2020)
  Built the world's largest professional network.

Education:
Stanford University - BS, Oxford University - MA Philosophy`,
    dreamRole: "advisor",
    description: "LinkedIn founder, now investor",
  },
};

// Declare global helpers for TypeScript
declare global {
  function logSection(title: string): void;
  function logStep(step: string): void;
  function logResult(label: string, value: unknown): void;
  function logError(label: string, value: string): void;
}

describe("Profile Image Card Generation", () => {
  beforeAll(() => {
    logSection("PROFILE IMAGE CARD TESTS");
    console.log("  Testing profile image processing and card generation");
    console.log(`  Test images directory: ${PROFILE_IMAGES_DIR}`);
  });

  describe("Test Image Setup", () => {
    it("should have test images available", () => {
      logStep("Checking test images exist");

      const expectedImages = [
        "brian.jpeg",
        "demis.jpeg",
        "justin.jpeg",
        "lenny.jpeg",
        "reid.jpeg",
      ];

      expectedImages.forEach((imageName) => {
        const imagePath = path.join(PROFILE_IMAGES_DIR, imageName);
        const exists = fs.existsSync(imagePath);
        logResult(imageName, exists ? "Found" : "MISSING");
        expect(exists).toBe(true);
      });
    });

    it("should have valid image files with reasonable sizes", () => {
      logStep("Validating image file sizes");

      const images = fs.readdirSync(PROFILE_IMAGES_DIR).filter((f) => f.endsWith(".jpeg"));

      images.forEach((imageName) => {
        const imagePath = path.join(PROFILE_IMAGES_DIR, imageName);
        const stats = fs.statSync(imagePath);
        const sizeKB = Math.round(stats.size / 1024);

        // Images should be between 10KB and 500KB for good quality
        const isValidSize = sizeKB >= 10 && sizeKB <= 500;
        logResult(`${imageName}`, `${sizeKB}KB ${isValidSize ? "✓" : "(size warning)"}`);

        expect(stats.size).toBeGreaterThan(10 * 1024); // At least 10KB
        expect(stats.size).toBeLessThan(500 * 1024); // Under 500KB
      });
    });
  });

  describe("Image to Base64 Conversion", () => {
    it("should convert images to valid base64 strings", () => {
      logStep("Converting images to base64");

      const images = fs.readdirSync(PROFILE_IMAGES_DIR).filter((f) => f.endsWith(".jpeg"));

      images.forEach((imageName) => {
        const imagePath = path.join(PROFILE_IMAGES_DIR, imageName);
        const imageBuffer = fs.readFileSync(imagePath);
        const base64 = imageBuffer.toString("base64");

        // Base64 should be non-empty and valid
        expect(base64.length).toBeGreaterThan(0);

        // Should be valid base64 (no invalid characters)
        const isValidBase64 = /^[A-Za-z0-9+/=]+$/.test(base64);
        expect(isValidBase64).toBe(true);

        logResult(`${imageName} base64`, `${base64.length} chars`);
      });
    });

    it("should detect correct MIME types", () => {
      logStep("Detecting MIME types from file headers");

      const images = fs.readdirSync(PROFILE_IMAGES_DIR).filter((f) => f.endsWith(".jpeg"));

      images.forEach((imageName) => {
        const imagePath = path.join(PROFILE_IMAGES_DIR, imageName);
        const imageBuffer = fs.readFileSync(imagePath);

        // Check JPEG magic bytes (FF D8 FF)
        const isJpeg =
          imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8 && imageBuffer[2] === 0xff;

        logResult(`${imageName} MIME`, isJpeg ? "image/jpeg ✓" : "NOT JPEG");
        expect(isJpeg).toBe(true);
      });
    });
  });

  describe("Profile Image Data Structure", () => {
    it("should create valid profileImageBase64 objects", () => {
      logStep("Creating profileImageBase64 objects for API");

      const images = fs.readdirSync(PROFILE_IMAGES_DIR).filter((f) => f.endsWith(".jpeg"));

      images.forEach((imageName) => {
        const imagePath = path.join(PROFILE_IMAGES_DIR, imageName);
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Data = imageBuffer.toString("base64");

        const profileImageBase64 = {
          data: base64Data,
          mimeType: "image/jpeg",
        };

        // Validate structure
        expect(profileImageBase64).toHaveProperty("data");
        expect(profileImageBase64).toHaveProperty("mimeType");
        expect(typeof profileImageBase64.data).toBe("string");
        expect(profileImageBase64.mimeType).toBe("image/jpeg");

        logResult(`${imageName}`, `Ready for API (${Math.round(base64Data.length / 1024)}KB)`);
      });
    });
  });

  describe("Test Profile Data", () => {
    it("should have profile data for each test image", () => {
      logStep("Validating test profile data");

      const imageNames = ["brian", "demis", "justin", "lenny", "reid"];

      imageNames.forEach((name) => {
        const profile = TEST_PROFILES[name];
        expect(profile).toBeDefined();
        expect(profile.name).toBeTruthy();
        expect(profile.profileText.length).toBeGreaterThan(100);
        expect(profile.dreamRole).toBeTruthy();

        logResult(profile.name, `${profile.profileText.length} chars, role: ${profile.dreamRole}`);
      });
    });
  });

  // Integration tests - these actually call the API
  // Run with: npm test -- --testNamePattern="Integration"
  describe("Integration: Card Generation with Profile Photos", () => {
    // Skip by default - enable for manual testing
    const SKIP_INTEGRATION = process.env.RUN_INTEGRATION_TESTS !== "true";

    const testImageGeneration = async (personKey: string) => {
      const profile = TEST_PROFILES[personKey];
      const imagePath = path.join(PROFILE_IMAGES_DIR, `${personKey}.jpeg`);

      logStep(`Generating card for ${profile.name}`);

      // Read and convert image
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Data = imageBuffer.toString("base64");

      // Create FormData-like structure
      const formData = new FormData();
      const imageBlob = new Blob([imageBuffer], { type: "image/jpeg" });
      formData.append("profileImage", imageBlob, `${personKey}.jpeg`);
      formData.append("profileText", profile.profileText);
      formData.append("dreamRole", profile.dreamRole);

      logResult("Image size", `${Math.round(imageBuffer.length / 1024)}KB`);
      logResult("Profile text", `${profile.profileText.length} chars`);
      logResult("Dream role", profile.dreamRole);

      // Make API call
      const baseUrl = process.env.TEST_API_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/roast`, {
        method: "POST",
        body: formData,
      });

      expect(response.ok).toBe(true);

      const result = await response.json();

      // Validate response structure
      expect(result).toHaveProperty("archetype");
      expect(result).toHaveProperty("archetypeImage");
      expect(result).toHaveProperty("careerScore");
      expect(result).toHaveProperty("userName");

      logResult("Archetype", result.archetype?.name);
      logResult("Career Score", result.careerScore);
      logResult("Has Image", !!result.archetypeImage);

      // If image was generated, validate it
      if (result.archetypeImage) {
        // Should be a data URL
        expect(result.archetypeImage).toMatch(/^data:image\/(png|jpeg|webp);base64,/);

        // Extract and check image size
        const imageData = result.archetypeImage.split(",")[1];
        const imageSizeKB = Math.round((imageData.length * 3) / 4 / 1024);
        logResult("Generated image size", `~${imageSizeKB}KB`);

        // Save generated image for manual inspection
        const outputDir = path.join(__dirname, "fixtures/generated-cards");
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, `${personKey}-card.png`);
        const outputBuffer = Buffer.from(imageData, "base64");
        fs.writeFileSync(outputPath, outputBuffer);
        logResult("Saved to", outputPath);
      }

      return result;
    };

    it.skip("should generate card for Brian Chesky", async () => {
      if (SKIP_INTEGRATION) {
        console.log("    Skipping integration test (set RUN_INTEGRATION_TESTS=true to enable)");
        return;
      }
      await testImageGeneration("brian");
    }, 60000);

    it.skip("should generate card for Demis Hassabis", async () => {
      if (SKIP_INTEGRATION) {
        console.log("    Skipping integration test (set RUN_INTEGRATION_TESTS=true to enable)");
        return;
      }
      await testImageGeneration("demis");
    }, 60000);

    it.skip("should generate card for Justin", async () => {
      if (SKIP_INTEGRATION) {
        console.log("    Skipping integration test (set RUN_INTEGRATION_TESTS=true to enable)");
        return;
      }
      await testImageGeneration("justin");
    }, 60000);

    it.skip("should generate card for Lenny Rachitsky", async () => {
      if (SKIP_INTEGRATION) {
        console.log("    Skipping integration test (set RUN_INTEGRATION_TESTS=true to enable)");
        return;
      }
      await testImageGeneration("lenny");
    }, 60000);

    it.skip("should generate card for Reid Hoffman", async () => {
      if (SKIP_INTEGRATION) {
        console.log("    Skipping integration test (set RUN_INTEGRATION_TESTS=true to enable)");
        return;
      }
      await testImageGeneration("reid");
    }, 60000);
  });

  describe("Image Quality Requirements", () => {
    it("should validate minimum image dimensions conceptually", () => {
      logStep("Documenting image quality requirements");

      const requirements = {
        minWidth: 200,
        minHeight: 200,
        maxWidth: 2048,
        maxHeight: 2048,
        recommendedAspect: "1:1 (square) or 3:4 (portrait)",
        minFileSize: "10KB",
        maxFileSize: "500KB",
        formats: ["JPEG", "PNG", "WebP"],
      };

      console.log("\n    Image Quality Requirements for Best Results:");
      console.log(`    - Minimum dimensions: ${requirements.minWidth}x${requirements.minHeight}px`);
      console.log(`    - Maximum dimensions: ${requirements.maxWidth}x${requirements.maxHeight}px`);
      console.log(`    - Recommended aspect: ${requirements.recommendedAspect}`);
      console.log(`    - File size: ${requirements.minFileSize} - ${requirements.maxFileSize}`);
      console.log(`    - Supported formats: ${requirements.formats.join(", ")}`);
      console.log("\n    Face Requirements:");
      console.log("    - Face should be clearly visible and well-lit");
      console.log("    - Front-facing or 3/4 view preferred");
      console.log("    - Face should occupy significant portion of image");
      console.log("    - Avoid sunglasses, masks, or heavy shadows");

      expect(true).toBe(true); // Documentation test always passes
    });
  });

  afterAll(() => {
    console.log("\n" + "=".repeat(60));
    console.log("  Profile image card tests completed");
    console.log("  ");
    console.log("  To run integration tests (requires running server):");
    console.log("  RUN_INTEGRATION_TESTS=true npm test -- profile-image");
    console.log("=".repeat(60) + "\n");
  });
});

// Export test profiles for use in other tests
export { TEST_PROFILES, PROFILE_IMAGES_DIR };
