// プライシングコンポーネントのエディタ

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BaseEditorProps, useBaseEditor } from '../BaseEditor';
import { usePageStore } from '../../../store/usePageStore';

export const PricingEditor: React.FC<BaseEditorProps> = (props) => {
  const { component, styles, handlePropChange, handleStyleChange, handleFocus, handleBlur } = useBaseEditor(props);
  const { pageData } = usePageStore();

  const handleAdditionalPlanChange = (index: number, field: string, value: any) => {
    const newPlans = [...(component.props.additionalPlans || [])];
    newPlans[index] = { ...newPlans[index], [field]: value };
    handlePropChange('additionalPlans', newPlans);
  };

  const addAdditionalPlan = () => {
    const newPlans = [...(component.props.additionalPlans || [])];
    newPlans.push({
      description: '○○（番組・特集・アーティスト名など）が見られる、スーパー！ドラマTVなど5チャンネルがえらべる',
      name: 'スーパー！セレクト5',
      priceLabel: '視聴料',
      price: '1,100',
      unit: '円/月（税込）'
    });
    handlePropChange('additionalPlans', newPlans);
  };

  const removeAdditionalPlan = (index: number) => {
    const newPlans = [...(component.props.additionalPlans || [])];
    newPlans.splice(index, 1);
    handlePropChange('additionalPlans', newPlans);
  };

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>追加プラン</h3>

        {(component.props.additionalPlans || []).map((plan: any, index: number) => (
          <div key={index} style={{ ...styles.itemCard, backgroundColor: '#fafafa' }}>
            <div style={{ ...styles.itemHeader, marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>追加プラン {index + 1}</span>
              <button
                onClick={() => removeAdditionalPlan(index)}
                style={styles.deleteButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>説明文</label>
              <textarea
                value={plan.description || ''}
                onChange={(e) => handleAdditionalPlanChange(index, 'description', e.target.value)}
                rows={1}
                style={styles.textarea}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>プラン名（例：スーパー！セレクト5）</label>
              <input
                type="text"
                value={plan.name || ''}
                onChange={(e) => handleAdditionalPlanChange(index, 'name', e.target.value)}
                style={styles.input}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <div style={styles.colorInputContainer}>
                <label style={{ ...styles.label, fontSize: '11px', marginBottom: 0, minWidth: '60px' }}>背景色:</label>
                <input
                  type="color"
                  value={plan.backgroundColor || component.style?.accentColor || '#FABE00'}
                  onChange={(e) => handleAdditionalPlanChange(index, 'backgroundColor', e.target.value)}
                  style={styles.colorInput}
                />
                <input
                  type="text"
                  value={plan.backgroundColor || component.style?.accentColor || '#FABE00'}
                  onChange={(e) => handleAdditionalPlanChange(index, 'backgroundColor', e.target.value)}
                  style={styles.colorValue}
                  placeholder="#FABE00"
                />
              </div>

              <div style={styles.colorInputContainer}>
                <label style={{ ...styles.label, fontSize: '11px', marginBottom: 0, minWidth: '60px' }}>文字色:</label>
                <input
                  type="color"
                  value={plan.textColor || '#000000'}
                  onChange={(e) => handleAdditionalPlanChange(index, 'textColor', e.target.value)}
                  style={styles.colorInput}
                />
                <input
                  type="text"
                  value={plan.textColor || '#000000'}
                  onChange={(e) => handleAdditionalPlanChange(index, 'textColor', e.target.value)}
                  style={styles.colorValue}
                  placeholder="#000000"
                />
              </div>

              <div style={styles.note}>
                このプランボックスの背景色と文字色を個別に設定できます。
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>価格</label>
              <input
                type="text"
                value={plan.price || ''}
                onChange={(e) => handleAdditionalPlanChange(index, 'price', e.target.value)}
                style={styles.input}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <div style={styles.colorInputContainer}>
                <label style={{ ...styles.label, fontSize: '11px', marginBottom: 0, minWidth: '60px' }}>文字色:</label>
                <input
                  type="color"
                  value={plan.priceColor || component.style?.accentColor || '#FABE00'}
                  onChange={(e) => handleAdditionalPlanChange(index, 'priceColor', e.target.value)}
                  style={styles.colorInput}
                />
                <input
                  type="text"
                  value={plan.priceColor || component.style?.accentColor || '#FABE00'}
                  onChange={(e) => handleAdditionalPlanChange(index, 'priceColor', e.target.value)}
                  style={styles.colorValue}
                  placeholder="#FABE00"
                />
              </div>
              <div style={styles.note}>
                このプランの価格文字色を個別に設定できます。
              </div>
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={addAdditionalPlan}
            style={{ ...styles.addButton, padding: '8px 16px', fontSize: '14px' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            プラン追加
          </button>
        </div>
      </div>
    </div>
  );
};
