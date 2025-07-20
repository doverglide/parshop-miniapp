import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    const { telegramUserId, username } = req.body

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
}
