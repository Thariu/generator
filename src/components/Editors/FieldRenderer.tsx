// フィールド定義に基づいてフィールドをレンダリングするコンポーネント

import React from 'react';
import { FieldDefinition } from '../../utils/fieldDefinitions';
import ImageDropZone from '../UI/ImageDropZone';
import { ImageUploadResult } from '../../utils/imageHandler';

interface FieldRendererProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  styles: any;
  handleFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  styles,
  handleFocus,
  handleBlur,
}) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={styles.input}
            placeholder={field.placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={field.rows || 3}
            style={styles.textarea}
            placeholder={field.placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        );
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              style={styles.checkbox}
            />
            有効にする
          </label>
        );
      
      case 'color':
        return (
          <div style={styles.colorInputContainer}>
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              style={styles.colorInput}
            />
            <input
              type="text"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              style={styles.colorValue}
              placeholder="#000000"
            />
          </div>
        );
      
      case 'image':
        // 画像フィールドの処理
        const imageValue = typeof value === 'string' ? value : value?.src || '';
        return (
          <div>
            <input
              type="text"
              value={imageValue}
              onChange={(e) => {
                if (typeof value === 'object' && value !== null) {
                  onChange({ ...value, src: e.target.value });
                } else {
                  onChange(e.target.value);
                }
              }}
              style={styles.input}
              placeholder={field.placeholder || '画像パス'}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <div style={{ marginTop: '8px' }}>
              <ImageDropZone
                currentImage={imageValue}
                onImageUpload={(result: ImageUploadResult) => {
                  if (typeof value === 'object' && value !== null) {
                    onChange({ ...value, src: result.url });
                  } else {
                    onChange(result.url);
                  }
                }}
                fieldLabel={field.label}
              />
            </div>
          </div>
        );
      
      case 'link':
        // リンクフィールドの処理
        const linkValue = typeof value === 'object' && value !== null ? value : { url: '', text: '', target: '_self' };
        return (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ ...styles.label, fontSize: '11px' }}>リンクURL</label>
              <input
                type="text"
                value={linkValue.url || ''}
                onChange={(e) => onChange({ ...linkValue, url: e.target.value })}
                style={styles.input}
                placeholder="https://example.com"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label style={{ ...styles.label, fontSize: '11px' }}>リンクテキスト</label>
              <textarea
                value={linkValue.text || ''}
                onChange={(e) => onChange({ ...linkValue, text: e.target.value })}
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
                value={linkValue.target || '_self'}
                onChange={(e) => onChange({ ...linkValue, target: e.target.value })}
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
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={styles.input}
            placeholder={field.placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        );
    }
  };

  return (
    <div style={styles.field}>
      <label style={styles.label}>{field.label}</label>
      {renderField()}
      {field.note && <div style={styles.note}>{field.note}</div>}
    </div>
  );
};
