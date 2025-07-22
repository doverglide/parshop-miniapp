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
  const chatId = Number(message.chat.id)

  if (text.startsWith('/start')) {
    const parts = text.split(' ')
    const refCode = parts[1] || null
    const referrerId = Number(refCode)

    if (!referrerId) {
      return res.status(200).send('ok') // Нет кода — ничего не делаем
    }

    try {
      // Проверяем, есть ли приглашаемый в users
      const { data: invitedUser, error: invitedErr } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('telegram_id', chatId)
        .single()

      if (invitedErr && invitedErr.code !== 'PGRST116') {
        console.error('Ошибка проверки пользователя:', invitedErr)
        return res.status(500).send('Ошибка БД')
      }

      if (!invitedUser) {
        // Создаем приглашаемого пользователя
        const { error: insertErr } = await supabase.from('users').insert({
          telegram_id: chatId,
          invites: 0,
          points: 0,
        })

        if (insertErr) {
          console.error('Ошибка вставки пользователя:', insertErr)
          return res.status(500).send('Ошибка БД')
        }

        // Увеличиваем invites у реферера
        const { data: referrer, error: refErr } = await supabase
          .from('users')
          .select('invites')
          .eq('telegram_id', referrerId)
          .single()

        if (refErr) {
          console.error('Реферер не найден или ошибка:', refErr)
          return res.status(200).send('ok') // Не прерываем ошибкой
        }

        const newInvites = (referrer.invites ?? 0) + 1

        const { error: updateErr } = await supabase
          .from('users')
          .update({ invites: newInvites })
          .eq('telegram_id', referrerId)

        if (updateErr) {
          console.error('Ошибка обновления invites:', updateErr)
        } else {
          console.log(`Referrer ${referrerId} invites увеличены до ${newInvites}`)
        }
      } else {
        console.log(`Пользователь ${chatId} уже существует`)
      }

      return res.status(200).send('ok')
    } catch (e) {
      console.error('Неожиданная ошибка:', e)
      return res.status(500).send('Серверная ошибка')
    }
  } else {
    return res.status(200).send('ok')
  }
}
