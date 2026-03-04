/* ============================================
   Supabase 連線設定
   填入您的 Project URL 與 anon public key
   ============================================ */

const SUPABASE_URL = 'https://qoioxrivlhlzbztcxxeu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaW94cml2bGhsemJ6dGN4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MDg2NDksImV4cCI6MjA4Nzk4NDY0OX0.MWCm-xMtaubuo5_2lu3gQN85k1MMim5SMXm8OWxHptI';

// Supabase 客戶端
let supabase;
try {
  const { createClient } = window.supabase;
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Supabase 初始化成功');
} catch(e) {
  console.error('Supabase 初始化失敗:', e);
}
