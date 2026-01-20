/**
 * Test PDF generator - creates various PDF formats for testing the resume workflow
 * Uses PDFKit for better compatibility with pdf-parse
 *
 * Run with: npx tsx __tests__/fixtures/createTestPdfs.ts
 */
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'pdfs');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface ResumeContent {
  name: string;
  title: string;
  summary: string;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }>;
  skills: string[];
  education: string;
}

// Test resume data sets
const RESUMES: Record<string, ResumeContent> = {
  // Minimal resume - edge case
  minimal: {
    name: "Jane Doe",
    title: "Product Manager",
    summary: "PM with startup experience.",
    experience: [
      {
        company: "StartupCo",
        role: "PM",
        duration: "2022-2024",
        bullets: ["Shipped features"]
      }
    ],
    skills: ["Jira"],
    education: "BS Computer Science"
  },

  // Standard resume - typical length
  standard: {
    name: "Sarah Chen",
    title: "Senior Product Manager",
    summary: "Experienced PM with 6+ years driving product strategy and execution at B2B SaaS companies. Passionate about data-driven decisions and cross-functional collaboration.",
    experience: [
      {
        company: "Stripe",
        role: "Senior Product Manager",
        duration: "2021-Present",
        bullets: [
          "Led payments optimization initiative increasing conversion by 12%",
          "Managed roadmap for merchant dashboard serving 500K+ businesses",
          "Collaborated with engineering, design, and sales teams on product launches"
        ]
      },
      {
        company: "Notion",
        role: "Product Manager",
        duration: "2019-2021",
        bullets: [
          "Launched team collaboration features adopted by 100K workspaces",
          "Conducted 50+ user interviews to validate product hypotheses",
          "Defined metrics framework and implemented A/B testing process"
        ]
      },
      {
        company: "Early Stage Startup",
        role: "Associate PM",
        duration: "2017-2019",
        bullets: [
          "First PM hire, established product processes from scratch",
          "Shipped MVP that acquired 10K users in first 3 months"
        ]
      }
    ],
    skills: ["Product Strategy", "A/B Testing", "SQL", "Figma", "Amplitude", "Jira", "Roadmapping"],
    education: "MBA Stanford GSB, BS Engineering UC Berkeley"
  },

  // Long/detailed resume - multiple pages worth of content
  long: {
    name: "Michael Rodriguez",
    title: "Principal Product Manager | ex-Google, ex-Meta",
    summary: "Principal PM with 12+ years of experience building 0-to-1 products and scaling platforms to billions of users. Track record of driving multi-hundred-million dollar revenue initiatives. Expert in platform strategy, developer ecosystems, and AI/ML product development. Former founder with deep technical background.",
    experience: [
      {
        company: "Google",
        role: "Principal Product Manager, Search",
        duration: "2020-Present",
        bullets: [
          "Leading AI-powered search features reaching 4B+ daily queries globally",
          "Drove 23% improvement in search relevance metrics through ML model improvements",
          "Built and managed team of 8 PMs across Search, Assistant, and Knowledge Graph",
          "Partnered with VP-level stakeholders to define 3-year product vision",
          "Launched featured snippets enhancement generating $200M+ incremental ad revenue",
          "Established OKR framework adopted across 200+ person Search org"
        ]
      },
      {
        company: "Meta",
        role: "Senior Product Manager, Marketplace",
        duration: "2017-2020",
        bullets: [
          "Scaled Facebook Marketplace from 10M to 1B+ monthly active users",
          "Led commerce infrastructure team enabling $50B+ GMV annually",
          "Drove international expansion across 70+ countries with localized experiences",
          "Implemented trust & safety features reducing fraud by 40%",
          "Managed cross-functional team of 50+ engineers, designers, and data scientists"
        ]
      },
      {
        company: "Amazon",
        role: "Product Manager, AWS",
        duration: "2014-2017",
        bullets: [
          "Launched 3 new AWS services from concept to GA, achieving $100M ARR",
          "Built developer tools used by 1M+ developers monthly",
          "Wrote 6-pager documents for S-team reviews on strategic initiatives",
          "Led pricing strategy optimization increasing margin by 15%"
        ]
      },
      {
        company: "TechStartup (Acquired)",
        role: "Co-founder & Head of Product",
        duration: "2011-2014",
        bullets: [
          "Founded B2B analytics platform, raised $5M Series A",
          "Built product team from 0 to 15 across product, design, and research",
          "Led successful acquisition by enterprise software company"
        ]
      },
      {
        company: "Microsoft",
        role: "Program Manager",
        duration: "2008-2011",
        bullets: [
          "Developed features for Office 365 suite used by 300M+ users",
          "Shipped on-time for 6 consecutive releases"
        ]
      }
    ],
    skills: [
      "Product Strategy", "Platform Development", "AI/ML Products", "Developer Ecosystems",
      "0-to-1 Products", "Scaling", "Team Leadership", "Executive Communication",
      "SQL/Python", "Metrics & Analytics", "A/B Testing at Scale", "Pricing Strategy",
      "International Expansion", "M&A Integration", "OKRs", "Agile/Scrum"
    ],
    education: "MBA Harvard Business School, MS Computer Science MIT, BS Computer Science Carnegie Mellon"
  },

  // Resume with special characters and formatting
  specialChars: {
    name: "Priya Sharma-O'Brien",
    title: "Staff PM @ Figma | 10x Product Leader",
    summary: "Award-winning PM specializing in design tools & collaboration. Featured in Forbes 30 Under 30. Speaker at Config 2023, Product School, Mind the Product. Built products used by 99% of Fortune 500 companies.",
    experience: [
      {
        company: "Figma",
        role: "Staff Product Manager",
        duration: "2022-Present",
        bullets: [
          "Lead FigJam features - whiteboarding tool with 10M+ MAUs",
          "Shipped AI-powered features: auto-layout suggestions & design tokens",
          "Grew developer platform ecosystem by 300% YoY (plugins & widgets)"
        ]
      },
      {
        company: "Uber",
        role: "Product Manager, Driver Experience",
        duration: "2019-2022",
        bullets: [
          "Improved driver earnings by $2.5B annually through algorithm optimization",
          "Launched in-app education features with 85% completion rate",
          "Reduced driver churn by 18% via earnings transparency features"
        ]
      }
    ],
    skills: ["Design Systems", "Developer Platforms", "AI/ML", "Growth", "Internationalization", "Accessibility (WCAG 2.1)"],
    education: "BSc Economics & CS, University College London (UCL)"
  },

  // Entry-level / junior PM resume
  junior: {
    name: "Alex Kim",
    title: "Associate Product Manager",
    summary: "Recent APM program graduate eager to learn and grow. Background in software engineering with passion for user-centric design.",
    experience: [
      {
        company: "Tech Company",
        role: "Associate Product Manager",
        duration: "2023-Present",
        bullets: [
          "Supporting senior PMs on feature development and launches",
          "Writing PRDs and conducting competitive analysis",
          "Running weekly standups with engineering team"
        ]
      },
      {
        company: "Tech Company",
        role: "Software Engineering Intern",
        duration: "Summer 2022",
        bullets: [
          "Built internal tool that saved team 10 hours/week",
          "Participated in product discussions and sprint planning"
        ]
      }
    ],
    skills: ["Jira", "SQL basics", "Python", "User Research", "Figma"],
    education: "BS Computer Science, University of Washington, GPA 3.8"
  },

  // International PM resume
  international: {
    name: "Yuki Tanaka",
    title: "Product Manager - APAC",
    summary: "PM with experience in Japanese and global markets. Fluent in English, Japanese, and Mandarin. Previously at Line Corporation and Rakuten. Expert in cross-cultural product development.",
    experience: [
      {
        company: "Line Corporation",
        role: "Product Manager",
        duration: "2020-2024",
        bullets: [
          "Managed messaging features for 200M+ users across Asia-Pacific region",
          "Launched payment integration (LINE Pay) in 5 new markets including Thailand and Taiwan",
          "Worked with distributed teams across Tokyo, Bangkok, Taipei, and Singapore offices",
          "Led localization efforts for 15+ languages with 99.5% translation accuracy"
        ]
      },
      {
        company: "Rakuten",
        role: "Associate Product Manager",
        duration: "2018-2020",
        bullets: [
          "Supported e-commerce platform serving 50M+ users in Japan",
          "Implemented A/B testing framework for checkout optimization"
        ]
      }
    ],
    skills: ["Localization", "International PM", "Payments", "Growth", "Cross-cultural Communication"],
    education: "MBA Keio University, BS Tokyo University"
  }
};

function createPdf(content: ResumeContent, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const outputPath = path.join(OUTPUT_DIR, filename);
    const stream = fs.createWriteStream(outputPath);

    stream.on('finish', () => {
      console.log(`Created: ${outputPath}`);
      resolve();
    });

    stream.on('error', reject);
    doc.pipe(stream);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(content.name);
    doc.fontSize(12).font('Helvetica').text(content.title);
    doc.moveDown();

    // Summary
    doc.fontSize(11).font('Helvetica-Bold').text('SUMMARY');
    doc.fontSize(10).font('Helvetica').text(content.summary);
    doc.moveDown();

    // Experience
    doc.fontSize(11).font('Helvetica-Bold').text('EXPERIENCE');
    doc.moveDown(0.5);

    for (const exp of content.experience) {
      doc.fontSize(10).font('Helvetica-Bold').text(`${exp.role} | ${exp.company}`);
      doc.fontSize(9).font('Helvetica').text(exp.duration);
      doc.moveDown(0.3);

      for (const bullet of exp.bullets) {
        doc.fontSize(10).font('Helvetica').text(`• ${bullet}`, { indent: 10 });
      }
      doc.moveDown(0.5);
    }

    // Skills
    doc.fontSize(11).font('Helvetica-Bold').text('SKILLS');
    doc.fontSize(10).font('Helvetica').text(content.skills.join(' • '));
    doc.moveDown();

    // Education
    doc.fontSize(11).font('Helvetica-Bold').text('EDUCATION');
    doc.fontSize(10).font('Helvetica').text(content.education);

    doc.end();
  });
}

function createEmptyPdf(): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const outputPath = path.join(OUTPUT_DIR, 'empty.pdf');
    const stream = fs.createWriteStream(outputPath);

    stream.on('finish', () => {
      console.log(`Created: ${outputPath}`);
      resolve();
    });

    stream.on('error', reject);
    doc.pipe(stream);

    // Just create an empty page with no text
    doc.end();
  });
}

function createTinyTextPdf(): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const outputPath = path.join(OUTPUT_DIR, 'tiny.pdf');
    const stream = fs.createWriteStream(outputPath);

    stream.on('finish', () => {
      console.log(`Created: ${outputPath}`);
      resolve();
    });

    stream.on('error', reject);
    doc.pipe(stream);

    // Only 9 characters - should fail validation (< 20 chars)
    doc.fontSize(12).text('PM resume');
    doc.end();
  });
}

async function main() {
  console.log('Creating test PDFs using PDFKit...\n');

  // Create standard resumes
  for (const [key, content] of Object.entries(RESUMES)) {
    await createPdf(content, `${key}.pdf`);
  }

  // Create edge case PDFs
  await createEmptyPdf();
  await createTinyTextPdf();

  console.log('\nAll test PDFs created successfully!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

main().catch(console.error);
