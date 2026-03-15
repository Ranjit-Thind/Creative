import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdGenius — AI Ad Creative Platform",
  description: "Generate 50 high-converting ad creatives in seconds using AI. Optimized for Meta, Google & TikTok.",
  keywords: ["AI ads", "ad creative", "performance marketing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
