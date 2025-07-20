import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { telegramUserId, username } = req.body

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        { telegram_id: telegramUserId, username },
        { onConflict: ['telegram_id'] }
      )
      .select()
      .single()

    if (error) {
      console.error('Supabase upsert error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ user: data })
  } catch (e) {
    console.error('Handler error:', e)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
