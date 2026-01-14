// ComponentTypeはcomponentRegistry.tsから再エクスポート
export type { ComponentType } from '../utils/componentRegistry';

export interface ComponentData {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  style?: ComponentStyle;
  templateId?: string; // テンプレートID（同じカテゴリ内の複数コンポーネントを区別するため）
}

export interface ComponentStyle {
  theme?: 'light' | 'dark';
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange';
  layout?: string;
  backgroundColor?: string;
  textColor?: string;
  designPattern?: string;
  // ダークモード関連
  isDarkMode?: boolean;
  lightModeBackup?: {
    backgroundColor?: string;
    textColor?: string;
    headlineColor?: string;
    descriptionColor?: string;
    buttonBackgroundColor?: string;
    buttonTextColor?: string;
    cardBackgroundColor?: string;
    cardTextColor?: string;
    accentColor?: string;
  };
  // 詳細なスタイル設定
  headlineColor?: string;
  descriptionColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  accentColor?: string;
  borderColor?: string;
  cardBackgroundColor?: string;
  cardTextColor?: string;
}

export interface PageData {
  components: ComponentData[];
  globalSettings: {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    directory?: string;
  };
  // 共通スタイル設定を追加
  globalStyles?: GlobalStyles;
}

// 共通スタイル設定の型定義
export interface GlobalStyles {
  mainColor: string;
  mainColorSub: string;
  baseColor: string;
  baseColorSub: string;
  base2Color: string;
  base2ColorSub: string;
  accentColor: string;
  accentColorSub: string;
  commonColor: string;
  commonColorBg: string;
}

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

export interface ComponentTemplate {
  id: string;
  type: ComponentType;
  name: string;
  nameRomanized?: string; // コンポーネント名のローマ字表記（必須）
  description: string;
  thumbnail: string;
  category: string;
  categoryRomanized?: string; // カテゴリ名のローマ字表記（オプション）
  defaultProps: Record<string, any>;
  uniqueId?: string; // 自動生成される一意のID（カテゴリ_コンポーネント）
  cssFiles?: string[]; // CSSファイルのリスト
  jsFiles?: string[]; // JSファイルのリスト
  sectionId?: string; // セクションID
}

export interface DesignPattern {
  id: string;
  name: string;
  description: string;
  style: ComponentStyle;
}

export interface SavedProject {
  id: string;
  name: string;
  category?: string;
  pageData: PageData;
  createdAt: string;
  updatedAt: string;
  order?: number; // カテゴリ内での表示順序
}

export interface ProjectMetadata {
  id: string;
  name: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  componentCount: number;
  description: string;
}
