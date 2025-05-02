/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuração simples e direta de domínios e subdomínios
  async rewrites() {
    return [
      // Subdomínio auth - solução robusta e testada
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "auth.localhost:3000",
          },
        ],
        destination: "/auth/login",
      },

      // Subdomínio app - tudo vai para dashboard
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

      // Rotas específicas do app
      {
        source: "/analytics",
        has: [
          {
            type: "host",
            value: "app.localhost:3000",
          },
        ],
        destination: "/dashboard/analytics",
      },

      // Outras rotas específicas (adicione mais conforme necessário)
      {
        source: "/users",
        has: [
          {
            type: "host",
            value: "app.localhost:3000",
          },
        ],
        destination: "/dashboard/users",
      },

      {
        source: "/settings",
        has: [
          {
            type: "host",
            value: "app.localhost:3000",
          },
        ],
        destination: "/dashboard/settings",
      },
    ];
  },
};

module.exports = nextConfig;
