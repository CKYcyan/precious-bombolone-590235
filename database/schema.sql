-- ============================================
-- 台灣海蛞蝓紀錄網站 資料庫結構
-- 請在 Supabase → SQL Editor 執行此檔案
-- ============================================


-- ============================================
-- 1. 會員資料（擴充 Supabase Auth）
-- ============================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  display_name TEXT,
  bio         TEXT,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'member' CHECK (role IN ('member', 'expert', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 新會員註冊時自動建立 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================
-- 2. 類別（地點、食性、棲地、物種類群等）
-- 管理員可新增類別，不需改程式
-- ============================================
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,          -- 類別名稱，如「分布地點」
  slug        TEXT UNIQUE NOT NULL,   -- 程式用識別碼，如 location
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 預設類別
INSERT INTO categories (name, slug, sort_order) VALUES
  ('分布地點', 'location',     1),
  ('紀錄者',   'recorder',    2),
  ('物種類群', 'taxon_group', 3),
  ('食性',     'diet',        4),
  ('棲地',     'habitat',     5),
  ('潮位',     'tidal_zone',  6),
  ('體色',     'color',       7);


-- ============================================
-- 3. 標籤（每個類別下的選項）
-- ============================================
CREATE TABLE tags (
  id          SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  color       TEXT,                   -- 顏色代碼，選填
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 預設標籤：分布地點
INSERT INTO tags (category_id, name, slug, sort_order) VALUES
  (1, '墾丁',   'kenting',     1),
  (1, '小琉球', 'little-liuqiu', 2),
  (1, '澎湖',   'penghu',      3),
  (1, '綠島',   'green-island', 4),
  (1, '蘭嶼',   'orchid-island', 5),
  (1, '北部',   'north',       6),
  (1, '東部',   'east',        7),
  (1, '西部',   'west',        8);

-- 預設標籤：體色
INSERT INTO tags (category_id, name, slug, color, sort_order) VALUES
  (7, '紅',  'red',         '#e74c3c', 1),
  (7, '橙',  'orange',      '#e67e22', 2),
  (7, '黃',  'yellow',      '#f1c40f', 3),
  (7, '綠',  'green',       '#27ae60', 4),
  (7, '藍',  'blue',        '#2980b9', 5),
  (7, '紫',  'purple',      '#8e44ad', 6),
  (7, '粉紅', 'pink',       '#e91e8c', 7),
  (7, '棕',  'brown',       '#795548', 8),
  (7, '白',  'white',       '#ecf0f1', 9),
  (7, '灰',  'gray',        '#95a5a6', 10),
  (7, '黑',  'black',       '#2c3e50', 11),
  (7, '透明', 'transparent', '#00000020', 12);


-- ============================================
-- 4. 物種資料庫
-- ============================================
CREATE TABLE species (
  id            SERIAL PRIMARY KEY,
  name_zh       TEXT NOT NULL,          -- 中文名
  name_sci      TEXT NOT NULL,          -- 學名
  name_author   TEXT,                   -- 命名者
  name_year     INT,                    -- 命名年份
  cover_image   TEXT,                   -- 封面照片 URL
  description   TEXT,                   -- 物種描述（富文字 HTML）
  -- 分類階層
  taxon_phylum  TEXT DEFAULT '軟體動物門',
  taxon_class   TEXT DEFAULT '腹足綱',
  taxon_subclass TEXT,
  taxon_order   TEXT,
  taxon_family  TEXT,
  taxon_genus   TEXT,
  -- 外部連結
  worms_id      INT,                    -- WoRMS 資料庫 ID
  -- 狀態
  published     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 物種與標籤的關聯
CREATE TABLE species_tags (
  species_id  INT REFERENCES species(id) ON DELETE CASCADE,
  tag_id      INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (species_id, tag_id)
);

-- 相似物種
CREATE TABLE species_similar (
  species_id INT REFERENCES species(id) ON DELETE CASCADE,
  similar_id INT REFERENCES species(id) ON DELETE CASCADE,
  PRIMARY KEY (species_id, similar_id)
);


-- ============================================
-- 5. 知識庫文章
-- ============================================
CREATE TABLE articles (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE,
  excerpt      TEXT,                    -- 摘要
  content      TEXT,                   -- 富文字 HTML 內容
  cover_image  TEXT,
  author_id    UUID REFERENCES profiles(id),
  published    BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 文章與標籤的關聯
CREATE TABLE article_tags (
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);


-- ============================================
-- 6. 藝廊（管理員上傳）
-- ============================================
CREATE TABLE gallery (
  id           SERIAL PRIMARY KEY,
  image_url    TEXT NOT NULL,
  species_id   INT REFERENCES species(id) ON DELETE SET NULL,
  photographer TEXT,                   -- 攝影者名稱
  location     TEXT,                   -- 拍攝地點文字
  taken_at     DATE,                   -- 拍攝日期
  description  TEXT,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 7. 觀察投稿
-- ============================================
CREATE TABLE submissions (
  id                SERIAL PRIMARY KEY,
  -- 投稿者資訊
  submitter_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitter_name    TEXT NOT NULL,      -- 未登入時留下的名稱
  submitter_email   TEXT NOT NULL,
  -- 觀察資訊
  photos            TEXT[] NOT NULL,    -- 照片 URL 陣列
  observed_at       DATE,              -- 拍攝日期
  location_text     TEXT,              -- 地點文字描述
  location_lat      DECIMAL(10,7),     -- 緯度
  location_lng      DECIMAL(10,7),     -- 經度
  species_guess     TEXT,              -- 投稿者的物種猜測
  color_tags        INT[],             -- 投稿者選的體色標籤 ID
  depth_m           INT,               -- 水深（公尺）
  behavior_notes    TEXT,              -- 行為描述
  license_agreed    BOOLEAN DEFAULT FALSE,
  -- 審核資訊
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','needs_info')),
  species_id        INT REFERENCES species(id) ON DELETE SET NULL,  -- 審核後確定的物種
  reviewer_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_note     TEXT,              -- 給投稿者看的審核備註
  internal_note     TEXT,             -- 內部不公開的筆記
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 8. 專家確認鑑定
-- ============================================
CREATE TABLE expert_verifications (
  id         SERIAL PRIMARY KEY,
  species_id INT REFERENCES species(id) ON DELETE CASCADE,
  expert_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  verified   BOOLEAN NOT NULL,         -- TRUE = 確認，FALSE = 有疑慮
  note       TEXT,                     -- 有疑慮時填寫原因
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (species_id, expert_id)       -- 每位專家每個物種只能確認一次
);


-- ============================================
-- 9. 網站更新誌
-- ============================================
CREATE TABLE changelog (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT,
  version     TEXT,
  logged_at   DATE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 10. Row Level Security（存取權限控制）
-- ============================================

-- 開啟 RLS
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE species              ENABLE ROW LEVEL SECURITY;
ALTER TABLE species_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE species_similar      ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery              ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog            ENABLE ROW LEVEL SECURITY;

-- 公開可讀（所有人）
CREATE POLICY "公開讀取物種"     ON species              FOR SELECT USING (published = true);
CREATE POLICY "公開讀取物種標籤" ON species_tags         FOR SELECT USING (true);
CREATE POLICY "公開讀取相似物種" ON species_similar      FOR SELECT USING (true);
CREATE POLICY "公開讀取文章"     ON articles             FOR SELECT USING (published = true);
CREATE POLICY "公開讀取文章標籤" ON article_tags         FOR SELECT USING (true);
CREATE POLICY "公開讀取藝廊"     ON gallery              FOR SELECT USING (true);
CREATE POLICY "公開讀取標籤"     ON tags                 FOR SELECT USING (true);
CREATE POLICY "公開讀取類別"     ON categories           FOR SELECT USING (true);
CREATE POLICY "公開讀取更新誌"   ON changelog            FOR SELECT USING (true);
CREATE POLICY "公開讀取確認鑑定" ON expert_verifications FOR SELECT USING (true);
CREATE POLICY "公開讀取會員資料" ON profiles             FOR SELECT USING (true);

-- 已登入者可投稿
CREATE POLICY "已登入者可投稿"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR submitter_email IS NOT NULL);

-- 投稿者可查看自己的投稿
CREATE POLICY "查看自己的投稿"
  ON submissions FOR SELECT
  USING (submitter_id = auth.uid());

-- 管理員可操作全部（透過 service role 或自訂函式處理）
CREATE POLICY "管理員讀取所有投稿"
  ON submissions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','expert'))
  );

CREATE POLICY "管理員更新投稿"
  ON submissions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 專家可寫入確認鑑定
CREATE POLICY "專家寫入確認鑑定"
  ON expert_verifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('expert','admin'))
    AND expert_id = auth.uid()
  );

CREATE POLICY "專家更新自己的確認"
  ON expert_verifications FOR UPDATE
  USING (expert_id = auth.uid());

-- 管理員可寫入物種、文章、藝廊、標籤
CREATE POLICY "管理員寫入物種"   ON species   FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "管理員寫入文章"   ON articles  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "管理員寫入藝廊"   ON gallery   FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "管理員寫入標籤"   ON tags      FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "管理員寫入類別"   ON categories FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "管理員寫入更新誌" ON changelog  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================
-- 11. Storage Bucket（照片儲存空間）
-- 請在 Supabase Storage 手動建立以下 bucket：
--   - species-photos   （物種照片，公開）
--   - gallery-photos   （藝廊照片，公開）
--   - submission-photos（投稿照片，公開）
--   - avatars          （會員頭像，公開）
-- ============================================
