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

export default async function handler(req, res) {
  console.log('🌐 Webhook fired, method:', req.method)
  console.log('📥 Headers:', req.headers)
  console.log('📦 Body:', JSON.stringify(req.body, null, 2))

  if (req.method !== 'POST') return res.status(405).end()

  const auth = req.headers['authorization']
  if (!auth || auth !== `Bearer ${process.env.PUZZLEBOT_WEBHOOK_TOKEN}`) {
    return res.status(401).end()
  }

  const tgUser = req.body.user || req.body.message?.from

  if (!tgUser?.id) {
    console.warn('⚠️ Не нашли user.id в теле запроса')
    return res.status(400).end()
  }

  const { data, error } = await supabase
    .from('users')
    .upsert({
      telegram_id: Number(tgUser.id),
      username: tgUser.username ?? null,
    }, { onConflict: ['telegram_id'] })
    .select()
    .single()

  if (error) {
    console.error('❌ Supabase error:', error)
    return res.status(500).end()
  }

  console.log('✅ Пользователь записан:', data)
  res.status(200).json({ success: true })
}
