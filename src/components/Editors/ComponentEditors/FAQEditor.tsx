// FAQコンポーネントのエディタ

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BaseEditorProps, useBaseEditor } from './BaseEditor';

export const FAQEditor: React.FC<BaseEditorProps> = (props) => {
  const { component, styles, handlePropChange, handleFocus, handleBlur } = useBaseEditor(props);

  const handleFAQChange = (index: number, field: string, value: string) => {
    const newFAQs = [...(component.props.faqs || [])];
    newFAQs[index] = { ...newFAQs[index], [field]: value };
    handlePropChange('faqs', newFAQs);
  };

  const addFAQ = () => {
    const newFAQs = [...(component.props.faqs || [])];
    newFAQs.push({
      question: '新しい質問？',
      answer: '質問に対する回答がここに入ります。'
    });
    handlePropChange('faqs', newFAQs);
  };

  const removeFAQ = (index: number) => {
    const newFAQs = [...(component.props.faqs || [])];
    newFAQs.splice(index, 1);
    handlePropChange('faqs', newFAQs);
  };

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>コンテンツ</h3>

        <div style={styles.field}>
          <label style={styles.label}>セクションタイトル</label>
          <input
            type="text"
            value={component.props.title || ''}
            onChange={(e) => handlePropChange('title', e.target.value)}
            style={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>説明文</label>
          <textarea
            value={component.props.description || ''}
            onChange={(e) => handlePropChange('description', e.target.value)}
            rows={2}
            style={styles.textarea}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      <div style={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={styles.sectionTitle}>FAQ項目</h3>
          <button
            onClick={addFAQ}
            style={styles.addButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <Plus size={12} style={{ marginRight: '4px' }} />
            追加
          </button>
        </div>

        <div>
          {(component.props.faqs || []).map((faq: any, index: number) => (
            <div key={index} style={styles.itemCard}>
              <div style={styles.itemHeader}>
                <span style={styles.itemIndex}>FAQ {index + 1}</span>
                <button
                  onClick={() => removeFAQ(index)}
                  style={styles.deleteButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>質問</label>
                <input
                  type="text"
                  value={faq.question || ''}
                  onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>回答</label>
                <textarea
                  value={faq.answer || ''}
                  onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                  rows={3}
                  style={styles.textarea}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
