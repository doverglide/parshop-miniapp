;(function () {
  const tg = window.Telegram.WebApp
  const user = tg.initDataUnsafe.user || {}
  const startParam = tg.initDataUnsafe.start_param || null
  const refCode = String(user.id)
  const botUsername = tg.initDataUnsafe.bot_username || 'Parshop_116bot'
  const appShort = 'Parcoin'
  const loader = document.getElementById('loader')
  const app = document.getElementById('app')

  function showToast(message, type = 'error') {
    let toast = document.getElementById('toast')
    if (!toast) {
      toast = document.createElement('div')
      toast.id = 'toast'
      toast.className = 'toast'
      document.body.appendChild(toast)
    }

    toast.textContent = message
    toast.className = `toast show ${type}`

    clearTimeout(toast._hideTimeout)
    toast._hideTimeout = setTimeout(() => {
      toast.classList.remove('show')
    }, 3000)
  }

  function hideLoaderAndShowApp() {
    console.log('Скрываем загрузку, показываем приложение')
    loader?.classList.add('hidden')
    app?.classList.remove('hidden')
  }

  // Проверка подписки
  fetch('https://parshop-miniapp.vercel.app/api/checkSubscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id: user.id }),
  })
    .then(res => res.json())
    .then(subscription => {
      if (!subscription?.is_subscribed) {
        showToast('Пожалуйста, подпишитесь на канал @parshop116', 'error')
        throw new Error('Пользователь не подписан')
      }

      // Пользователь подписан, синхронизируем
      return fetch('https://parshop-miniapp.vercel.app/api/syncUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: user.id,
          username: user.username,
          ref_code: startParam,
        }),
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Ошибка синхронизации пользователя')
      return res.json()
    })
    .then(data => {
      const u = data.user
      if (!u) throw new Error('Пользователь не найден')

      // Вставляем имя и аватар
      document.querySelector('#username-text').textContent = u.username || 'user'
      const photoUrl = user.photo_url || './images/default-avatar.png'
      const avatarEl = document.querySelector('#username-photo')
      avatarEl.src = photoUrl
      avatarEl.alt = u.username ? `Фото ${u.username}` : 'Фото пользователя'

      document.querySelector('#invites').textContent = u.invites || 0
      document.querySelector('#points').textContent = u.points || 0

      return fetch('https://parshop-miniapp.vercel.app/api/getLeaderboard')
    })
    .then(res => {
      if (!res.ok) throw new Error('Ошибка загрузки рейтинга')
      return res.json()
    })
    .then(data => {
      if (!data) return
      const topUsers = data.topUsers || []
      const topList = document.querySelector('#top-users-list')
      const medals = ['🥇', '🥈', '🥉']

      topList.innerHTML = topUsers
        .slice(0, 3)
        .map(
          (u, i) => `
          <li class="top__item">
            ${medals[i] || ''} @${u.username || '–––'} — ${u.invites} приглашений
          </li>
        `
        )
        .join('')

      const myIndex = topUsers.findIndex(
        (u) => String(u.telegram_id) === String(user.id)
      )
      const place = myIndex >= 0 ? myIndex + 1 : '—'
      document.querySelector('#my-place').textContent = `Ваше место в топе: ${place}`
    })
    .catch(err => {
      console.error(err)
      if (!err.message.includes('не подписан')) {
        showToast('Произошла ошибка при загрузке данных')
      }
    })
    .finally(() => {
      const inviteBtn = document.querySelector('.invites__btn')
      if (!refCode) {
        inviteBtn.textContent = 'Ссылка недоступна'
        inviteBtn.disabled = true
      } else {
        const deepLink = `https://t.me/${botUsername}/${appShort}?startapp=${refCode}`
        inviteBtn.addEventListener('click', () => {
          navigator.clipboard
            .writeText(deepLink)
            .then(() => showToast('Ссылка скопирована!', 'success'))
            .catch(() => showToast('Не удалось скопировать ссылку'))
        })
      }

      hideLoaderAndShowApp()
    })
})()
