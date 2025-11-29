import type { Metadata } from "next";

import "./globals.css";
import { geistMono, geistSans } from "@/lib/fonts";
import { AuthProvider } from "@/lib/auth-context";
import HeadSEO from "./head-seo";

export const metadata: Metadata = {
  title: {
    default:
      "Sillycorns Shop India - Best Gadgets & Tech Products | Sillycorn Reviews",
    template: "%s | Sillycorns India",
  },
  description:
    "Sillycorns Shop India - Your ultimate destination for the best gadgets, tech products, and honest reviews in India. Discover trending tech at Sillycorn. Updated hourly with fresh product recommendations from Sillycorns Media. Available worldwide. Shop smart, shop Sillycorn!",
  keywords: [
    "sillycorns",
    "sillycorn",
    "sillycorns shop",
    "sillycorns india",
    "sillycorn india",
    "sillycorns shop india",
    "silly corns",
    "sillycorn shop",
    "sillycorns gadgets",
    "sillycorn reviews",
    "sillycorns tech",
    "sillycorns products",
    "sillycorn store",
    "gadgets india",
    "tech products india",
    "best gadgets india",
    "amazon india gadgets",
    "tech shop india",
    "gadgets",
    "tech products",
    "product reviews",
    "tech reviews",
    "gadget recommendations",
    "tech gadgets shop",
    "best tech products",
    "trending gadgets",
    "viral tech products",
    "amazon gadgets",
    "tech accessories",
    "smart gadgets",
    "cool tech",
    "innovative products",
    "tech deals",
    "gadget store",
  ],
  authors: [{ name: "Sillycorns Media", url: "https://sillycorn.vercel.app" }],
  creator: "Sillycorns Media",
  publisher: "Sillycorns Media",
  metadataBase: new URL("https://sillycorn.vercel.app"),
  alternates: {
    canonical: "https://sillycorn.vercel.app",
    languages: {
      "en-IN": "https://sillycorn.vercel.app",
      en: "https://sillycorn.vercel.app",
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sillycorn.vercel.app",
    siteName: "Sillycorns Shop India",
    title:
      "Sillycorns Shop India - Best Gadgets & Tech Products | Sillycorn Reviews",
    description:
      "Shop the best gadgets and tech products at Sillycorns India. Updated hourly with trending tech, honest reviews, and exclusive deals. Your trusted Sillycorn tech destination in India and worldwide.",
    images: [
      {
        url: "https://sillycorn.vercel.app/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Sillycorns Shop - Latest Gadgets & Tech Products",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Sillycorns",
    creator: "@Sillycorns",
    title: "Sillycorns Shop India - Best Gadgets & Tech Products",
    description:
      "Discover trending gadgets and tech products at Sillycorns Shop India. Updated hourly with the latest tech for India and worldwide!",
    images: ["https://sillycorn.vercel.app/og-image.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
      noimageindex: false,
    },
  },
  verification: {
    google: "google-site-verification-code",
    other: {
      "msvalidate.01": "bing-site-verification-code",
    },
  },
  category: "technology",
  classification: "E-commerce, Technology, Product Reviews",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <HeadSEO />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
