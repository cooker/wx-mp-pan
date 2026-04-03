CREATE TABLE IF NOT EXISTS category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS resource (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT,
  tags TEXT,
  url TEXT,
  heat_score INTEGER DEFAULT 0,
  status INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS resource_fts USING fts5(
  title, content, tags,
  content='resource',
  content_rowid='id',
  tokenize='unicode61'
);

-- 网站全局配置（单行 id=1）
CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_title TEXT NOT NULL DEFAULT '资源检索系统',
  header_script TEXT,
  tracking_enabled INTEGER NOT NULL DEFAULT 0,
  tracking_events TEXT,
  app_recommendations TEXT
);

-- status: 0=待审核 1=已上线
CREATE TABLE IF NOT EXISTS blocked_keyword (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL UNIQUE,
  status INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT NOT NULL,
  props_json TEXT,
  path TEXT,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL
);
