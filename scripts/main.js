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
