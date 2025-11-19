import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for better Core Web Vitals
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Compression and performance headers
  compress: true,

  // Sitemap and robots generation
  staticPageGenerationTimeout: 120,

  // SEO optimizations
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Cache control for static assets
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/dashboard/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  // redirects: async () => {
  //   return [
  //     // Redirect www to non-www
  //     {
  //       source: "/:path*",
  //       has: [
  //         {
  //           type: "host",
  //           value: "www.sillycorns.com",
  //         },
  //       ],
  //       destination: "https://sillycorns.com/:path*",
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
