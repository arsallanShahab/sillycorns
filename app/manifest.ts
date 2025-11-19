import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sillycorns - Best Gadgets & Tech Products",
    short_name: "Sillycorns",
    description:
      "Discover the best gadgets and tech products with curated reviews and recommendations from Sillycorns",
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
        type: "image/png",
        form_factor: "wide",
      },
    ],
    categories: ["shopping", "technology"],
    orientation: "portrait-primary",
  };
}
