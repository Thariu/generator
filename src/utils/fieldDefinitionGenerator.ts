// propSchemaからフィールド定義を自動生成するユーティリティ

import { FieldDefinition, ComponentFieldConfig } from './fieldDefinitions';

/**
 * propSchemaからフィールド定義を自動生成
 */
export const generateFieldDefinitionsFromPropSchema = (
  componentType: string,
  propSchema: any[]
): ComponentFieldConfig => {
  // フィールドをセクションごとにグループ化
  // デフォルトは「基本情報」セクション
  const sections: { [key: string]: FieldDefinition[] } = {
    '基本情報': [],
  };

  propSchema.forEach((field) => {
    // PropFieldのtypeをFieldDefinitionのtypeに変換
    const fieldType = convertPropTypeToFieldType(field.type);
    
    // セクションを決定（フィールド名から推測、またはデフォルト）
    const section = determineSection(field.name) || '基本情報';
    
    if (!sections[section]) {
      sections[section] = [];
    }

    const fieldDef: FieldDefinition = {
      key: field.name,
      label: field.label || generateLabelFromName(field.name),
      type: fieldType,
      placeholder: generatePlaceholder(field.type, field.label),
      defaultValue: field.defaultValue,
      note: field.description,
      section: section,
    };

    // textareaの場合はrowsを設定
    if (fieldType === 'textarea') {
      const defaultValueStr = field.defaultValue?.toString() || '';
      fieldDef.rows = defaultValueStr.length > 100 ? 4 : 3;
    }

    // selectタイプの場合はオプションを生成（必要に応じて）
    if (fieldType === 'select' && field.options) {
      fieldDef.options = field.options;
    }

    sections[section].push(fieldDef);
  });

  // ComponentFieldConfigの形式に変換
  return {
    componentType: componentType,
    sections: Object.entries(sections).map(([title, fields]) => ({
      title,
      fields,
    })),
  };
};

/**
 * PropFieldのtypeをFieldDefinitionのtypeに変換
 */
const convertPropTypeToFieldType = (propType: string): FieldDefinition['type'] => {
  const typeMap: Record<string, FieldDefinition['type']> = {
    'text': 'text',
    'textarea': 'textarea',
    'link': 'link',
    'image': 'image',
    'color': 'color',
    'backgroundColor': 'color',
    'colorBoth': 'color', // 後で特別処理が必要な場合は調整
    'array': 'text', // 配列は後で特別処理が必要
    'visibility': 'checkbox',
  };
  
  return typeMap[propType] || 'text';
};

/**
 * フィールド名からセクションを推測
 */
const determineSection = (fieldName: string): string | null => {
  const lowerName = fieldName.toLowerCase();
  
  // キーワードベースでセクションを決定
  if (lowerName.includes('title') || lowerName.includes('name') || lowerName.includes('description')) {
    return '基本情報';
  }
  if (lowerName.includes('broadcast') || lowerName.includes('channel') || lowerName.includes('schedule')) {
    return '放送情報';
  }
  if (lowerName.includes('image') || lowerName.includes('media') || lowerName.includes('video')) {
    return 'メディア';
  }
  if (lowerName.includes('link') || lowerName.includes('url')) {
    return 'リンク';
  }
  if (lowerName.includes('color') || lowerName.includes('style') || lowerName.includes('bg')) {
    return 'スタイル設定';
  }
  
  return null; // デフォルトセクションに配置
};

/**
 * フィールド名からラベルを生成
 */
const generateLabelFromName = (name: string): string => {
  // スネークケースやキャメルケースを日本語ラベルに変換
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
};

/**
 * プレースホルダーを生成
 */
const generatePlaceholder = (type: string, label?: string): string | undefined => {
  if (label) {
    return `${label}を入力してください`;
  }
  return undefined;
};
