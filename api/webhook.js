import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const auth = req.headers['authorization']
  if (!auth || auth !== `Bearer ${process.env.PUZZLEBOT_WEBHOOK_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { userId, username } = req.body

  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        telegram_id: Number(userId),
        username: username ?? null,
      },
      { onConflict: ['telegram_id'] }
    )
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ success: true, user: data })
}
