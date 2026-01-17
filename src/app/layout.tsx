import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  },
  twitter: {
    card: "summary_large_image",
    title: "PM Roast | Get Brutally Honest Career Feedback",
    description:
      "Upload your resume or LinkedIn. Get roasted by AI trained on 200+ interviews with world-class product leaders.",
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
        {children}
      </body>
    </html>
  );
}
