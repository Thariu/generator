/**
 * コンポーネントタイプと React コンポーネント名のマッピング（手動メンテナンス）
 * 新規の React 種別を追加するときのみここを更新する。
 * dynamic-template は DynamicTemplateComponent のみ（DB 駆動）。
 */

export const COMPONENT_TYPE_MAP = {
  'kv': 'KVComponent',
  'headline': 'HeadlineComponent',
  'footer': 'FooterComponent',
  'pricing': 'PricingComponent',
  /** Supabase 駆動セクション（html_markup + Realtime） */
  'dynamic-template': 'DynamicTemplateComponent',
} as const;

// ComponentTypeをマッピングから自動生成
export type ComponentType = keyof typeof COMPONENT_TYPE_MAP;

// コンポーネント名を取得するヘルパー関数
export const getComponentName = (type: ComponentType): string => {
  return COMPONENT_TYPE_MAP[type] || '';
};

// コンポーネントタイプが存在するかチェック
export const hasComponentType = (type: string): type is ComponentType => {
  return type in COMPONENT_TYPE_MAP;
};

