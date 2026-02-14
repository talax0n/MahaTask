import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarLayout } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MahaTask - Academic Dashboard",
  description:
    "Manage your academic tasks, schedule, and study groups with MahaTask",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <SidebarProvider defaultOpen={true}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
        >
          <SidebarLayout>{children}</SidebarLayout>
        </body>
      </SidebarProvider>
    </html>
  );
}
