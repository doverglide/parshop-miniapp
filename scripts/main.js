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

            // Получаем топ после синка
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

        // 🔥 отображаем только топ-3
        topList.innerHTML = topUsers.slice(0, 3).map((user, index) => {
            return `
                <li class="top__item">
                    ${medals[index] || ''} @${user.username} — ${user.invites} приглашений
                </li>
            `;
        }).join('');

        // 🔥 ищем текущее место
        const myIndex = topUsers.findIndex(u => Number(u.telegram_id) === Number(telegramUser.id));
        const myPlace = myIndex !== -1 ? myIndex + 1 : '—';

        document.querySelector('#my-place').textContent = `Ваше место в топе: ${myPlace}`;
    })
    .catch(console.error);
}
