/* ============================================
   頁面模板系統
   修改此檔案，導航列與頁尾全站同步更新
   ============================================ */

const SITE_NAME = '台灣海蛞蝓紀錄';

/* ---------- 導航列 ---------- */
function renderNav() {
  return `
  <nav class="navbar">
    <div class="navbar__inner">
      <a href="/index.html" class="navbar__logo">
        <span>${SITE_NAME}</span>
      </a>

      <ul class="navbar__menu" id="navMenu">
        <li class="navbar__item">
          <a href="/index.html" class="navbar__link">首頁</a>
        </li>

        <li class="navbar__item">
          <a href="#" class="navbar__link">
            關於網站
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 4l4 4 4-4"/>
            </svg>
          </a>
          <ul class="navbar__dropdown">
            <li><a href="/pages/about.html" class="navbar__dropdown-link">關於網站</a></li>
            <li><a href="/pages/terms.html" class="navbar__dropdown-link">網站條款</a></li>
            <li><a href="/pages/changelog.html" class="navbar__dropdown-link">網站更新誌</a></li>
          </ul>
        </li>

        <li class="navbar__item">
          <a href="/pages/knowledge/index.html" class="navbar__link">知識庫</a>
        </li>

        <li class="navbar__item">
          <a href="/pages/species/index.html" class="navbar__link">物種資料庫</a>
        </li>

        <li class="navbar__item">
          <a href="/pages/gallery/index.html" class="navbar__link">藝廊</a>
        </li>

        <li class="navbar__item">
          <a href="/pages/submit.html" class="navbar__link">投稿</a>
        </li>

        <li class="navbar__item" id="authNavItem">
          <a href="/pages/login.html" class="navbar__link">登入</a>
        </li>
      </ul>

      <button class="navbar__hamburger" id="hamburger" aria-label="選單">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>`;
}

/* ---------- 頁尾 ---------- */
function renderFooter() {
  const year = new Date().getFullYear();
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <div class="footer__brand-name">${SITE_NAME}</div>
          <p class="footer__brand-desc">
            記錄台灣海蛞蝓的生物多樣性與生態故事，<br>
            由潛水教練與海洋生態愛好者共同建立。
          </p>
          <div class="footer__social">
            <a href="https://www.facebook.com/profile.php?id=61575695889861"
               class="footer__social-link" target="_blank" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/cky_photo_wildlife/"
               class="footer__social-link" target="_blank" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
          </div>
        </div>

        <div>
          <div class="footer__heading">探索</div>
          <ul class="footer__links">
            <li><a href="/pages/knowledge/index.html" class="footer__link">知識庫</a></li>
            <li><a href="/pages/species/index.html" class="footer__link">物種資料庫</a></li>
            <li><a href="/pages/gallery/index.html" class="footer__link">藝廊</a></li>
            <li><a href="/pages/regions.html" class="footer__link">地區</a></li>
          </ul>
        </div>

        <div>
          <div class="footer__heading">關於</div>
          <ul class="footer__links">
            <li><a href="/pages/about.html" class="footer__link">關於網站</a></li>
            <li><a href="/pages/terms.html" class="footer__link">網站條款</a></li>
            <li><a href="/pages/changelog.html" class="footer__link">網站更新誌</a></li>
            <li><a href="/pages/contact.html" class="footer__link">聯絡我們</a></li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <span>© ${year} ${SITE_NAME}．All Rights Reserved</span>
        <span>e29314651709@gmail.com</span>
      </div>
    </div>
  </footer>`;
}

/* ---------- 燈箱 ---------- */
function renderLightbox() {
  return `
  <div class="lightbox" id="lightbox">
    <button class="lightbox__close" id="lightboxClose" aria-label="關閉">✕</button>
    <img class="lightbox__img" id="lightboxImg" src="" alt="">
  </div>`;
}

/* ---------- 初始化 ---------- */
function initTemplate() {
  // 插入導航列
  const navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) navPlaceholder.innerHTML = renderNav();

  // 插入頁尾
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) footerPlaceholder.innerHTML = renderFooter();

  // 插入燈箱
  document.body.insertAdjacentHTML('beforeend', renderLightbox());
  initLightbox();
}

/* ---------- 燈箱邏輯 ---------- */
function initLightbox() {
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (!lightbox) return;

  // 所有有 data-lightbox 屬性的圖片
  document.querySelectorAll('[data-lightbox]').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lightboxImg.src = img.dataset.lightbox || img.src;
      lightboxImg.alt = img.alt || '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // 關閉
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', initTemplate);
