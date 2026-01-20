// エディターファイルの自動生成ユーティリティ

import { ComponentFieldConfig } from './fieldDefinitions';

/**
 * コンポーネントタイプからエディターファイル名を生成
 */
export const generateEditorFileName = (componentType: string): string => {
  // ケバブケースをパスカルケースに変換（例: "program-hero" -> "ProgramHero"）
  const pascalCase = componentType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  return `${pascalCase}Editor.tsx`;
};

/**
 * エディターファイルの内容を生成
 */
export const generateEditorFileContent = (
  componentType: string,
  fieldConfig: ComponentFieldConfig
): string => {
  const editorName = componentType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('') + 'Editor';
  
  const pascalCase = editorName;
  
  // インポート文を生成
  const imports = `// ${componentType}コンポーネントのエディタ

import React from 'react';
import { BaseEditorProps, useBaseEditor } from './BaseEditor';
import { FieldRenderer } from '../FieldRenderer';
import { getNestedValue, setNestedValue } from '../shared/editorUtils';
import { usePageStore } from '../../../store/usePageStore';
`;

  // フィールドレンダリング部分を生成
  const fieldRenders = fieldConfig.sections.map((section, sectionIndex) => {
    const fields = section.fields.map((field, fieldIndex) => {
      const valuePath = `getNestedValue(component.props, '${field.key}')`;
      const onChangeHandler = field.key.includes('.')
        ? `(value) => {
                    const updatedProps = setNestedValue(component.props, '${field.key}', value);
                    updateComponent(component.id, {
                      props: updatedProps
                    });
                  }`
        : `(value) => handlePropChange('${field.key}', value)`;

      return `              <FieldRenderer
                key="${field.key}"
                field={${JSON.stringify(field)}}
                value={${valuePath}}
                onChange={${onChangeHandler}}
                styles={styles}
                handleFocus={handleFocus}
                handleBlur={handleBlur}
              />`;
    }).join('\n');

    return `          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>${section.title}</h3>
${fields}
          </div>`;
  }).join('\n\n');

  // コンポーネント本体を生成
  const componentBody = `export const ${pascalCase}: React.FC<BaseEditorProps> = (props) => {
  const { component, styles, handlePropChange, handleStyleChange, handleFocus, handleBlur } = useBaseEditor(props);
  const { updateComponent } = usePageStore();

  return (
    <div style={styles.container}>
${fieldRenders}
    </div>
  );
};
`;

  return `${imports}

${componentBody}
`;
};

/**
 * エディターファイルを生成してファイルシステムに保存
 */
export const generateAndSaveEditorFile = async (
  componentType: string,
  fieldConfig: ComponentFieldConfig
): Promise<string> => {
  const fileName = generateEditorFileName(componentType);
  const fileContent = generateEditorFileContent(componentType, fieldConfig);
  
  // ファイルを生成するためのAPIエンドポイントを呼び出す
  try {
    const response = await fetch('/api/create-editor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        componentType,
        fileName,
        fileContent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create editor file: ${response.statusText}`);
    }

    const result = await response.json();
    return result.filePath || fileName;
  } catch (error) {
    console.error('エディターファイルの生成に失敗しました:', error);
    throw error;
  }
};
