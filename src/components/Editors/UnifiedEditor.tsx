import React from 'react';
import { Plus, Trash2, Palette, Eye, EyeOff } from 'lucide-react';
import ImageDropZone from '../UI/ImageDropZone';
import { ImageUploadResult } from '../../utils/imageHandler';
import { ComponentData } from '../../types';
import { usePageStore } from '../../store/usePageStore';
import { getFieldDefinition } from '../../utils/fieldDefinitionStorage';
import { componentFieldConfigs } from '../../utils/fieldDefinitions';
import { FieldRenderer } from './FieldRenderer';
import { getComponentEditor } from './ComponentEditors';
import { getNestedValue, setNestedValue, createFocusHandler, createBlurHandler } from './shared/editorUtils';
import { editorStyles } from './shared/editorStyles';

interface UnifiedEditorProps {
  component: ComponentData;
  mode: 'content' | 'style';
}

const UnifiedEditor: React.FC<UnifiedEditorProps> = ({ component, mode }) => {
  const { pageData, updateComponent, updateGlobalStyles, showClassNames, toggleClassNames } = usePageStore();

  const handlePropChange = (key: string, value: any) => {
    updateComponent(component.id, {
      props: { ...component.props, [key]: value }
    });
  };

  const handleStyleChange = (key: string, value: any) => {
    updateComponent(component.id, {
      style: { ...component.style, [key]: value }
    });
  };

  const handleGlobalStyleChange = (key: string, value: string) => {
    updateGlobalStyles({ [key]: value });
  };

  const styles = editorStyles;
  const handleFocus = createFocusHandler();
  const handleBlur = createBlurHandler();

  const renderStyleEditor = () => {
    return (
      <div style={editorStyles.container}>
        <div style={styles.section}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{...editorStyles.sectionTitle, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0}}>
              <Palette size={16} color="#4b5563" />
              共通スタイル設定
            </h3>
            <button
              onClick={toggleClassNames}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: showClassNames ? '#dbeafe' : '#f3f4f6',
                color: showClassNames ? '#1e40af' : '#4b5563',
                border: showClassNames ? '1px solid #93c5fd' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={showClassNames ? 'クラス名表示をOFF' : 'クラス名表示をON'}
            >
              {showClassNames ? <Eye size={14} /> : <EyeOff size={14} />}
              {showClassNames ? 'クラス名表示中' : 'クラス名表示'}
            </button>
          </div>

          {['mainColor', 'baseColor', 'base2Color', 'accentColor'].map((colorKey) => {
            const labels: Record<string, string> = {
              mainColor: 'mainColor（メインカラー）',
              baseColor: 'baseColor（ベースカラー）',
              base2Color: 'base2Color（セカンダリベースカラー）',
              accentColor: 'accentColor（アクセントカラー）',
            };

            const descriptions: Record<string, string> = {
              mainColor: '主要なアクション要素に使用される色です。各コンポーネントでテキスト色・背景色を選択できます。',
              baseColor: 'セクションで使用される基本色です。各コンポーネントでテキスト色・背景色を選択できます。',
              base2Color: 'カードやパネルで使用される補助的な基本色です。各コンポーネントでテキスト色・背景色を選択できます。',
              accentColor: '強調表示や装飾要素に使用されるアクセント色です。各コンポーネントでテキスト色・背景色を選択できます。',
            };

            const defaults: Record<string, string> = {
              mainColor: '#dc2626',
              baseColor: '#f8fafc',
              base2Color: '#f1f5f9',
              accentColor: '#E60012',
            };

            const subDefaults: Record<string, string> = {
              mainColor: '#ffffff',
              baseColor: '#333333',
              base2Color: '#333333',
              accentColor: '#ffffff',
            };

            const currentColor = (pageData.globalStyles as any)?.[colorKey] || defaults[colorKey];
            const currentSubColor = (pageData.globalStyles as any)?.[`${colorKey}Sub`] || subDefaults[colorKey];

            return (
              <div key={colorKey} style={editorStyles.field}>
                <label style={editorStyles.label}>{labels[colorKey]}</label>
                <div style={editorStyles.colorInputContainer}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      backgroundColor: currentColor,
                      border: '2px solid #e5e7eb',
                      flexShrink: 0,
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}
                    title={`現在の色: ${currentColor}`}
                  />
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => handleGlobalStyleChange(colorKey, e.target.value)}
                    style={editorStyles.colorInput}
                  />
                  <input
                    type="text"
                    value={currentColor}
                    onChange={(e) => handleGlobalStyleChange(colorKey, e.target.value)}
                    style={editorStyles.colorValue}
                    placeholder={defaults[colorKey]}
                  />
                </div>
                <div style={editorStyles.colorInputContainer}>
                  <label style={{ ...editorStyles.label, fontSize: '11px', marginBottom: 0, minWidth: '80px' }}>サブ色:</label>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      backgroundColor: currentSubColor,
                      border: '2px solid #e5e7eb',
                      flexShrink: 0,
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}
                    title={`現在のサブ色: ${currentSubColor}`}
                  />
                  <input
                    type="color"
                    value={currentSubColor}
                    onChange={(e) => handleGlobalStyleChange(`${colorKey}Sub`, e.target.value)}
                    style={editorStyles.colorInput}
                  />
                  <input
                    type="text"
                    value={currentSubColor}
                    onChange={(e) => handleGlobalStyleChange(`${colorKey}Sub`, e.target.value)}
                    style={editorStyles.colorValue}
                    placeholder={subDefaults[colorKey]}
                  />
                </div>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>
                  {descriptions[colorKey]}
                </p>
              </div>
            );
          })}

          <div style={editorStyles.field}>
            <label style={editorStyles.label}>commonColor（共通テキストカラー）</label>
            <div style={editorStyles.colorInputContainer}>
              <div
                style={{
                  ...editorStyles.colorInput,
                  backgroundColor: pageData.globalStyles?.commonColor || '#000000',
                  cursor: 'default',
                }}
              />
              <select
                value={pageData.globalStyles?.commonColor || '#000000'}
                onChange={(e) => handleGlobalStyleChange('commonColor', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="#000000">黒</option>
                <option value="#ffffff">白</option>
              </select>
            </div>
            <div style={editorStyles.note}>
              ページ全体で使用される基本的なテキスト色です。背景色に応じて選択してください。
            </div>
          </div>

          <div style={editorStyles.field}>
            <label style={editorStyles.label}>commonColorBg（共通背景カラー）</label>
            <div style={editorStyles.colorInputContainer}>
              <div
                style={{
                  ...editorStyles.colorInput,
                  backgroundColor: pageData.globalStyles?.commonColorBg || '#ffffff',
                  cursor: 'default',
                }}
              />
              <select
                value={pageData.globalStyles?.commonColorBg || '#ffffff'}
                onChange={(e) => handleGlobalStyleChange('commonColorBg', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="#ffffff">白</option>
                <option value="#000000">黒</option>
              </select>
            </div>
            <div style={editorStyles.note}>
              ページ全体で使用される基本的な背景色です。コンテンツの可読性に応じて選択してください。
            </div>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bae6fd',
            marginTop: '16px',
          }}>
            <p style={{ fontSize: '12px', color: '#0369a1', margin: 0, lineHeight: '1.4' }}>
              💡 これらの色は全コンポーネントで共通して使用されます。変更すると、ページ全体のデザインが統一されます。
            </p>
          </div>
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fbbf24',
          marginTop: '16px',
        }}>
          <p style={{ fontSize: '12px', color: '#92400e', margin: 0, lineHeight: '1.4' }}>
            📝 個別の色設定（背景色、文字色など）は「コンテンツ」タブで設定できます。
          </p>
        </div>
      </div>
    );
  };

  const renderGenericEditor = () => {
    return (
      <div style={editorStyles.container}>
        <div style={editorStyles.section}>
          <h3 style={editorStyles.sectionTitle}>コンテンツ</h3>

          {Object.entries(component.props).map(([key, value]) => {
            if (key === 'id') return null;

            return (
              <div key={key} style={editorStyles.field}>
                <label style={editorStyles.label}>{key}</label>
                {renderFieldByType(key, value)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFieldByType = (key: string, value: any) => {
    if (typeof value === 'boolean') {
      return (
        <label style={editorStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handlePropChange(key, e.target.checked)}
            style={editorStyles.checkbox}
          />
          有効にする
        </label>
      );
    }

    if (typeof value === 'object' && value !== null && 'url' in value && 'text' in value) {
      return (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ ...editorStyles.label, fontSize: '11px' }}>リンクURL</label>
            <input
              type="text"
              value={value.url}
              onChange={(e) => handlePropChange(key, { ...value, url: e.target.value })}
              style={editorStyles.input}
              placeholder="https://example.com"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <div>
            <label style={{ ...styles.label, fontSize: '11px' }}>リンクテキスト</label>
            <textarea
              value={value.text}
              onChange={(e) => handlePropChange(key, { ...value, text: e.target.value })}
              style={styles.textarea}
              placeholder="クリックしてください（改行可）"
              rows={3}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={{ ...styles.label, fontSize: '11px' }}>リンクターゲット</label>
            <select
              value={value.target || '_self'}
              onChange={(e) => handlePropChange(key, { ...value, target: e.target.value })}
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              <option value="_self">同じタブで開く (_self)</option>
              <option value="_blank">新しいタブで開く (_blank)</option>
            </select>
          </div>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null && 'src' in value && 'alt' in value) {
      // ベースパスを取得（存在する場合）
      const basePath = (value as any).basePath || '';
      const currentSrc = value.src || '';
      
      return (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ ...styles.label, fontSize: '11px' }}>
              画像パス
              {basePath && (
                <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '8px', fontWeight: 'normal' }}>
                  (ベースパス: {basePath})
                </span>
              )}
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <input
                type="text"
                value={currentSrc}
                onChange={(e) => {
                  const newSrc = e.target.value;
                  // 新しいパスからベースパスを再計算（必要に応じて）
                  const newBasePath = basePath || (() => {
                    const lastSlashIndex = newSrc.lastIndexOf('/');
                    return lastSlashIndex >= 0 ? newSrc.substring(0, lastSlashIndex + 1) : '';
                  })();
                  handlePropChange(key, { 
                    ...value, 
                    src: newSrc,
                    basePath: newBasePath || undefined,
                  });
                }}
                style={{ ...styles.input, flex: 1 }}
                placeholder="/path/to/image.jpg"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div style={{ marginTop: '8px' }}>
              <ImageDropZone
                currentImageUrl={currentSrc}
                onImageUpload={(result: ImageUploadResult) => {
                  // ベースパスが存在する場合は、ベースパス + ファイル名の形式で保存
                  // ベースパスが存在しない場合は、Base64データまたはフルパスをそのまま使用
                  let newSrc: string;
                  if (basePath && result.filename) {
                    // ベースパス + ファイル名の形式
                    newSrc = basePath + result.filename;
                  } else if (result.url) {
                    // Base64データまたはフルパスの場合
                    newSrc = result.url;
                  } else {
                    newSrc = currentSrc;
                  }
                  
                  handlePropChange(key, { 
                    ...value, 
                    src: newSrc,
                    basePath: basePath || undefined,
                  });
                }}
              />
              {basePath && (
                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
                  ドラッグ&ドロップで追加した画像のファイル名が、ベースパスに追加されます
                </p>
              )}
            </div>
          </div>
          <div>
            <label style={{ ...styles.label, fontSize: '11px' }}>ALTテキスト</label>
            <textarea
              value={value.alt || ''}
              onChange={(e) => handlePropChange(key, { ...value, alt: e.target.value })}
              style={{ ...styles.textarea, minHeight: '60px' }}
              placeholder="画像の説明（改行可）"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>
      );
    }

    if (typeof value === 'string' && value.match(/^https?:\/\//)) {
      return (
        <>
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
              style={editorStyles.input}
              placeholder="https://..."
              onFocus={handleFocus}
              onBlur={handleBlur}
          />
          {key.toLowerCase().includes('image') && (
            <ImageDropZone
              currentImageUrl={value}
              onImageUpload={(result: ImageUploadResult) => {
                handlePropChange(key, result.url || value);
              }}
            />
          )}
        </>
      );
    }

    if (typeof value === 'object' && value !== null && ('color' in value || 'backgroundColor' in value)) {
      return (
        <div>
          {value.color !== undefined && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ ...editorStyles.label, fontSize: '11px' }}>テキストカラー</label>
              <div style={editorStyles.colorInputContainer}>
                <input
                  type="color"
                  value={value.color}
                  onChange={(e) => handlePropChange(key, { ...value, color: e.target.value })}
                  style={editorStyles.colorInput}
                />
                <input
                  type="text"
                  value={value.color}
                  onChange={(e) => handlePropChange(key, { ...value, color: e.target.value })}
                  style={editorStyles.colorValue}
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
          {value.backgroundColor !== undefined && (
            <div>
              <label style={{ ...editorStyles.label, fontSize: '11px' }}>背景カラー</label>
              <div style={editorStyles.colorInputContainer}>
                <input
                  type="color"
                  value={value.backgroundColor}
                  onChange={(e) => handlePropChange(key, { ...value, backgroundColor: e.target.value })}
                  style={editorStyles.colorInput}
                />
                <input
                  type="text"
                  value={value.backgroundColor}
                  onChange={(e) => handlePropChange(key, { ...value, backgroundColor: e.target.value })}
                  style={editorStyles.colorValue}
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'string' && value.startsWith('#')) {
      return (
        <div style={editorStyles.colorInputContainer}>
          <input
            type="color"
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            style={editorStyles.colorInput}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            style={editorStyles.colorValue}
            placeholder="#000000"
          />
        </div>
      );
    }

    if (Array.isArray(value)) {
      const createNewArrayItem = () => {
        if (value.length === 0) {
          return '';
        }
        const lastItem = value[value.length - 1];
        if (typeof lastItem === 'object' && lastItem !== null && 'url' in lastItem && 'text' in lastItem) {
          return { url: '', text: '', target: '_self' };
        }
        if (typeof lastItem === 'object' && lastItem !== null) {
          return { ...lastItem };
        }
        return '';
      };

      return (
        <div>
          {value.map((item, index) => {
            const isLinkItem = typeof item === 'object' && item !== null && 'url' in item && 'text' in item;
            const isObjectItem = typeof item === 'object' && item !== null;
            const isStringItem = typeof item === 'string';

            return (
              <div key={index} style={editorStyles.itemCard}>
                <div style={editorStyles.itemHeader}>
                  <span style={editorStyles.itemIndex}>項目 {index + 1}</span>
                  {value.length > 1 && (
                    <button
                      onClick={() => {
                        const newArray = value.filter((_, i) => i !== index);
                        handlePropChange(key, newArray);
                      }}
                      style={editorStyles.deleteButton}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {isLinkItem ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ ...editorStyles.label, fontSize: '11px' }}>リンクURL</label>
                      <input
                        type="text"
                        value={(item as any).url || ''}
                        onChange={(e) => {
                          const newArray = [...value];
                          newArray[index] = { ...(item as any), url: e.target.value, href: e.target.value };
                          handlePropChange(key, newArray);
                        }}
                        style={editorStyles.input}
                        placeholder="https://example.com"
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </div>
                    <div>
                      <label style={{ ...editorStyles.label, fontSize: '11px' }}>リンクテキスト</label>
                      <textarea
                        value={(item as any).text || ''}
                        onChange={(e) => {
                          const newArray = [...value];
                          newArray[index] = { ...(item as any), text: e.target.value };
                          handlePropChange(key, newArray);
                        }}
                        style={editorStyles.textarea}
                        rows={3}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </div>
                    <div>
                      <label style={{ ...editorStyles.label, fontSize: '11px' }}>target属性</label>
                      <select
                        value={(item as any).target || '_self'}
                        onChange={(e) => {
                          const newArray = [...value];
                          newArray[index] = { ...(item as any), target: e.target.value };
                          handlePropChange(key, newArray);
                        }}
                        style={editorStyles.input}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      >
                        <option value="_self">同じタブで開く (_self)</option>
                        <option value="_blank">新しいタブで開く (_blank)</option>
                      </select>
                    </div>
                  </div>
                ) : isObjectItem ? (
                  Object.entries(item as Record<string, any>).map(([itemKey, itemValue]) => (
                    <div key={itemKey} style={{ ...editorStyles.field, marginBottom: '8px' }}>
                      <label style={{ ...editorStyles.label, fontSize: '11px' }}>{itemKey}</label>
                      <input
                        type="text"
                        value={itemValue as string}
                        onChange={(e) => {
                          const newArray = [...value];
                          newArray[index] = { ...newArray[index], [itemKey]: e.target.value };
                          handlePropChange(key, newArray);
                        }}
                        style={editorStyles.input}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </div>
                  ))
                ) : isStringItem ? (
                  <textarea
                    value={item as string}
                    onChange={(e) => {
                      const newArray = [...value];
                      newArray[index] = e.target.value;
                      handlePropChange(key, newArray);
                    }}
                    rows={3}
                    style={editorStyles.textarea}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                ) : null}
              </div>
            );
          })}
          <button
            onClick={() => {
              const newItem = createNewArrayItem();
              handlePropChange(key, [...value, newItem]);
            }}
            style={editorStyles.addButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <Plus size={14} style={{ marginRight: '4px' }} />
            追加
          </button>
        </div>
      );
    }

    if (typeof value === 'string' && value.length > 50) {
      return (
        <textarea
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          rows={4}
          style={editorStyles.textarea}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handlePropChange(key, e.target.value)}
        style={editorStyles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  };

  /**
   * 設定ベースのエディタをレンダリング
   */
  const renderConfigBasedEditor = (config: { componentType: string; sections: { title: string; fields: any[] }[] }) => {
    return (
      <div style={editorStyles.container}>
        {config.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={editorStyles.section}>
            <h3 style={editorStyles.sectionTitle}>{section.title}</h3>
            {section.fields.map((field) => {
              // ネストされたプロパティの値を取得
              const currentValue = getNestedValue(component.props, field.key);
              
              return (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  value={currentValue}
                  onChange={(value) => {
                    // ネストされたプロパティの更新処理
                    if (field.key.includes('.')) {
                      const updatedProps = setNestedValue(component.props, field.key, value);
                      updateComponent(component.id, {
                        props: updatedProps
                      });
                    } else {
                      handlePropChange(field.key, value);
                    }
                  }}
                  styles={editorStyles}
                  handleFocus={handleFocus}
                  handleBlur={handleBlur}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderContentEditor = () => {
    // 1. 動的に読み込まれたフィールド定義を確認（コンポーネントビルダーで作成されたコンポーネント用）
    const dynamicConfig = getFieldDefinition(component.type);
    if (dynamicConfig) {
      return renderConfigBasedEditor(dynamicConfig);
    }
    
    // 2. 既存の手動定義を確認
    const staticConfig = componentFieldConfigs[component.type];
    if (staticConfig) {
      return renderConfigBasedEditor(staticConfig);
    }
    
    // 3. 個別エディタを確認（レジストリから取得）
    const EditorComponent = getComponentEditor(component.type);
    if (EditorComponent) {
      return (
        <EditorComponent
          component={component}
          onPropChange={handlePropChange}
          onStyleChange={handleStyleChange}
        />
      );
    }
    
    // 4. フォールバック: 汎用エディタ（コンポーネントビルダーで作成されたコンポーネントなど）
    return renderGenericEditor();
  };

  // 個別エディタ関数は ComponentEditors/ ディレクトリに移動しました
  // レジストリから取得するように変更されています

  if (mode === 'style') {
    return renderStyleEditor();
  }

  return renderContentEditor();
};

export default UnifiedEditor;
