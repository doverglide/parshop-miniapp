import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { telegramUserId } = req.body

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramUserId)
    .maybeSingle()

  if (error) {
    console.error('Supabase fetch error:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ user: data })
}
