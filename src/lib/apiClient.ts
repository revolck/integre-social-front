import { parseCookies } from 'nookies'

export async function apiClient(url: string, options: RequestInit = {}) {
  const cookies = parseCookies()
  const tenantId = cookies['tenant_selection']

  const headers = new Headers(options.headers)
  if (tenantId) {
    headers.set('X-Tenant-ID', tenantId)
  }

  return fetch(url, { ...options, headers })
}
