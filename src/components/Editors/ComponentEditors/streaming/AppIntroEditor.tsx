// アプリ紹介コンポーネントのエディタ

import React from 'react';
import { BaseEditorProps, useBaseEditor } from '../BaseEditor';

export const AppIntroEditor: React.FC<BaseEditorProps> = (props) => {
  const { component, styles, handlePropChange, handleFocus, handleBlur } = useBaseEditor(props);

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>編集可能コンテンツ</h3>

        <div style={{ ...styles.itemCard, backgroundColor: '#fafafa' }}>
          <div style={styles.field}>
            <label style={styles.label}>吹き出しテキスト</label>
            <input
              type="text"
              value={component.props.balloonText || ''}
              onChange={(e) => handlePropChange('balloonText', e.target.value)}
              placeholder="ブラックリスト"
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
