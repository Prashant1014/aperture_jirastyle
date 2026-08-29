import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Background3D } from "@/components/background-3d";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aperture Platform",
  description: "Internal portal for the working members of Aperture, the digital arts society.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aperture",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-foreground font-sans bg-transparent">
        <Background3D />
        {children}
      </body>
    </html>
  );
}
