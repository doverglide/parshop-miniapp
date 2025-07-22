;(function () {
  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe.user || {};
  const startParam = tg.initDataUnsafe.start_param || null;
  const refCode = String(user.id);
  const botUsername = tg.initDataUnsafe.bot_username || 'Parshop_116bot';
  const appShort = 'Parcoin';

  const loader = document.getElementById('loader');
  const app = document.getElementById('app');

  // Скрываем app до загрузки данных
  if (app) {
    app.style.opacity = '0';
    app.style.display = 'none';
  }

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

  function showAppWithFade() {
    if (loader) loader.style.display = 'none';
    if (app) {
      app.style.display = '';
      app.style.transition = 'opacity 0.5s ease-in';
      // Триггерим перерисовку
      requestAnimationFrame(() => {
        app.style.opacity = '1';
      });
    }
  }

  async function init() {
    try {
      // 1) syncUser
      const syncRes = await fetch('/api/syncUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: user.id,
          username: user.username,
          ref_code: startParam,
        }),
      });
      if (!syncRes.ok) {
        if (syncRes.status === 403) showToast('Пожалуйста, подпишитесь на канал @parshop116', 'error');
        else showToast('Ошибка синхронизации пользователя', 'error');
        return;
      }
      const syncData = await syncRes.json();
      const u = syncData.user;
      if (!u) {
        showToast('Пользователь не найден', 'error');
        return;
      }
      document.querySelector('#username-text').textContent = u.username || 'user';
      const photoUrl = user.photo_url || '/images/default-avatar.png';
      const avatarEl = document.querySelector('#username-photo');
      avatarEl.src = photoUrl;
      avatarEl.alt = u.username ? `Фото ${u.username}` : 'Фото пользователя';
      document.querySelector('#invites').textContent = u.invites || 0;
      document.querySelector('#points').textContent = u.points || 0;

      // 2) getLeaderboard
      const lbRes = await fetch('/api/getLeaderboard');
      if (!lbRes.ok) {
        showToast('Ошибка загрузки рейтинга', 'error');
        return;
      }
      const lbData = await lbRes.json();
      const topUsers = lbData.topUsers || [];
      const topList = document.querySelector('#top-users-list');
      const medals = ['🥇', '🥈', '🥉'];
      topList.innerHTML = topUsers.slice(0, 3).map((u, i) => `
        <li class="top__item">
          ${medals[i] || ''} @${u.username || '–––'} — ${u.invites} приглашений
        </li>
      `).join('');
      const myIndex = topUsers.findIndex(u => String(u.telegram_id) === refCode);
      const place = myIndex >= 0 ? myIndex + 1 : '—';
      document.querySelector('#my-place').textContent = `Ваше место в топе: ${place}`;

      // приглашение
      const inviteBtn = document.querySelector('.invites__btn');
      if (inviteBtn) {
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
      }
    } catch (err) {
      console.error(err);
      showToast('Произошла ошибка при загрузке данных', 'error');
    } finally {
      showAppWithFade();
    }
  }

  init();
})();
