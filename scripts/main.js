const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;

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
