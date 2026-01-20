// フィールド定義の保存・読み込みユーティリティ

import { ComponentFieldConfig } from './fieldDefinitions';
import { generateFieldDefinitionsFromPropSchema } from './fieldDefinitionGenerator';

const FIELD_DEFINITIONS_KEY = 'lp-builder-field-definitions';

/**
 * フィールド定義を保存
 */
export const saveFieldDefinition = (config: ComponentFieldConfig): void => {
  try {
    const allConfigs = getFieldDefinitions();
    const existingIndex = allConfigs.findIndex(c => c.componentType === config.componentType);
    
    if (existingIndex >= 0) {
      allConfigs[existingIndex] = config;
    } else {
      allConfigs.push(config);
    }
    
    localStorage.setItem(FIELD_DEFINITIONS_KEY, JSON.stringify(allConfigs));
  } catch (error) {
    console.error('Failed to save field definition:', error);
  }
};

/**
 * すべてのフィールド定義を取得
 */
export const getFieldDefinitions = (): ComponentFieldConfig[] => {
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
  const allConfigs = getFieldDefinitions();
  return allConfigs.find(c => c.componentType === componentType) || null;
};

/**
 * propSchemaからフィールド定義を生成して保存
 */
export const generateAndSaveFieldDefinition = (
  componentType: string,
  propSchema: any[]
): ComponentFieldConfig => {
  const config = generateFieldDefinitionsFromPropSchema(componentType, propSchema);
  saveFieldDefinition(config);
  return config;
};

/**
 * フィールド定義を削除
 */
export const deleteFieldDefinition = (componentType: string): void => {
  try {
    const allConfigs = getFieldDefinitions();
    const filtered = allConfigs.filter(c => c.componentType !== componentType);
    localStorage.setItem(FIELD_DEFINITIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete field definition:', error);
  }
};
