import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Infinity AI",
  description: "An AI generation website, the best tool to quickly generate midjourney pictures using easy-to-operate pages. You can reproduce all the operations on pictures in discord here, such as Upscale, Zoom, Expand, and Variation. It also provides 15 adjustable parameters. For generating pictures, (model(v 5.2, v 6, niji 6), aspect ratios (customizable), chaos, image weight, no, quality, seed, stop, stylize, tile, turbo, weird, image prompt url, sref url, style raw), quickly adjust various parameters of the image through an easy-to-operate form, and the image can be downloaded quickly without waiting.text-to-image,image-to-text,image-to-image",
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
