import { PostsFeed } from "@/components/PostsFeed";
import { SearchBar } from "@/components/SearchBar";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sillycorns - Best Gadgets & Tech Products Reviews",
  description:
    "Explore curated gadgets and tech products. Find product reviews, recommendations, and exclusive links from Sillycorns. Your guide to the best tech products.",
  keywords: [
    "sillycorns",
    "tech gadgets",
    "product reviews",
    "gadget recommendations",
  ],
  openGraph: {
    title: "Sillycorns - Best Gadgets & Tech Products",
    description: "Discover the latest and greatest gadgets and tech products",
    type: "website",
    url: "https://sillycorn.vercel.app",
    images: [
      {
        url: "https://sillycorn.vercel.app/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Sillycorns - Gadgets & Tech Reviews",
      },
    ],
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sillycorns",
    url: "https://sillycorn.vercel.app",
    description: "Best gadgets and tech products reviews and recommendations",
    publisher: {
      "@type": "Organization",
      name: "Sillycorns Media",
      sameAs: [
        "https://www.youtube.com/@SillycornsMedia",
        "https://x.com/Sillycorns",
        "https://www.instagram.com/sillycorns.media",
      ],
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://sillycorn.vercel.app?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-[#ffc820]">
        {/* Header */}
        {/* <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Silly Corns</h1>
            <Link href="/dashboard">
              <Button className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div> */}

        {/* logo + search bar */}
        <div className="flex flex-col items-center justify-start gap-3 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-5">
          <Image
            src="/logo.png"
            alt="Silly Corns Logo"
            className="w-full h-auto object-contain"
            width={1061}
            height={185}
          />
          <div className="w-full">
            <SearchBar />
          </div>
        </div>

        {/* Posts Feed */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <PostsFeed />
        </div>
      </div>
    </>
  );
}
