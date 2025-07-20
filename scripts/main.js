const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;

const API = 'https://parshop-miniapp.vercel.app/api/getUser';

fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegramUserId: telegramUser.id }),
})
.then(res => res.json())
.then(data => {
    const user = data.user;
    if (user) {
        document.querySelector('#username').textContent = user.username;
        document.querySelector('#invites').textContent = user.invites;
        document.querySelector('#points').textContent = user.points;
    } else {
        console.warn('Пользователь не найден');
    }
})
.catch(console.error);

fetch('https://parshop-miniapp.vercel.app/api/getLeaderboard')
    .then(res => res.json())
    .then(data => {
        const topList = document.querySelector('#top-users-list');

        topList.innerHTML = data.topUsers.map((user, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        return `
            <li class="top__item">
                ${medals[index] || ''} @${user.username} — ${user.invites} приглашений
            </li>
            `;
        }).join('');
    })
    .catch(console.error);
