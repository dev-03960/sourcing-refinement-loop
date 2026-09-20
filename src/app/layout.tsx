import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flexiple AI Recruiter | The Sourcing Refinement Loop",
  description: "Human-in-the-loop AI recruiter that extracts criteria, deterministically filters talent pools, scores against rubrics, and refines in conversation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
        {children}
      </body>
    </html>
  );
}
