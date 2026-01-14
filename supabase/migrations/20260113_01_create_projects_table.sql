/*
  # プロジェクト保存テーブルの作成

  1. 新しいテーブル
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, プロジェクト名)
      - `category` (text, カテゴリ)
      - `page_data` (jsonb, ページデータ全体)
      - `created_at` (timestamptz, 作成日時)
      - `updated_at` (timestamptz, 更新日時)
  
  2. セキュリティ
    - RLSを有効化
    - 全ユーザーが読み書き可能なポリシーを追加（認証システムがないため）
  
  3. インデックス
    - name列にインデックスを追加（検索用）
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT 'general',
  page_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 名前でのユニーク制約
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

-- updated_at自動更新のトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLSを有効化
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能（認証システムがないため）
CREATE POLICY "Anyone can read projects"
  ON projects
  FOR SELECT
  USING (true);

-- 全ユーザーが作成可能
CREATE POLICY "Anyone can create projects"
  ON projects
  FOR INSERT
  WITH CHECK (true);

-- 全ユーザーが更新可能
CREATE POLICY "Anyone can update projects"
  ON projects
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 全ユーザーが削除可能
CREATE POLICY "Anyone can delete projects"
  ON projects
  FOR DELETE
  USING (true);

-- テーブルにコメントを追加
COMMENT ON TABLE projects IS 'ランディングページビルダーのプロジェクトデータ';
COMMENT ON COLUMN projects.name IS 'プロジェクト名（一意）';
COMMENT ON COLUMN projects.category IS 'プロジェクトカテゴリ';
COMMENT ON COLUMN projects.page_data IS 'ページデータ全体（コンポーネント、グローバル設定、スタイル）';

