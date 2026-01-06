// CSS template generator for new categories
import { ComponentData } from '../types';
import { getComponentTemplates } from './componentTemplateStorage';

export const generateCSSTemplate = (category: string, cssFileName: string): string => {
  const sectionId = cssFileName.replace('.css', 'Area');
  const normalizedCategory = category.trim();

  return `/* ${normalizedCategory}コンポーネント用CSS */

/* メインセクション */
#${sectionId} {
  padding: 60px 0;
  position: relative;
}

#${sectionId} .sectionInner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 見出しスタイル */
#${sectionId} h2,
#${sectionId} h3 {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin: 0 0 24px 0;
}

#${sectionId} h4 {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 16px 0;
}

/* テキストスタイル */
#${sectionId} p {
  font-size: 16px;
  line-height: 1.8;
  margin: 0 0 16px 0;
}

#${sectionId} .text {
  text-align: center;
}

/* コンテナ・レイアウト */
#${sectionId} .contentWrapper {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  margin-bottom: 40px;
}

#${sectionId} .contentItem {
  flex: 1;
  min-width: 0;
}

/* カードスタイル */
#${sectionId} .card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

#${sectionId} .card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* ボタンスタイル */
#${sectionId} .btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

#${sectionId} .btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

#${sectionId} .btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
}

#${sectionId} .btn-secondary {
  background-color: #6b7280;
  color: #ffffff;
}

/* イメージスタイル */
#${sectionId} img {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

/* リストスタイル */
#${sectionId} ul,
#${sectionId} ol {
  margin: 0 0 16px 0;
  padding-left: 24px;
}

#${sectionId} li {
  margin-bottom: 8px;
  line-height: 1.6;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  #${sectionId} {
    padding: 40px 0;
  }

  #${sectionId} .sectionInner {
    padding: 0 16px;
  }

  #${sectionId} h2,
  #${sectionId} h3 {
    font-size: 24px;
  }

  #${sectionId} .contentWrapper {
    flex-direction: column;
    gap: 24px;
  }

  #${sectionId} .card {
    padding: 16px;
  }
}

/* ユーティリティクラス */
#${sectionId} .text-center {
  text-align: center;
}

#${sectionId} .text-left {
  text-align: left;
}

#${sectionId} .text-right {
  text-align: right;
}

#${sectionId} .mt-small {
  margin-top: 16px;
}

#${sectionId} .mt-medium {
  margin-top: 32px;
}

#${sectionId} .mt-large {
  margin-top: 48px;
}

#${sectionId} .mb-small {
  margin-bottom: 16px;
}

#${sectionId} .mb-medium {
  margin-bottom: 32px;
}

#${sectionId} .mb-large {
  margin-bottom: 48px;
}
`;
};

// カテゴリ名からセクションIDを生成
export const generateSectionId = (category: string): string => {
  return category
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '') + 'Area';
};

// CSSファイルが存在するかチェック用のメタデータ
export interface CSSFileMetadata {
  category: string;
  fileName: string;
  sectionId: string;
  generated: boolean;
  timestamp?: number;
}

// 生成されたCSSファイルのメタデータをローカルストレージに保存
const CSS_METADATA_KEY = 'generated-css-metadata';

export const saveCSSMetadata = (metadata: CSSFileMetadata): void => {
  try {
    const existing = getCSSMetadata();
    const updated = existing.filter(m => m.category !== metadata.category);
    updated.push({ ...metadata, timestamp: Date.now() });
    localStorage.setItem(CSS_METADATA_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving CSS metadata:', error);
  }
};

export const getCSSMetadata = (): CSSFileMetadata[] => {
  try {
    const stored = localStorage.getItem(CSS_METADATA_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading CSS metadata:', error);
    return [];
  }
};

export const isCSSGenerated = (category: string): boolean => {
  const metadata = getCSSMetadata();
  return metadata.some(m => m.category === category && m.generated);
};

/**
 * CSSコードをコンポーネント特有のIDでスコープ化する
 * @param cssCode 元のCSSコード
 * @param sectionId コンポーネントのセクションID（例: "kvArea"）
 * @returns スコープ化されたCSSコード
 */
export const scopeCSSWithSectionId = (cssCode: string, sectionId: string): string => {
  if (!cssCode || !cssCode.trim()) {
    return '';
  }

  // コメントと空行を保持しながら、CSSルールをスコープ化
  const lines = cssCode.split('\n');
  const scopedLines: string[] = [];
  let inMediaQuery = false;
  let mediaQueryIndent = '';
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 空行やコメントはそのまま保持
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//')) {
      scopedLines.push(line);
      continue;
    }

    // @mediaクエリの開始を検出
    if (trimmed.startsWith('@media')) {
      inMediaQuery = true;
      mediaQueryIndent = line.match(/^(\s*)/)?.[1] || '';
      scopedLines.push(line);
      continue;
    }

    // @keyframes、@import、@charsetなどはそのまま保持
    if (trimmed.startsWith('@keyframes') || 
        trimmed.startsWith('@import') || 
        trimmed.startsWith('@charset') ||
        trimmed.startsWith('@supports') ||
        trimmed.startsWith('@page')) {
      scopedLines.push(line);
      continue;
    }

    // ブレースのカウント
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;

    // @mediaクエリの終了を検出
    if (inMediaQuery && trimmed === '}') {
      inMediaQuery = false;
      scopedLines.push(line);
      continue;
    }

    // セレクタ行（{の前）をスコープ化
    if (trimmed.includes('{') && !trimmed.startsWith('@')) {
      const indent = line.match(/^(\s*)/)?.[1] || '';
      const selectorPart = trimmed.split('{')[0].trim();
      
      // セレクタが既に#sectionIdで始まっている場合はスキップ
      if (selectorPart.startsWith(`#${sectionId}`)) {
        scopedLines.push(line);
        continue;
      }

      // セレクタをスコープ化
      // カンマ区切りのセレクタリストに対応
      const selectors = selectorPart.split(',').map(s => s.trim());
      const scopedSelectors = selectors.map(selector => {
        // 既にスコープ化されている場合はスキップ
        if (selector.startsWith(`#${sectionId}`)) {
          return selector;
        }
        // 疑似クラスや疑似要素がある場合の処理
        const pseudoMatch = selector.match(/^(.+?)(::?[a-z-]+(?:\([^)]*\))?)$/i);
        if (pseudoMatch) {
          return `#${sectionId} ${pseudoMatch[1]}${pseudoMatch[2]}`;
        }
        // 通常のセレクタ
        return `#${sectionId} ${selector}`;
      });

      const scopedSelector = scopedSelectors.join(', ');
      const restOfLine = line.substring(line.indexOf('{'));
      scopedLines.push(`${indent}${scopedSelector}${restOfLine}`);
    } else {
      scopedLines.push(line);
    }
  }

  return scopedLines.join('\n');
};

/**
 * コンポーネントタイプからカスタムテンプレートを取得
 */
const getCustomTemplateByType = (type: string) => {
  const customTemplates = getComponentTemplates();
  return customTemplates.find(t => t.name === type || t.uniqueId === type) || null;
};

/**
 * コンポーネントのカスタムCSSをカテゴリごとに収集
 * @param components コンポーネントのリスト
 * @returns カテゴリごとのカスタムCSS（カテゴリ名 -> CSSコードのマップ）
 */
export const collectCustomCSSByCategory = (components: ComponentData[]): Map<string, string> => {
  const cssByCategory = new Map<string, string>();

  components.forEach(component => {
    const customTemplate = getCustomTemplateByType(component.type);
    if (customTemplate && customTemplate.customCssCode && customTemplate.customCssCode.trim()) {
      const category = customTemplate.category;
      const scopedCss = scopeCSSWithSectionId(customTemplate.customCssCode, customTemplate.sectionId);
      
      if (cssByCategory.has(category)) {
        // 既存のCSSに追加（重複を避けるため、改行で区切る）
        const existing = cssByCategory.get(category)!;
        cssByCategory.set(category, `${existing}\n\n/* ${customTemplate.displayName || customTemplate.name} のカスタムCSS */\n${scopedCss}`);
      } else {
        cssByCategory.set(category, `/* ${customTemplate.displayName || customTemplate.name} のカスタムCSS */\n${scopedCss}`);
      }
    }
  });

  return cssByCategory;
};

/**
 * CSSファイルの内容にカスタムCSSを追加
 * @param baseCSS ベースとなるCSSコード
 * @param customCSS 追加するカスタムCSSコード
 * @returns 結合されたCSSコード
 */
export const appendCustomCSSToFile = (baseCSS: string, customCSS: string): string => {
  if (!customCSS || !customCSS.trim()) {
    return baseCSS;
  }
  
  // ベースCSSの末尾にカスタムCSSを追加
  return `${baseCSS}\n\n/* ======================================== */\n/* カスタムCSS */\n/* ======================================== */\n\n${customCSS}`;
};