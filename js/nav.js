/* ============================================
   導航列共用邏輯
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // 漢堡選單開關
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    // 點選連結後關閉選單
    navMenu.querySelectorAll('.navbar__link, .navbar__dropdown-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  // 標記目前所在頁面的導航連結
  const currentPath = window.location.pathname;
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href) && href !== '/') {
      link.classList.add('active');
    }
  });

  // 捲動時導航列加深背景
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.style.background = window.scrollY > 20
        ? 'rgba(26,26,46,0.98)'
        : 'rgba(26,26,46,0.95)';
    }
  });

  // 登入狀態
  updateAuthNav();
});

async function updateAuthNav() {
  if (typeof supabase === 'undefined') return;
  const authItem = document.getElementById('authNavItem');
  if (!authItem) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return; // 未登入，保持原本「登入」連結

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role')
    .eq('id', session.user.id)
    .single();

  const name    = profile?.display_name || session.user.email?.split('@')[0] || '會員';
  const isAdmin = profile?.role === 'admin';

  authItem.innerHTML = `
    <a href="#" class="navbar__link">
      👤 ${name}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2 4l4 4 4-4"/></svg>
    </a>
    <ul class="navbar__dropdown">
      <li><a href="/pages/my-submissions.html" class="navbar__dropdown-link">我的投稿</a></li>
      ${isAdmin ? '<li><a href="/admin/index.html" class="navbar__dropdown-link">後台管理</a></li>' : ''}
      <li><a href="#" class="navbar__dropdown-link" id="navLogoutBtn">登出</a></li>
    </ul>
  `;

  document.getElementById('navLogoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.reload();
  });
}
