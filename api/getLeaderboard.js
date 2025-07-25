import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { data, error } = await supabase
    .from('users')
    .select('telegram_id, username, invites')
    .order('invites', { ascending: false }); // возвращаем всех, без .limit

  if (error) {
    console.error('Supabase leaderboard error:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ topUsers: data });
}
