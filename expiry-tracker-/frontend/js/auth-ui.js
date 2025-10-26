// frontend/js/auth-ui.js
(function () {
  const guestOnly = document.querySelectorAll('.nav-guest-only');
  const authOnly  = document.querySelectorAll('.nav-auth-only');

  const userInfo = document.getElementById('userInfo');

  function showGuest() {
    guestOnly.forEach(el => el.style.display = '');
    authOnly.forEach(el => el.style.display = 'none');
  }
  function showAuth() {
    guestOnly.forEach(el => el.style.display = 'none');
    authOnly.forEach(el => el.style.display = '');
  }

  // Token stocké (ex: après login)
  const token = localStorage.getItem('jwt');

  // Si pas de token => vue invité
  if (!token) return showGuest();

  // Vérification du token côté API pour éviter un faux positif
  fetch('http://localhost:3000/api/auth/me', { 
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.ok ? r.json() : null)
    .then(user => {
      if (user) {
        showAuth();
        // Afficher les informations de l'utilisateur avec design amélioré
        if (userInfo) {
          userInfo.innerHTML = `
            <div class="user-welcome">
              <div class="user-avatar-small">
                <span>${user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div class="user-details">
                <span class="user-greeting">Bonjour, ${user.name}</span>
                <div class="user-actions">
                  <a href="./profile.html" class="user-profile-link">
                    <span class="profile-icon">👤</span>
                    <span>Profil</span>
                  </a>
                  <button class="user-logout-link" onclick="localStorage.removeItem('jwt'); window.location.href='./login.html';">
                    <span class="logout-icon">🚪</span>
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }
      } else {
        showGuest();
      }
    })
    .catch(() => showGuest());

  // Déconnexion gérée directement dans userInfo
})();
