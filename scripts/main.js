fetch('./api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        telegramUserId: window.Telegram.WebApp.initDataUnsafe.user.id,
        username: window.Telegram.WebApp.initDataUnsafe.user.username
    })
})
.then(res => res.json())
.then(data => {
    console.log('Пользователь зарегистрирован:', data.user);
})
.catch(console.error);