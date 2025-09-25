import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecipeVibe - Discover Amazing Recipes",
  description: "Join thousands of food lovers sharing their favorite recipes. Find inspiration, share your creations, and connect with fellow cooking enthusiasts.",
  keywords: ["recipes", "cooking", "food", "chef", "kitchen", "cuisine"],
  authors: [{ name: "RecipeVibe Team" }],
  openGraph: {
    title: "RecipeVibe - Discover Amazing Recipes",
    description: "Join thousands of food lovers sharing their favorite recipes.",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
              <Toaster />
      </body>
    </html>
  );
}
