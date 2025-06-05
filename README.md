This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install the dependencies and create your local environment file:

```bash
pnpm install
cp .env.example .env
```

Edit `.env` to configure values such as `NEXT_PUBLIC_API_BASE_URL` which defines
the backend API endpoint.

Run the linter to catch common issues:

```bash
pnpm lint
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates
as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Tenant-aware API Requests

Outgoing requests made with the custom `apiClient` automatically include the tenant identifier.
The value is read from the `tenant_selection` cookie using `nookies` and attached as the `X-Tenant-ID` header if present.

## API Client & Role-based Guards

Use the Axios-based `apiClient` in `src/services/api/client.ts` for all backend
requests. It reads `NEXT_PUBLIC_API_BASE_URL` from your environment file and
automatically attaches authentication tokens.

Page access can be restricted using the `ProtectedRoute` component or the
`withAuth` higher-order component located in `src/components/auth`. The dashboard
middleware (`src/app/dashboard/middleware.ts`) also enforces role permissions on
server-side routes.
