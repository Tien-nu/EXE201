import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { ExecArgs } from '@medusajs/framework/types'

export default async function dbCheck({ container }: ExecArgs) {
  const db = container.resolve("pgConnection")
  const res = await db.raw("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
  const tables = res.rows.map(r => r.table_name).filter(t => t.includes('store') || t.includes('currency') || t.includes('region'))
  console.log(tables)
}
