const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;

if (!telegramUser?.id) {
  console.error('Telegram user data not found');
} else {
  fetch('https://parshop-miniapp.vercel.app/api/syncUser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegramUser }),
  })
    .then(res => res.json())
    .then(data => {
      const user = data.user;
      if (user) {
        document.querySelector('#username').textContent = user.username ?? 'user';
        document.querySelector('#invites').textContent = user.invites ?? 0;
        document.querySelector('#points').textContent = user.points ?? 0;

        // После успешного syncUser — получаем полный список
        return fetch('https://parshop-miniapp.vercel.app/api/getLeaderboard');
      } else {
        console.warn('Пользователь не найден');
        return null;
      }
    })
    .then(res => res?.json?.())
    .then(data => {
      if (!data) return;

      const topUsers = data.topUsers;
      const topList = document.querySelector('#top-users-list');
      const medals = ['🥇', '🥈', '🥉'];

      // Отображаем только топ-3
      topList.innerHTML = topUsers
        .slice(0, 3)
        .map((u, idx) => `
          <li class="top__item">
            ${medals[idx] || ''} @${u.username ?? 'аноним'} — ${u.invites} приглашений
          </li>
        `)
        .join('');

      // Ищем место текущего пользователя в полном списке
      const myIndex = topUsers.findIndex(
        u => String(u.telegram_id) === String(telegramUser.id)
      );
      const myPlace = myIndex !== -1 ? myIndex + 1 : '—';

      document.querySelector('#my-place').textContent =
        `Ваше место в топе: ${myPlace}`;
    })
    .catch(console.error);
}
