// ヘッドラインコンポーネントのエディタ

import React from 'react';
import { BaseEditorProps, useBaseEditor } from '../BaseEditor';

export const HeadlineEditor: React.FC<BaseEditorProps> = (props) => {
  const { component, styles, handlePropChange, handleStyleChange, handleFocus, handleBlur } = useBaseEditor(props);

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>コンテンツ</h3>

        <div style={styles.field}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={component.props.usePageTitle || false}
              onChange={(e) => handlePropChange('usePageTitle', e.target.checked)}
              style={styles.checkbox}
            />
            ページタイトルと連動する
          </label>
          <div style={styles.note}>
            チェックすると、ページ設定のタイトルが自動的に反映されます。
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>ヘッドラインテキスト</label>
          <textarea
            value={component.props.text || ''}
            onChange={(e) => handlePropChange('text', e.target.value)}
            rows={3}
            style={styles.textarea}
            placeholder="ヘッドラインテキストを入力してください"
            disabled={component.props.usePageTitle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <div style={styles.note}>
            {component.props.usePageTitle
              ? 'ページタイトル連動が有効です。ページ設定でタイトルを変更してください。'
              : 'ページの最上部に表示される重要なヘッドラインです。'
            }
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>スタイル設定</h3>

        <div style={styles.field}>
          <label style={styles.label}>背景色</label>
          <div style={styles.colorInputContainer}>
            <input
              type="color"
              value={component.style?.backgroundColor || '#dc2626'}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              style={styles.colorInput}
            />
            <input
              type="text"
              value={component.style?.backgroundColor || '#dc2626'}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              style={styles.colorValue}
              placeholder="#dc2626"
            />
          </div>
          <div style={styles.note}>
            デフォルトでは共通スタイルのmainColorが適用されます。
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>文字色</label>
          <div style={styles.colorInputContainer}>
            <input
              type="color"
              value={component.style?.textColor || '#ffffff'}
              onChange={(e) => handleStyleChange('textColor', e.target.value)}
              style={styles.colorInput}
            />
            <input
              type="text"
              value={component.style?.textColor || '#ffffff'}
              onChange={(e) => handleStyleChange('textColor', e.target.value)}
              style={styles.colorValue}
              placeholder="#ffffff"
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>ヘッドライン文字色</label>
          <div style={styles.colorInputContainer}>
            <input
              type="color"
              value={component.style?.headlineColor || '#ffffff'}
              onChange={(e) => handleStyleChange('headlineColor', e.target.value)}
              style={styles.colorInput}
            />
            <input
              type="text"
              value={component.style?.headlineColor || '#ffffff'}
              onChange={(e) => handleStyleChange('headlineColor', e.target.value)}
              style={styles.colorValue}
              placeholder="#ffffff"
            />
          </div>
          <div style={styles.note}>
            ヘッドライン専用の文字色を設定できます。
          </div>
        </div>
      </div>

      <div style={{
        padding: '12px',
        backgroundColor: '#f0f9ff',
        borderRadius: '6px',
        border: '1px solid #bae6fd',
        marginTop: '16px',
      }}>
        <p style={{ fontSize: '12px', color: '#0369a1', margin: 0, lineHeight: '1.4' }}>
          💡 このコンポーネントは必須コンポーネントとして、ヘッダーの直下に自動的に配置されます。
        </p>
      </div>
    </div>
  );
};
