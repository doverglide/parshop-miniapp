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
  if (req.method !== 'POST') return res.status(405).end()

  const auth = req.headers['authorization']
  if (!auth || auth !== `Bearer ${process.env.BOT_TOKEN}`) {
    return res.status(401).end()
  }

  console.log('🌐 Webhook received, full body:\n', JSON.stringify(req.body, null, 2))

  const webhookData = req.body

  const { data, error } = await supabase
    .from('webhook_logs')
    .insert([{
      update_id: webhookData.update_id,
      payload: webhookData,
      received_at: new Date().toISOString(),
    }])

  if (error) {
    console.error('❌ Supabase insert error:', error)
    return res.status(500).json({ error: 'DB insert failed' })
  }

  res.status(200).json({ success: true })
}
