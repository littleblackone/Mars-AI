import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./shared/Header";
import Footer from "./shared/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mars AI",
  description: "AI tools Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/logo.png" sizes="any" />
      <body className={`${inter.className} bg-main-bg w-full min-h-screen`}>
        <Header></Header>
        {children}
        <Footer></Footer>
      </body>
    </html>
  );
}
