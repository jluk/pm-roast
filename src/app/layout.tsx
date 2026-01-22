import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CardModalProvider } from "@/components/CardModalContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PM Roast | Get Brutally Honest Career Feedback",
  description:
    "Upload your resume or LinkedIn. Get roasted by AI trained on 200+ interviews with world-class product leaders from Lenny's Podcast.",
  openGraph: {
    title: "PM Roast | Get Brutally Honest Career Feedback",
    description:
      "Upload your resume or LinkedIn. Get roasted by AI trained on 200+ interviews with world-class product leaders.",
    type: "website",
    images: [
      {
        url: "https://www.pmroast.com/api/og",
        width: 1200,
        height: 630,
        alt: "PM Roast - Get your PM trading card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PM Roast | Get Brutally Honest Career Feedback",
    description:
      "Upload your resume or LinkedIn. Get roasted by AI trained on 200+ interviews with world-class product leaders.",
    images: ["https://www.pmroast.com/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <CardModalProvider>
          {children}
        </CardModalProvider>
        <Analytics />
      </body>
    </html>
  );
}
