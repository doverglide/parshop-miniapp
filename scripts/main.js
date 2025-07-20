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
        console.log('Пользователь найден:', user);
        document.querySelector('#username').textContent = user.username;
        // другие данные можешь так же выводить
    } else {
        console.warn('Пользователь не найден');
    }
})
.catch(console.error);
