import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = '@parshop116';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { telegram_id, username, ref_code } = req.body;
  if (!telegram_id) {
    return res.status(400).json({ error: 'telegram_id is required' });
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_ID}&user_id=${telegram_id}`;
    const response = await fetch(url);
    const json = await response.json();
    if (!json.ok) {
      console.error('Telegram API error:', json);
      return res.status(500).json({ error: 'Telegram API error' });
    }
    const status = json.result.status;
    if (status === 'left' || status === 'kicked') {
      return res.status(403).json({ error: 'Подпишись на @parshop116 чтобы пользоваться ботом' });
    }
  } catch (err) {
    console.error('Subscription check error:', err);
    return res.status(500).json({ error: 'Subscription check error' });
  }

  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('invites, points, username, telegram_id, invited_by')
    .eq('telegram_id', String(telegram_id))
    .maybeSingle();
  if (fetchError) {
    console.error('Fetch user error:', fetchError);
    return res.status(500).json({ error: fetchError.message });
  }

  let user = existingUser;
  if (!existingUser) {
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
      .single();
    if (insertError) {
      console.error('Create user error:', insertError);
      return res.status(500).json({ error: insertError.message });
    }
    user = newUser;
    if (ref_code && String(ref_code) !== String(telegram_id)) {
      const { data: refUser, error: refFetchError } = await supabase
        .from('users')
        .select('invites')
        .eq('telegram_id', String(ref_code))
        .maybeSingle();
      if (!refFetchError && refUser) {
        const newInvites = (refUser.invites || 0) + 1;
        await supabase
          .from('users')
          .update({ invites: newInvites })
          .eq('telegram_id', String(ref_code));
      }
    }
  }

  return res.status(200).json({ user });
}