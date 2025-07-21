export const config = {
  api: {
    bodyParser: true,
  },
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

function findNumberFields(obj, path = '') {
  if (typeof obj !== 'object' || obj === null) return []

  let results = []

  for (const key in obj) {
    const value = obj[key]
    const currentPath = path ? `${path}.${key}` : key

    if (typeof value === 'number') {
      results.push({ path: currentPath, value })
    } else if (typeof value === 'object') {
      results = results.concat(findNumberFields(value, currentPath))
    }
  }

  return results
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const auth = req.headers['authorization']
  if (!auth || auth !== `Bearer ${process.env.BOT_TOKEN}`) {
    return res.status(401).end()
  }

  console.log('🌐 Webhook received, full body:\n', JSON.stringify(req.body, null, 2))

  const numberFields = findNumberFields(req.body)
  console.log('🔎 Numeric fields found in webhook body:', numberFields)

  // Можно здесь добавить логику обновления в БД, когда определишь нужное поле

  // Просто отвечаем 200 OK
  res.status(200).json({ success: true })
}
