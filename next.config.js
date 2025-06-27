/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Next.js 15 specific configurations
  experimental: {
    // Enable new features if needed
    serverExternalPackages: [],
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'recharts'
    ]
  }
};

module.exports = nextConfig;