import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

    const { telegramUser } = req.body

    if (!telegramUser?.id) {
        return res.status(400).json({ error: 'Invalid Telegram user data' })
    }

    const telegram_id = String(telegramUser.id)
    const username = telegramUser.username ?? null

    const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegram_id)
        .maybeSingle()

    if (fetchError) {
        console.error('❌ Ошибка поиска пользователя:', fetchError)
        return res.status(500).json({ error: fetchError.message })
    }

    if (existingUser) {
        return res.status(200).json({ user: existingUser })
    }

    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
        {
            telegram_id,
            username,
            invites: 0,
            points: 0,
        },
        ])
        .select()
        .single()

    if (insertError) {
        console.error('❌ Ошибка создания пользователя:', insertError)
        return res.status(500).json({ error: insertError.message })
    }

    return res.status(200).json({ user: newUser })
}
