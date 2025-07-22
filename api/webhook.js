import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const update = req.body
  const message = update.message

  if (!message || !message.text) {
    return res.status(200).send('ok')
  }

  const text = message.text.trim()
  const chatId = message.chat.id

  if (text.startsWith('/start')) {
    const parts = text.split(' ')
    const refCode = parts[1] || null

    if (refCode) {
      const { error } = await supabase.from('referrals').insert({
        invited_telegram_id: chatId,
        referrer_code: refCode,
        invited_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Supabase error:', error)
        return res.status(500).send('Error saving referral')
      }

      console.log(`User ${chatId} invited by code ${refCode}`)
    }
  }

  res.status(200).send('ok')
}
