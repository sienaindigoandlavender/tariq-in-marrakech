/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // Kits and baby gear now live inside Concierge.
    return [{ source: "/c/kit", destination: "/c/svc", permanent: true }];
  },
};

export default nextConfig;
