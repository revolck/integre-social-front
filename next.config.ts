// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuração de domínios e subdomínios
  async rewrites() {
    return [
      // Mapeia o subdomínio app para a pasta dashboard
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "app.localhost:3000",
          },
        ],
        destination: "/dashboard/:path*",
      },
      // Mapeia a raiz do subdomínio app para a página principal do dashboard
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "app.localhost:3000",
          },
        ],
        destination: "/dashboard/analytics",
      },
      // Mapeia a raiz do subdomínio auth para a página de login
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "auth.localhost:3000",
          },
        ],
        destination: "/auth/login",
      },
    ];
  },
};

module.exports = nextConfig;
