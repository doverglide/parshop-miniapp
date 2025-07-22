;(function () {
  console.log('🔥 main.js загружен');
  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe.user || {};
  const startParam = tg.initDataUnsafe.start_param || null;
  const refCode = String(user.id);
  const botUsername = tg.initDataUnsafe.bot_username || 'Parshop_116bot';
  const appShort = 'Parcoin';

  const loader = document.getElementById('loader');
  const app = document.getElementById('app');

  function showToast(message, type = 'error') {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    clearTimeout(toast._hideTimeout);
    toast._hideTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function hideLoaderAndShowApp() {
    console.log('✅ hideLoaderAndShowApp вызвана');
    loader.classList.add('hidden');
    app.classList.remove('hidden');
  }

  // 1) syncUser
  fetch('/api/syncUser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_id: user.id,
      username: user.username,
      ref_code: startParam,
    }),
  })
    .then(res => {
      if (!res.ok) {
        if (res.status === 403) {
          showToast('Пожалуйста, подпишитесь на канал @parshop116', 'error');
        } else {
          showToast('Ошибка синхронизации пользователя', 'error');
        }
        throw new Error(`syncUser status ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      const u = data.user;
      if (!u) {
        showToast('Пользователь не найден', 'error');
        throw new Error('No user in response');
      }

      document.querySelector('#username-text').textContent = u.username || 'user';
      const photoUrl = user.photo_url || '/images/default-avatar.png';
      const avatarEl = document.querySelector('#username-photo');
      avatarEl.src = photoUrl;
      avatarEl.alt = u.username ? `Фото ${u.username}` : 'Фото пользователя';

      document.querySelector('#invites').textContent = u.invites || 0;
      document.querySelector('#points').textContent = u.points || 0;
    })
    // 2) getLeaderboard
    .then(() => fetch('/api/getLeaderboard'))
    .then(res => {
      if (!res.ok) {
        showToast('Ошибка загрузки рейтинга', 'error');
        throw new Error(`getLeaderboard status ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      const topUsers = data.topUsers || [];
      const topList = document.querySelector('#top-users-list');
      const medals = ['🥇', '🥈', '🥉'];

      topList.innerHTML = topUsers.slice(0, 3).map((u, i) => `
        <li class="top__item">
          ${medals[i] || ''} @${u.username || '–––'} — ${u.invites} приглашений
        </li>
      `).join('');

      const myIndex = topUsers.findIndex(u => String(u.telegram_id) === String(user.id));
      const place = myIndex >= 0 ? myIndex + 1 : '—';
      document.querySelector('#my-place').textContent = `Ваше место в топе: ${place}`;
    })
    // 3) общая обработка ошибок
    .catch(err => {
      console.error(err);
      // все нужные toasts уже показаны выше
    })
    // 4) скрываем лоадер в любом случае
    .finally(() => {
      // кнопка приглашения
      const inviteBtn = document.querySelector('.invites__btn');
      if (!refCode) {
        inviteBtn.textContent = 'Ссылка недоступна';
        inviteBtn.disabled = true;
      } else {
        const deepLink = `https://t.me/${botUsername}/${appShort}?startapp=${refCode}`;
        inviteBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(deepLink)
            .then(() => showToast('Ссылка скопирована!', 'success'))
            .catch(() => showToast('Не удалось скопировать ссылку', 'error'));
        });
      }

      hideLoaderAndShowApp();
    });
})();
