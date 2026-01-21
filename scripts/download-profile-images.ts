/**
 * Script to download Twitter/X profile images for famous cards
 * Run with: npx tsx scripts/download-profile-images.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";

// Twitter handles for the 50 famous people
const PROFILES = [
  { id: "paul-graham", handle: "paulg" },
  { id: "marc-andreessen", handle: "pmarca" },
  { id: "naval-ravikant", handle: "naval" },
  { id: "sam-altman", handle: "sama" },
  { id: "garry-tan", handle: "garrytan" },
  { id: "balaji-srinivasan", handle: "balajis" },
  { id: "chamath-palihapitiya", handle: "chamath" },
  { id: "david-sacks", handle: "DavidSacks" },
  { id: "keith-rabois", handle: "rabois" },
  { id: "jason-calacanis", handle: "Jason" },
  { id: "satya-nadella", handle: "satyanadella" },
  { id: "sundar-pichai", handle: "sundarpichai" },
  { id: "jensen-huang", handle: "nvidia" },
  { id: "patrick-collison", handle: "patrickc" },
  { id: "tobi-lutke", handle: "tobi" },
  { id: "daniel-ek", handle: "eldsjal" },
  { id: "drew-houston", handle: "drewhouston" },
  { id: "andrej-karpathy", handle: "karpathy" },
  { id: "yann-lecun", handle: "ylecun" },
  { id: "ilya-sutskever", handle: "ilyasut" },
  { id: "shreyas-doshi", handle: "shreyas" },
  { id: "julie-zhuo", handle: "joulee" },
  { id: "andrew-chen", handle: "andrewchen" },
  { id: "pieter-levels", handle: "levelsio" },
  { id: "sahil-lavingia", handle: "shl" },
  { id: "guillermo-rauch", handle: "rauchg" },
  { id: "theo-browne", handle: "t3dotgg" },
  { id: "primeagen", handle: "ThePrimeagen" },
  { id: "kara-swisher", handle: "karaswisher" },
  { id: "ben-thompson", handle: "benthompson" },
  { id: "vitalik-buterin", handle: "VitalikButerin" },
  { id: "brian-armstrong", handle: "brian_armstrong" },
  { id: "stewart-butterfield", handle: "stewart" },
  { id: "aaron-levie", handle: "levie" },
  { id: "jason-fried", handle: "jasonfried" },
  { id: "dhh", handle: "dhh" },
  { id: "jeff-weiner", handle: "jeffweiner" },
  { id: "dharmesh-shah", handle: "dharmesh" },
  { id: "fei-fei-li", handle: "drfeifei" },
  { id: "casey-newton", handle: "CaseyNewton" },
  { id: "packy-mccormick", handle: "packym" },
  { id: "dan-abramov", handle: "dan_abramov" },
  { id: "kent-c-dodds", handle: "kentcdodds" },
  { id: "emad-mostaque", handle: "EMostaque" },
];

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(filepath);

    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        let redirectUrl = response.headers.location;
        if (redirectUrl) {
          // Handle relative redirects
          if (redirectUrl.startsWith('/')) {
            const urlObj = new URL(url);
            redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
          }
          file.close();
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          downloadImage(redirectUrl, filepath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        resolve(false);
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    });

    request.on('error', () => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      resolve(false);
    });

    request.setTimeout(15000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log("=== Downloading Profile Images ===\n");

  const outputDir = path.join(process.cwd(), "public", "famous");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const failed: string[] = [];
  const succeeded: string[] = [];

  for (const profile of PROFILES) {
    const filepath = path.join(outputDir, `${profile.id}.jpg`);

    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`✓ ${profile.id} - already exists`);
      succeeded.push(profile.id);
      continue;
    }

    // Try unavatar.io service which aggregates profile pictures
    const unavatarUrl = `https://unavatar.io/twitter/${profile.handle}?fallback=false`;

    console.log(`Downloading ${profile.id} (@${profile.handle})...`);
    const success = await downloadImage(unavatarUrl, filepath);

    if (success) {
      console.log(`  ✓ Downloaded`);
      succeeded.push(profile.id);
    } else {
      console.log(`  ✗ Failed - manual download needed`);
      failed.push(`${profile.id} (@${profile.handle})`);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 500));
  }

  console.log("\n=== Summary ===");
  console.log(`Downloaded: ${succeeded.length}/${PROFILES.length}`);

  if (failed.length > 0) {
    console.log(`\nFailed downloads (manual download needed):`);
    failed.forEach(f => console.log(`  - ${f}`));
    console.log(`\nTo manually download, search for their profile picture and save to:`);
    console.log(`  /public/famous/<id>.jpg`);
  }
}

main().catch(console.error);
