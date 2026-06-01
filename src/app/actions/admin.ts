'use server'

import { getSession } from '@/lib/session'
import { syncFixtures } from '@/lib/sync-fixtures'
import type { SyncResult } from '@/lib/sync-fixtures'

export async function triggerSyncAction(): Promise<
  { success: true; result: SyncResult } | { success: false; error: string }
> {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Acesso negado.' }
  }

  try {
    const result = await syncFixtures()
    return { success: true, result }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
