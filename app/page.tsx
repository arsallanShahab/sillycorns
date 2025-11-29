import { PostsFeed } from "@/components/PostsFeed";
import { SearchBar } from "@/components/SearchBar";
import Image from "next/image";
import type { Metadata } from "next";
import { getActivePosts } from "@/lib/storage";

export const revalidate = 0; // Disable caching to ensure fresh content
export const dynamic = "force-dynamic"; // Always generate dynamically

export async function generateMetadata(): Promise<Metadata> {
  // Get latest posts for dynamic metadata
  const latestPosts = await getActivePosts(0, 10);
  const postTitles = latestPosts
    .slice(0, 5)
    .map((p) => p.title)
    .join(", ");
  const lastUpdated = latestPosts[0]?.createdAt
    ? new Date(latestPosts[0].createdAt).toISOString()
    : new Date().toISOString();

  return {
    title: "Sillycorns Shop India - Latest Gadgets & Tech Products | Sillycorn",
    description: `Shop Sillycorns for the best tech gadgets in India! Latest products: ${
      postTitles || "viral gadgets, tech accessories, smart devices"
    }. Updated hourly with trending tech from Sillycorn. Find honest reviews and exclusive deals at Sillycorns Shop India. Available worldwide.`,
    keywords: [
      "sillycorns",
      "sillycorn",
      "sillycorns shop",
      "sillycorn shop",
      "sillycorns india",
      "sillycorn india",
      "sillycorns shop india",
      "sillycorns gadgets",
      "sillycorn reviews",
      "sillycorns tech products",
      "sillycorn store",
      "tech gadgets india",
      "gadgets india",
      "tech products india",
      "amazon india gadgets",
      "best gadgets india",
      "product reviews",
      "gadget recommendations",
      "trending tech",
      "viral gadgets",
      "best tech products 2025",
      "smart gadgets",
      "tech accessories",
      "innovative products",
      ...latestPosts.slice(0, 10).map((p) => p.title.toLowerCase()),
    ],
    openGraph: {
      title: "Sillycorns Shop India - Latest Gadgets & Tech Products",
      description: `Discover trending tech at Sillycorns India! Latest: ${
        postTitles || "viral gadgets and tech products"
      }. Updated hourly with the best tech deals for India and worldwide.`,
      type: "website",
      url: "https://sillycorn.vercel.app",
      locale: "en_IN",
      images: [
        {
          url: latestPosts[0]?.image
            ? `https://sillycorn.vercel.app${latestPosts[0].image}`
            : "https://sillycorn.vercel.app/og-image.jpeg",
          width: 1200,
          height: 630,
          alt: `Sillycorns Shop - ${
            latestPosts[0]?.title || "Latest Tech Products"
          }`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Sillycorns Shop India - Latest Tech & Gadgets",
      description: `New at Sillycorn India: ${
        postTitles || "trending gadgets"
      }. Shop now!`,
      images: [
        latestPosts[0]?.image
          ? `https://sillycorn.vercel.app${latestPosts[0].image}`
          : "https://sillycorn.vercel.app/og-image.jpeg",
      ],
    },
    alternates: {
      canonical: "https://sillycorn.vercel.app",
    },
    other: {
      "last-updated": lastUpdated,
    },
  };
}

export default async function Home() {
  const latestPosts = await getActivePosts(0, 20);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const priceValidDate = futureDate.toISOString().split("T")[0];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sillycorns Media",
    alternateName: [
      "Sillycorn",
      "Sillycorns Shop",
      "Sillycorns India",
      "Silly Corns",
    ],
    url: "https://sillycorn.vercel.app",
    logo: "https://sillycorn.vercel.app/logo_v3.png",
    description:
      "Leading tech gadgets and product review platform in India. Sillycorns Shop offers curated tech products, honest reviews, and exclusive deals for India and worldwide.",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    sameAs: [
      "https://www.youtube.com/@SillycornsMedia",
      "https://x.com/Sillycorns",
      "https://www.instagram.com/sillycorns.media",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["English", "Hindi"],
      areaServed: "IN",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sillycorns Shop India",
    alternateName: ["Sillycorn", "Sillycorns", "Sillycorns India"],
    url: "https://sillycorn.vercel.app",
    description:
      "Discover the best gadgets and tech products at Sillycorns Shop India. Updated hourly with trending tech, reviews, and exclusive deals from Sillycorn. Available in India and worldwide.",
    inLanguage: "en-IN",
    publisher: {
      "@id": "https://sillycorn.vercel.app/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://sillycorn.vercel.app?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    dateModified: latestPosts[0]?.createdAt || new Date().toISOString(),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://sillycorn.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Gadgets & Tech Products",
        item: "https://sillycorn.vercel.app",
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest Tech Products at Sillycorns India",
    description:
      "Trending gadgets and tech products from Sillycorns Shop India",
    numberOfItems: latestPosts.length,
    itemListElement: latestPosts.slice(0, 10).map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: post.title,
        image: `https://sillycorn.vercel.app${post.image}`,
        url: post.product_url,
        description: `${post.title} - Recommended by Sillycorns`,
        brand: {
          "@type": "Brand",
          name: "Sillycorns",
        },
        offers: {
          "@type": "Offer",
          url: post.product_url,
          availability: "https://schema.org/InStock",
          priceValidUntil: priceValidDate,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="min-h-screen bg-linear-to-br from-[#ffc820] via-[#ffb520] to-[#ffa020] relative overflow-hidden">
        {/* logo + search bar */}
        <div className="relative z-50 flex flex-col items-center justify-start gap-5 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="transform transition-all duration-500 hover:scale-105 w-full">
            <Image
              src="/logo_v3.png"
              alt="Silly Corns Logo"
              className="w-full h-auto object-contain drop-shadow-2xl"
              width={1061}
              height={185}
              priority
            />
          </div>
          <div className="w-full transform transition-all duration-300 hover:scale-[1.02]">
            <SearchBar />
          </div>
        </div>

        {/* Posts Feed */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <PostsFeed />
        </div>
      </div>
    </>
  );
}
