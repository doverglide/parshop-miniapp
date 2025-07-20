const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;

const API = 'https://parshop-miniapp.vercel.app/api/register';

fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        telegramUserId: telegramUser.id,
        username: telegramUser.username
    }),
})
.then(res => res.json())
.then(data => {
    console.log('Пользователь зарегистрирован:', data.user);
})
.catch(console.error);