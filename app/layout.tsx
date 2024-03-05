import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Infinity AI",
  description: "AI tools Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <link rel="icon" href="/logo.png" sizes="any" />
        <body className={`${inter.className} w-full min-h-screen`}>
          {children}
          <Toaster position="top-center" duration={2000} richColors></Toaster>
        </body>
      </html>
    </ClerkProvider>

  );
}
