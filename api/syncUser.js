import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const BOT_TOKEN = process.env.BOT_TOKEN
const CHANNEL_ID = '@parshop116'  // Твой канал

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { telegram_id, username, ref_code } = req.body

  if (!telegram_id) {
    return res.status(400).json({ error: 'telegram_id is required' })
  }

  // Проверяем подписку пользователя на канал
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_ID}&user_id=${telegram_id}`
    const response = await fetch(url)
    const json = await response.json()

    if (!json.ok) {
      console.error('Ошибка Telegram API:', json)
      return res.status(500).json({ error: 'Telegram API error' })
    }

    const status = json.result.status
    if (status === 'left' || status === 'kicked') {
      return res.status(403).json({ error: 'Подпишись на @parshop116 чтобы пользоваться ботом' })
    }
  } catch (err) {
    console.error('Ошибка проверки подписки:', err)
    return res.status(500).json({ error: 'Ошибка проверки подписки' })
  }

  // Проверяем, существует ли пользователь в базе
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('invites, points, username, telegram_id, invited_by')
    .eq('telegram_id', String(telegram_id))
    .maybeSingle()

  if (fetchError) {
    console.error('Ошибка поиска пользователя:', fetchError)
    return res.status(500).json({ error: fetchError.message })
  }

  let user = existingUser

  if (!existingUser) {
    // Создаем нового пользователя
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        telegram_id: String(telegram_id),
        username: username || null,
        invites: 0,
        points: 0,
        invited_by: (ref_code && String(ref_code) !== String(telegram_id)) ? String(ref_code) : null,
      })
      .select('invites, points, username, telegram_id, invited_by')
      .single()

    if (insertError) {
      console.error('Ошибка создания пользователя:', insertError)
      return res.status(500).json({ error: insertError.message })
    }

    user = newUser

    // Увеличиваем invites пригласившего
    if (ref_code && String(ref_code) !== String(telegram_id)) {
      const refId = String(ref_code)
      const { data: refUser, error: refFetchError } = await supabase
        .from('users')
        .select('invites')
        .eq('telegram_id', refId)
        .maybeSingle()

      if (refFetchError) {
        console.error('Ошибка поиска реферера:', refFetchError)
      } else if (refUser) {
        const newInvites = (refUser.invites || 0) + 1
        const { error: updateErr } = await supabase
          .from('users')
          .update({ invites: newInvites })
          .eq('telegram_id', refId)
        if (updateErr) {
          console.error('Ошибка обновления invites:', updateErr)
        } else {
          console.log(`Invites у ${refId} обновлены до ${newInvites}`)
        }
      }
    }
  }

  return res.status(200).json({ user })
}
