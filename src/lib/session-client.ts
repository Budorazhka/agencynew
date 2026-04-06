import type { Client } from '@/types/clients'

const KEY = (id: string) => `agency.client.${id}`

export function persistSessionClient(client: Client): void {
  try {
    sessionStorage.setItem(KEY(client.id), JSON.stringify(client))
  } catch {
    // нет места или приватный режим — просто не сохраняем
  }
}

export function readSessionClient(id: string | undefined): Client | undefined {
  if (!id) return undefined
  try {
    const raw = sessionStorage.getItem(KEY(id))
    return raw ? (JSON.parse(raw) as Client) : undefined
  } catch {
    return undefined
  }
}
