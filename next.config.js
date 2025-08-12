/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration mobile-optimized pour le MVP
  reactStrictMode: true,
  
  // Headers de sécurité basiques + ngrok bypass
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self)',
          },
          {
            key: 'ngrok-skip-browser-warning',
            value: 'true',
          },
        ],
      },
    ];
  },

  // Configuration webpack pour OpenAI et les médias
  webpack: (config, { isServer }) => {
    // Configuration spéciale pour le package OpenAI
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }

    // Exclure le package OpenAI du bundling côté serveur si problématique
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('openai');
    }

    // Support pour les fichiers WASM si nécessaire
    config.module.rules.push({
      test: /\.(wasm)$/,
      type: 'asset/resource',
    });

    // Configuration pour éviter les erreurs de modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'openai': require.resolve('openai'),
    };

    return config;
  },

  // Configuration pour les imports externes
  experimental: {
    esmExternals: false,
  },

  // Configuration TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuration ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;