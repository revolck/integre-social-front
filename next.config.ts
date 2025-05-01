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
    ];
  },
};

module.exports = nextConfig;
