export default function HeadSEO() {
  return (
    <>
      {/* Additional SEO meta tags */}
      <meta name="application-name" content="Sillycorns Shop" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Sillycorns" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#ffc820" />

      {/* Search Engine Crawl Hints */}
      <meta name="revisit-after" content="1 hour" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="coverage" content="Worldwide" />

      {/* Brand Keywords */}
      <meta
        name="keywords"
        content="sillycorns, sillycorn, sillycorns shop, silly corns, sillycorn shop, sillycorns gadgets, sillycorn reviews, tech products, gadgets, amazon products, viral tech"
      />

      {/* Open Graph Additional */}
      <meta property="og:site_name" content="Sillycorns Shop" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Additional */}
      <meta name="twitter:site" content="@Sillycorns" />
      <meta name="twitter:domain" content="sillycorn.vercel.app" />

      {/* Geo Tags for Local SEO - India Primary Market */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="geo.position" content="20.5937;78.9629" />
      <meta name="ICBM" content="20.5937, 78.9629" />

      {/* Alternative Names */}
      <link rel="canonical" href="https://sillycorn.vercel.app" />
      <link rel="alternate" hrefLang="en" href="https://sillycorn.vercel.app" />

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://x.com" />
      <link rel="preconnect" href="https://www.instagram.com" />
      <link rel="dns-prefetch" href="https://www.youtube.com" />
      <link rel="dns-prefetch" href="https://x.com" />
      <link rel="dns-prefetch" href="https://www.instagram.com" />
    </>
  );
}
