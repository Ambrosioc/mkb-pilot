/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Next.js 15 specific configurations
  experimental: {
    // Enable new features if needed
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'recharts'
    ]
  },
  // Configuration pour les modules natifs
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclure ssh2-sftp-client du bundling côté serveur
      config.externals = config.externals || [];
      config.externals.push('ssh2-sftp-client', 'ssh2');
    }
    return config;
  }
};

module.exports = nextConfig;