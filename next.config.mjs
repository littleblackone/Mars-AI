/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.midjourneyapi.xyz" }],
  },
};

export default nextConfig;
