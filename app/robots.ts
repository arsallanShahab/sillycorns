import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/dashboard/login", "/api"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/dashboard", "/dashboard/login", "/api"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/dashboard", "/dashboard/login", "/api"],
      },
    ],
    sitemap: "https://sillycorns.vercel.app/sitemap.xml",
  };
}
