import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Syncial - SocialFi Prediction Markets on Aleo",
  description:
    "Privacy-preserving social prediction markets. Create polls, place bets, earn rewards.",
  keywords: ["aleo", "prediction market", "socialfi", "privacy", "zero knowledge"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-syncial-bg text-syncial-text antialiased">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}