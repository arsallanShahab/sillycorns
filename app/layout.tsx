import type { Metadata } from "next";

import "./globals.css";
import { geistMono, geistSans } from "@/lib/fonts";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Sillycorns - Best Gadgets & Tech Products Reviews",
  description:
    "Discover the best gadgets, tech products, and reviews on Sillycorns. Curated links and recommendations for tech enthusiasts. Official content from @SillycornsMedia.",
  keywords: [
    "sillycorns",
    "gadgets",
    "tech products",
    "product reviews",
    "tech reviews",
    "gadget recommendation",
    "product links",
  ],
  authors: [{ name: "Sillycorns Media" }],
  creator: "Sillycorns Media",
  publisher: "Sillycorns Media",
  metadataBase: new URL("https://sillycorns.vercel.app"),
  alternates: {
    canonical: "https://sillycorns.vercel.app",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sillycorns.vercel.app",
    siteName: "Sillycorns",
    title: "Sillycorns - Best Gadgets & Tech Products Reviews",
    description:
      "Discover the best gadgets, tech products, and reviews on Sillycorns. Curated links and recommendations for tech enthusiasts.",
    images: [
      {
        url: "https://sillycorns.vercel.app/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Sillycorns - Gadgets & Tech Reviews",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sillycorns - Best Gadgets & Tech Products",
    description: "Discover the best gadgets and tech products with Sillycorns",
    creator: "@Sillycorns",
    images: ["https://sillycorns.vercel.app/og-image.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
    other: {
      "msvalidate.01": "bing-site-verification-code",
    },
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
