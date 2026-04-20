export type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

import { supabase } from './supabase'

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:3000/v1'

export function getApiBase(): string {
  return API_BASE
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`

  const headers = new Headers(options.headers)
  if (options.body !== undefined) headers.set('content-type', 'application/json')

  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${token}`)
    }
  } catch (_) {
    // ignore
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
