/**
 * Script to download profile images for celebrity cards
 * Uses Wikipedia API to get high-quality, centered profile images
 * Run with: npx tsx scripts/download-celebrity-images.ts
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

// Celebrity data with Wikipedia page titles for image lookup
const CELEBRITIES = [
  { id: "john-cena", wiki: "John_Cena", name: "John Cena" },
  { id: "dwayne-johnson", wiki: "Dwayne_Johnson", name: "Dwayne Johnson" },
  { id: "joe-rogan", wiki: "Joe_Rogan", name: "Joe Rogan" },
  { id: "kevin-hart", wiki: "Kevin_Hart", name: "Kevin Hart" },
  { id: "ryan-reynolds", wiki: "Ryan_Reynolds", name: "Ryan Reynolds" },
  { id: "gordon-ramsay", wiki: "Gordon_Ramsay", name: "Gordon Ramsay" },
  { id: "snoop-dogg", wiki: "Snoop_Dogg", name: "Snoop Dogg" },
  { id: "kim-kardashian", wiki: "Kim_Kardashian", name: "Kim Kardashian" },
  { id: "kanye-west", wiki: "Kanye_West", name: "Kanye West" },
  { id: "oprah-winfrey", wiki: "Oprah_Winfrey", name: "Oprah Winfrey" },
  { id: "lebron-james", wiki: "LeBron_James", name: "LeBron James" },
  { id: "taylor-swift", wiki: "Taylor_Swift", name: "Taylor Swift" },
  { id: "mrbeast", wiki: "MrBeast", name: "MrBeast" },
  { id: "drake", wiki: "Drake_(musician)", name: "Drake" },
  { id: "guy-fieri", wiki: "Guy_Fieri", name: "Guy Fieri" },
  { id: "conor-mcgregor", wiki: "Conor_McGregor", name: "Conor McGregor" },
  { id: "will-smith", wiki: "Will_Smith", name: "Will Smith" },
  { id: "shaquille-oneal", wiki: "Shaquille_O%27Neal", name: "Shaquille O'Neal" },
  { id: "martha-stewart", wiki: "Martha_Stewart", name: "Martha Stewart" },
  { id: "arnold-schwarzenegger", wiki: "Arnold_Schwarzenegger", name: "Arnold Schwarzenegger" },
  { id: "tom-brady", wiki: "Tom_Brady", name: "Tom Brady" },
  { id: "beyonce", wiki: "Beyonc%C3%A9", name: "Beyoncé" },
  { id: "post-malone", wiki: "Post_Malone", name: "Post Malone" },
  { id: "dj-khaled", wiki: "DJ_Khaled", name: "DJ Khaled" },
  { id: "ellen-degeneres", wiki: "Ellen_DeGeneres", name: "Ellen DeGeneres" },
  { id: "conan-obrien", wiki: "Conan_O%27Brien", name: "Conan O'Brien" },
  { id: "steve-harvey", wiki: "Steve_Harvey", name: "Steve Harvey" },
  { id: "jimmy-fallon", wiki: "Jimmy_Fallon", name: "Jimmy Fallon" },
  { id: "serena-williams", wiki: "Serena_Williams", name: "Serena Williams" },
  { id: "bad-bunny", wiki: "Bad_Bunny", name: "Bad Bunny" },
  { id: "billie-eilish", wiki: "Billie_Eilish", name: "Billie Eilish" },
  { id: "lizzo", wiki: "Lizzo", name: "Lizzo" },
  { id: "logan-paul", wiki: "Logan_Paul", name: "Logan Paul" },
  { id: "jake-paul", wiki: "Jake_Paul", name: "Jake Paul" },
  { id: "pewdiepie", wiki: "PewDiePie", name: "PewDiePie" },
  { id: "david-beckham", wiki: "David_Beckham", name: "David Beckham" },
  { id: "bear-grylls", wiki: "Bear_Grylls", name: "Bear Grylls" },
  { id: "james-corden", wiki: "James_Corden", name: "James Corden" },
  { id: "dr-phil", wiki: "Phil_McGraw", name: "Dr. Phil" },
  { id: "gwyneth-paltrow", wiki: "Gwyneth_Paltrow", name: "Gwyneth Paltrow" },
  { id: "matthew-mcconaughey", wiki: "Matthew_McConaughey", name: "Matthew McConaughey" },
  { id: "neil-degrasse-tyson", wiki: "Neil_deGrasse_Tyson", name: "Neil deGrasse Tyson" },
  { id: "bill-nye", wiki: "Bill_Nye", name: "Bill Nye" },
  { id: "gary-vaynerchuk", wiki: "Gary_Vaynerchuk", name: "Gary Vaynerchuk" },
  { id: "floyd-mayweather", wiki: "Floyd_Mayweather_Jr.", name: "Floyd Mayweather" },
  { id: "adele", wiki: "Adele", name: "Adele" },
  { id: "donald-trump", wiki: "Donald_Trump", name: "Donald Trump" },
  { id: "ed-sheeran", wiki: "Ed_Sheeran", name: "Ed Sheeran" },
  { id: "jennifer-lopez", wiki: "Jennifer_Lopez", name: "Jennifer Lopez" },
  { id: "johnny-depp", wiki: "Johnny_Depp", name: "Johnny Depp" },
];

// Fetch JSON from URL
function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, { headers: { "User-Agent": "PMRoast/1.0 (Celebrity Card Generator)" } }, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          fetchJson(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }

      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e}`));
        }
      });
    }).on("error", reject);
  });
}

// Download file from URL
function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, { headers: { "User-Agent": "PMRoast/1.0" } }, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });
      fileStream.on("error", reject);
    }).on("error", reject);
  });
}

// Get Wikipedia main image URL for a page
async function getWikipediaImageUrl(pageTitle: string): Promise<string | null> {
  try {
    // Use Wikipedia API to get page images
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`;
    const data = await fetchJson(apiUrl);

    if (data.originalimage?.source) {
      return data.originalimage.source;
    }
    if (data.thumbnail?.source) {
      // Try to get higher res version by modifying thumbnail URL
      const thumbUrl = data.thumbnail.source;
      // Wikipedia thumbnails have format: .../thumb/X/XX/Filename.jpg/NNNpx-Filename.jpg
      // We want the original: .../X/XX/Filename.jpg
      const match = thumbUrl.match(/\/thumb\/(.+?)\/\d+px-/);
      if (match) {
        return `https://upload.wikimedia.org/wikipedia/commons/${match[1]}`;
      }
      return thumbUrl;
    }
    return null;
  } catch (error) {
    console.error(`  Wikipedia API error: ${error}`);
    return null;
  }
}

// Get file extension from URL or content type
function getExtension(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes(".png")) return ".png";
  if (urlLower.includes(".gif")) return ".gif";
  if (urlLower.includes(".webp")) return ".webp";
  return ".jpg";
}

async function downloadCelebrityImage(celeb: typeof CELEBRITIES[0], outputDir: string): Promise<boolean> {
  console.log(`\nDownloading: ${celeb.name}...`);

  // Try Wikipedia first
  const imageUrl = await getWikipediaImageUrl(celeb.wiki);

  if (!imageUrl) {
    console.log(`  No image found for ${celeb.name}`);
    return false;
  }

  const ext = getExtension(imageUrl);
  const outputPath = path.join(outputDir, `${celeb.id}${ext}`);

  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`  Already exists: ${outputPath}`);
    return true;
  }

  try {
    console.log(`  Source: ${imageUrl.substring(0, 80)}...`);
    await downloadFile(imageUrl, outputPath);

    // Check file size
    const stats = fs.statSync(outputPath);
    if (stats.size < 1000) {
      fs.unlinkSync(outputPath);
      console.log(`  File too small, removed`);
      return false;
    }

    console.log(`  Saved: ${outputPath} (${Math.round(stats.size / 1024)}KB)`);
    return true;
  } catch (error) {
    console.log(`  Download failed: ${error}`);
    return false;
  }
}

async function main() {
  console.log("=== Downloading Celebrity Profile Images ===\n");
  console.log("Source: Wikipedia (high-quality, properly licensed images)\n");

  const outputDir = path.join(process.cwd(), "public", "famous", "celebrities");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const succeeded: string[] = [];
  const failed: string[] = [];

  for (const celeb of CELEBRITIES) {
    const success = await downloadCelebrityImage(celeb, outputDir);
    if (success) {
      succeeded.push(celeb.name);
    } else {
      failed.push(celeb.name);
    }
    // Small delay to be nice to Wikipedia
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("\n=== Download Complete ===");
  console.log(`Downloaded: ${succeeded.length}/${CELEBRITIES.length}`);

  if (failed.length > 0) {
    console.log(`\nFailed downloads (${failed.length}):`);
    failed.forEach(f => console.log(`  - ${f}`));
    console.log(`\nManually download images for failed celebrities to:`);
    console.log(`  /public/famous/celebrities/<id>.jpg`);
    console.log(`\nSuggested sources:`);
    console.log(`  - Wikipedia Commons`);
    console.log(`  - Official social media profiles`);
    console.log(`  - Press kit photos`);
  }
}

main().catch(console.error);
