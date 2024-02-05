/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.midjourneyapi.xyz" },
      { protocol: "https", hostname: "cdn.midjourney.com" },
    ],
  },
};

export default nextConfig;
