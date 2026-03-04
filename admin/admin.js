/* ============================================
   管理員後台共用邏輯
   ============================================ */

// 驗證管理員身份，未登入則跳回登入頁
async function requireAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return null; }

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single();

  if (!profile || profile.role !== 'admin') {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
    return null;
  }
  return { session, profile };
}

// 登出
async function adminLogout() {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}

// Toast 通知
function showToast(message, type = 'success') {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast toast--${type} show`;
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// 確認對話框
// confirmLabel: 確認按鈕文字（預設「確認刪除」，危險操作為紅色）
// isDanger: 是否用紅色按鈕（預設 true）
function showConfirm(title, text, onConfirm, confirmLabel = '確認刪除', isDanger = true) {
  let overlay = document.getElementById('confirmOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirmOverlay';
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <div class="confirm-box__title" id="confirmTitle"></div>
        <div class="confirm-box__text"  id="confirmText"></div>
        <div class="confirm-box__actions">
          <button class="btn btn--outline btn--sm" id="confirmCancel">取消</button>
          <button class="btn btn--primary btn--sm" id="confirmOk">確認</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmText').textContent  = text;
  const okBtn = document.getElementById('confirmOk');
  okBtn.textContent = confirmLabel;
  okBtn.style.background   = isDanger ? '#e74c3c' : 'var(--color-secondary)';
  okBtn.style.borderColor  = isDanger ? '#e74c3c' : 'var(--color-secondary)';
  overlay.classList.add('show');

  document.getElementById('confirmCancel').onclick = () => overlay.classList.remove('show');
  okBtn.onclick = () => {
    overlay.classList.remove('show');
    onConfirm();
  };
}

// 圖片上傳至 Supabase Storage
async function uploadImage(file, bucket) {
  const ext      = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filename, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);
  return urlData.publicUrl;
}

// 建立側邊欄 HTML
function renderSidebar(activePage) {
  return `
  <aside class="sidebar">
    <div class="sidebar__header">
      <div class="sidebar__title">台灣海蛞蝓紀錄</div>
      <div class="sidebar__sub">管理員後台</div>
    </div>
    <nav class="sidebar__nav">
      <div class="sidebar__section">
        <div class="sidebar__section-label">總覽</div>
        <a href="index.html" class="sidebar__link ${activePage==='dashboard'?'active':''}" data-page="dashboard">
          <span class="icon">📊</span> 儀表板
        </a>
      </div>
      <div class="sidebar__section">
        <div class="sidebar__section-label">內容管理</div>
        <a href="species.html" class="sidebar__link ${activePage==='species'?'active':''}" data-page="species">
          <span class="icon">🐚</span> 物種管理
        </a>
        <a href="articles.html" class="sidebar__link ${activePage==='articles'?'active':''}" data-page="articles">
          <span class="icon">📖</span> 文章管理
        </a>
        <a href="gallery.html" class="sidebar__link ${activePage==='gallery'?'active':''}" data-page="gallery">
          <span class="icon">🖼</span> 藝廊管理
        </a>
        <a href="tags.html" class="sidebar__link ${activePage==='tags'?'active':''}" data-page="tags">
          <span class="icon">🏷</span> 標籤與類別
        </a>
      </div>
      <div class="sidebar__section">
        <div class="sidebar__section-label">社群</div>
        <a href="submissions.html" class="sidebar__link ${activePage==='submissions'?'active':''}" data-page="submissions">
          <span class="icon">📤</span> 投稿審核
        </a>
        <a href="members.html" class="sidebar__link ${activePage==='members'?'active':''}" data-page="members">
          <span class="icon">👥</span> 會員管理
        </a>
      </div>
      <div class="sidebar__section">
        <div class="sidebar__section-label">網站</div>
        <a href="changelog.html" class="sidebar__link ${activePage==='changelog'?'active':''}" data-page="changelog">
          <span class="icon">📝</span> 更新誌
        </a>
        <a href="../index.html" class="sidebar__link" target="_blank">
          <span class="icon">🔗</span> 查看前台
        </a>
      </div>
    </nav>
    <div class="sidebar__footer">
      <button onclick="adminLogout()" class="sidebar__link" style="width:100%; background:none; border:none; cursor:pointer;">
        <span class="icon">🚪</span> 登出
      </button>
    </div>
  </aside>`;
}
