/*
  # プロジェクトテーブルにorderカラムを追加

  1. 変更内容
    - `projects`テーブルに`order`カラムを追加（カテゴリ内での表示順序）
    - デフォルト値は0
*/

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS order INTEGER DEFAULT 0;

-- 既存のプロジェクトにorderを設定（カテゴリごとに0から順番に）
DO $$
DECLARE
  cat text;
  idx integer;
BEGIN
  FOR cat IN SELECT DISTINCT category FROM projects LOOP
    idx := 0;
    UPDATE projects 
    SET order = idx
    WHERE category = cat 
    AND id IN (
      SELECT id FROM projects 
      WHERE category = cat 
      ORDER BY created_at ASC 
      LIMIT 1
    );
    
    FOR idx IN 1..(SELECT COUNT(*) - 1 FROM projects WHERE category = cat) LOOP
      UPDATE projects 
      SET order = idx
      WHERE category = cat 
      AND id IN (
        SELECT id FROM projects 
        WHERE category = cat 
        ORDER BY created_at ASC 
        OFFSET idx 
        LIMIT 1
      );
    END LOOP;
  END LOOP;
END $$;

COMMENT ON COLUMN projects.order IS 'カテゴリ内での表示順序';

