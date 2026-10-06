import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Square serves catalog imagery from its own CDN and an S3 bucket.
    remotePatterns: [
      { protocol: "https", hostname: "items-images-production.s3.us-west-2.amazonaws.com" },
      { protocol: "https", hostname: "items-images-sandbox.s3.us-west-2.amazonaws.com" },
      { protocol: "https", hostname: "square-catalog-production.s3.amazonaws.com" },
      { protocol: "https", hostname: "square-catalog-sandbox.s3.amazonaws.com" },
      { protocol: "https", hostname: "**.squarecdn.com" },
      { protocol: "https", hostname: "**.squareup.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // The two pages were renamed after the first build. Anything already
    // shared or indexed under the old names lands in the right place.
    return [
      { source: "/commission", destination: "/custom-order", permanent: true },
      { source: "/atelier", destination: "/meet-the-maker", permanent: true },
      { source: "/api/commission", destination: "/api/custom-order", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            // payment is required for Apple Pay / Google Pay via the Web Payments SDK.
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
