import { cookies } from "next/headers"

export async function serverFetch(input: RequestInfo, init?: RequestInit) {
  const cookieStore = await cookies()
  const headers = new Headers(init?.headers || {})
  headers.set("Cookie", cookieStore.toString())

  const newInit = {
    ...init,
    headers,
  }

  return fetch(input, newInit)
}
