/**
 * コンポーネントタイプとコンポーネント名のマッピング
 * このファイルが唯一の情報源となる
 * 
 * コンポーネントビルダーでコンポーネントを作成すると、このファイルが自動的に更新されます
 */

export const COMPONENT_TYPE_MAP = {
  'kv': 'KVComponent',
  'headline': 'HeadlineComponent',
  'test': 'FAQComponent',
  'footer': 'FooterComponent',
  'pricing': 'PricingComponent',
  'app-intro': 'AppIntroComponent',
  'tel': 'tel',
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

