import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sillycorns Shop India - Best Gadgets & Tech Products",
    short_name: "Sillycorns",
    description:
      "Sillycorns Shop India - Your destination for the best tech gadgets, product reviews, and exclusive deals in India. Shop Sillycorn for trending tech products updated hourly! Available worldwide.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffc820",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    screenshots: [
      {
        src: "/og-image.jpeg",
        sizes: "1200x630",
        type: "image/jpeg",
        form_factor: "wide",
      },
    ],
    categories: ["shopping", "technology", "lifestyle", "entertainment"],
    orientation: "portrait-primary",
    lang: "en-US",
    dir: "ltr",
    scope: "/",
    id: "sillycorns-shop",
  };
}
