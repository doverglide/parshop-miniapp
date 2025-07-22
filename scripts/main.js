;(function() {
  const tg = window.Telegram.WebApp
  const user = tg.initDataUnsafe.user || {}
  const startParam = tg.initDataUnsafe.start_param || null // <- рефкод, если пришли по ссылке
  const refCode = String(user.id) // <- используется только для генерации своей ссылки
  const botUsername = tg.initDataUnsafe.bot_username || 'Parshop_116bot'
  const appShort = 'Parcoin'  // short_name вашего Mini App

  // Синхронизируем пользователя
  fetch('https://parshop-miniapp.vercel.app/api/syncUser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_id: user.id,
      username: user.username,
      ref_code: startParam // <- только если реально кто-то пригласил
    })
  })
    .then(res => res.json())
    .then(data => {
      const u = data.user
      if (!u) {
        console.warn('Пользователь не найден или ошибка на сервере')
        return
      }

      // Заполняем профиль
      document.querySelector('#username').textContent = u.username || 'user'
      document.querySelector('#invites').textContent = u.invites || 0
      document.querySelector('#points').textContent = u.points || 0

      // Получаем ТОП-список
      return fetch('https://parshop-miniapp.vercel.app/api/getLeaderboard')
    })
    .then(res => res && res.json())
    .then(data => {
      if (!data) return
      const topUsers = data.topUsers || []
      const topList = document.querySelector('#top-users-list')
      const medals = ['🥇', '🥈', '🥉']

      // ТОП-3
      topList.innerHTML = topUsers
        .slice(0, 3)
        .map((u, i) => `
          <li class="top__item">
            ${medals[i] || ''} @${u.username || '–––'} — ${u.invites} приглашений
          </li>
        `)
        .join('')

      // Ваше место
      const myIndex = topUsers.findIndex(
        u => String(u.telegram_id) === String(user.id)
      )
      const place = myIndex >= 0 ? myIndex + 1 : '—'
      document.querySelector('#my-place').textContent = `Ваше место в топе: ${place}`
    })
    .catch(console.error)
    .finally(() => {
      // Настраиваем кнопку «Пригласить друга»
      const inviteBtn = document.querySelector('.invites__btn')
      if (!refCode) {
        inviteBtn.textContent = 'Ссылка недоступна'
        inviteBtn.disabled = true
        return
      }
      const deepLink = `https://t.me/${botUsername}/${appShort}?startapp=${refCode}`
      inviteBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(deepLink)
          .then(() => alert('Ссылка скопирована!'))
          .catch(() => alert('Не удалось скопировать ссылку'))
      })
    })
})()
