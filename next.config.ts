/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // Configurações básicas
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,

  // Experimental features
  experimental: {
    // App directory (já habilitado por padrão no Next.js 13+)
    appDir: true,

    // Server Components
    serverComponentsExternalPackages: [
      "@prisma/client",
      "bcryptjs",
      "jsonwebtoken",
    ],

    // Turbopack para desenvolvimento mais rápido (Next.js 13+)
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },

    // Otimizações de bundling
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "recharts",
      "date-fns",
      "lodash",
    ],

    // Configurações de edge runtime
    runtime: "nodejs",

    // Middleware config
    middlewareSource: "src/middleware",
  },

  // Configurações de imagens
  images: {
    // Domínios permitidos para imagens externas
    domains: [
      "images.integreapp.com",
      "storage.integreapp.com",
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com",
      "kokonutui.com",
    ],

    // Formatos otimizados
    formats: ["image/avif", "image/webp"],

    // Tamanhos de imagem para responsividade
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Configurações de otimização
    minimumCacheTTL: 31536000, // 1 ano
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configurações de headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Segurança básica
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // Permissions Policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },

      // Headers específicos para assets estáticos
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // Headers para Service Worker
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },

      // Headers para API routes
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },

  // Redirecionamentos
  async redirects() {
    return [
      // Redirecionar URLs antigas
      {
        source: "/dashboard",
        destination: "/dashboard/overview",
        permanent: true,
      },

      // Redirecionar para HTTPS em produção
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/:path*",
              has: [
                {
                  type: "header",
                  key: "x-forwarded-proto",
                  value: "http",
                },
              ],
              destination: "https://app.integreapp.com/:path*",
              permanent: true,
            },
          ]
        : []),
    ];
  },

  // Rewrites para roteamento interno
  async rewrites() {
    return [
      // Rewrite para API externa (se necessário)
      {
        source: "/api/external/:path*",
        destination: `${process.env.EXTERNAL_API_URL}/:path*`,
      },

      // Rewrite para arquivos estáticos do CDN
      {
        source: "/cdn/:path*",
        destination: `${process.env.NEXT_PUBLIC_CDN_URL}/:path*`,
      },
    ];
  },

  // Configurações de output para deployment
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,

  // Configurações de transpilação
  transpilePackages: [
    "@radix-ui/react-accordion",
    "@radix-ui/react-alert-dialog",
    "@radix-ui/react-avatar",
    "@radix-ui/react-checkbox",
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-label",
    "@radix-ui/react-popover",
    "@radix-ui/react-scroll-area",
    "@radix-ui/react-select",
    "@radix-ui/react-separator",
    "@radix-ui/react-slider",
    "@radix-ui/react-switch",
    "@radix-ui/react-tabs",
    "@radix-ui/react-toast",
    "@radix-ui/react-tooltip",
  ],

  // Configurações de webpack
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    // Otimizações de produção
    if (!dev) {
      // Minimizar bundle
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Configurar splitChunks
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,

          // Chunk para React e ReactDOM
          react: {
            name: "react",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
          },

          // Chunk para bibliotecas UI
          ui: {
            name: "ui",
            chunks: "all",
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|recharts)[\\/]/,
            priority: 30,
          },

          // Chunk para utilitários
          utils: {
            name: "utils",
            chunks: "all",
            test: /[\\/]node_modules[\\/](lodash|date-fns|clsx|class-variance-authority)[\\/]/,
            priority: 20,
          },

          // Chunk para vendor geral
          vendor: {
            name: "vendor",
            chunks: "all",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
        },
      };
    }

    // Configurar alias
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname, "src"),
    };

    // Configurar tratamento de SVG
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    // Ignorar packages específicos no client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Adicionar plugins de análise em desenvolvimento
    if (dev && process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Configurações de variáveis de ambiente
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Configurações de TypeScript
  typescript: {
    // Ignorar erros de tipo durante build (não recomendado para produção)
    ignoreBuildErrors: false,
  },

  // Configurações de ESLint
  eslint: {
    // Ignorar ESLint durante build (não recomendado para produção)
    ignoreDuringBuilds: false,

    // Diretórios para lint
    dirs: ["src", "pages", "components", "lib", "utils"],
  },

  // Configurações de logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // Configurações de compressão
  compress: true,

  // Configurações de trailing slash
  trailingSlash: false,

  // Configurações de geração de build ID
  generateBuildId: async () => {
    // Usar commit hash como build ID em produção
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      return process.env.VERCEL_GIT_COMMIT_SHA;
    }

    // Fallback para timestamp
    return `build-${Date.now()}`;
  },

  // Configurações de rewrites baseados no hostname
  async beforeFiles() {
    return [
      // Configurações específicas para subdomínios são tratadas no middleware
    ];
  },

  // Configurações de headers de CORS
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_APP_URL || "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

// Configuração do Sentry (se habilitado)
const sentryWebpackPluginOptions = {
  // Configurações adicionais do Sentry
  silent: true,
  hideSourceMaps: true,
  widenClientFileUpload: true,
};

// Exportar configuração final
module.exports = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
