// フィールド定義の読み込み（localStorage に旧ビルダーが保存した定義がある場合に使用）

import { ComponentFieldConfig } from './fieldDefinitions';

const FIELD_DEFINITIONS_KEY = 'lp-builder-field-definitions';

const loadFieldDefinitions = (): ComponentFieldConfig[] => {
  try {
    const stored = localStorage.getItem(FIELD_DEFINITIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load field definitions:', error);
    return [];
  }
};

/**
 * 特定のコンポーネントタイプのフィールド定義を取得
 */
export const getFieldDefinition = (componentType: string): ComponentFieldConfig | null => {
  const allConfigs = loadFieldDefinitions();
  return allConfigs.find((c) => c.componentType === componentType) || null;
};
