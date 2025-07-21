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
        } else {
        console.warn('Пользователь не найден');
        }
    })
    .catch(console.error);
}

// Получаем топ и определяем место
fetch('https://parshop-miniapp.vercel.app/api/getLeaderboard')
    .then(res => res.json())
    .then(data => {
        const topUsers = data.topUsers;
        const topList = document.querySelector('#top-users-list');

        const medals = ['🥇', '🥈', '🥉'];
        topList.innerHTML = topUsers.map((user, index) => {
            return `
                <li class="top__item">
                    ${medals[index] || ''} @${user.username} — ${user.invites} приглашений
                </li>
            `;
        }).join('');

        const myIndex = topUsers.findIndex(u => Number(u.telegram_id) === Number(telegramUser.id));
        const myPlace = myIndex !== -1 ? myIndex + 1 : '—';
        
        document.querySelector('#my-place').textContent = `Ваше место в топе: ${myPlace}`;
    })
    .catch(console.error);
