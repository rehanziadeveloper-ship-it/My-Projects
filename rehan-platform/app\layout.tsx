import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muhammad Rehan — Agency Automation & Voice AI Infrastructure",
  description: "Senior Technical Partner for Agencies. We architect and deploy 24/7 autonomous Voice AI agents, complex n8n backend pipelines, and custom client OS portals with guaranteed speed-to-lead.",
  keywords: ["Muhammad Rehan", "AI Agency Partner", "Voice AI", "Agency Automation", "n8n Automation", "Agency Infrastructure", "Supabase", "Next.js 15"],
  authors: [{ name: "Muhammad Rehan", url: "https://www.linkedin.com/in/rehan-zia-voiceai/" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/apple-icon.png"
  },
  openGraph: {
    title: "Muhammad Rehan — Agency Automation & Voice AI Infrastructure",
    description: "Plug-and-play fractional technical partner for marketing & lead-gen agencies. 24/7 Voice AI front desks, sub-15s lead triage, and custom client OS portals.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
