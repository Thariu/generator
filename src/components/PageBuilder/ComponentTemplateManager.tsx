import React, { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, Pencil, Upload, X, Plus } from 'lucide-react';
import {
  getManagedComponentTemplatesFromSupabase,
  releaseComponentTemplate,
  type ComponentTemplateData,
  type ManagedTemplateFilter,
} from '../../utils/componentTemplateStorage';
import ComponentBuilder from './ComponentBuilder';

type TabFilter = ManagedTemplateFilter;

interface ComponentTemplateManagerProps {
  onClose: () => void;
  onTemplatesChanged?: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 2100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
};

const panelStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  width: 'min(720px, 100%)',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const builderOverlayStyle: React.CSSProperties = { ...overlayStyle, zIndex: 2200 };

const builderPanelStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  width: 'min(1400px, 96%)',
  maxHeight: '92vh',
  overflow: 'auto',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '20px 24px',
  borderBottom: '1px solid #e5e7eb',
};

const primaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  ...primaryBtnStyle,
  backgroundColor: '#f3f4f6',
  color: '#374151',
};

const iconBtnStyle: React.CSSProperties = {
  padding: '8px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: '#6b7280',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px 8px 36px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const listStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '0 24px 24px',
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '14px',
  marginBottom: '10px',
};

const cardActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginTop: '12px',
  flexWrap: 'wrap',
};

const actionBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 12px',
  fontSize: '12px',
  fontWeight: 500,
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#fff',
  cursor: 'pointer',
};

const publishBtnStyle: React.CSSProperties = {
  ...actionBtnStyle,
  borderColor: '#86efac',
  backgroundColor: '#ecfdf5',
  color: '#047857',
};

const ComponentTemplateManager: React.FC<ComponentTemplateManagerProps> = ({
  onClose,
  onTemplatesChanged,
}) => {
  const [templates, setTemplates] = useState<ComponentTemplateData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<TabFilter>('all');
  const [editingUniqueId, setEditingUniqueId] = useState<string | null>(null);
  const [showCreateBuilder, setShowCreateBuilder] = useState(false);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      setTemplates(await getManagedComponentTemplatesFromSupabase(tab));
    } finally {
      setIsLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const filtered = templates.filter((t) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      t.displayName.toLowerCase().includes(q) ||
      t.uniqueId.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  const handlePublish = async (template: ComponentTemplateData) => {
    const id = template.supabaseId || template.id;
    if (!window.confirm(`「${template.displayName}」を公開しますか？`)) return;
    if (await releaseComponentTemplate(id)) {
      alert('公開しました');
      await loadTemplates();
      onTemplatesChanged?.();
    } else {
      alert('公開に失敗しました');
    }
  };

  const handleBuilderClose = () => {
    setEditingUniqueId(null);
    setShowCreateBuilder(false);
    void loadTemplates();
    onTemplatesChanged?.();
  };

  if (editingUniqueId || showCreateBuilder) {
    return (
      <div style={builderOverlayStyle} onClick={handleBuilderClose}>
        <div style={builderPanelStyle} onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              {editingUniqueId ? 'テンプレートを編集' : '新規テンプレート'}
            </h2>
            <button type="button" onClick={handleBuilderClose} style={iconBtnStyle} aria-label="閉じる">
              <X size={22} />
            </button>
          </div>
          <ComponentBuilder
            mode={editingUniqueId ? 'edit' : 'create'}
            editUniqueId={editingUniqueId ?? undefined}
            onClose={handleBuilderClose}
            onSaved={handleBuilderClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <header style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>テンプレート管理</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
              コンポーネント定義の作成・編集・公開
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" style={secondaryBtnStyle} onClick={() => void loadTemplates()}>
              <RefreshCw size={16} />
            </button>
            <button type="button" style={primaryBtnStyle} onClick={() => setShowCreateBuilder(true)}>
              <Plus size={16} />
              新規作成
            </button>
            <button type="button" onClick={onClose} style={iconBtnStyle}>
              <X size={20} />
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '8px', padding: '12px 24px 0' }}>
          {(
            [
              { id: 'all' as TabFilter, label: 'すべて' },
              { id: 'draft' as TabFilter, label: 'ドラフト' },
              { id: 'released' as TabFilter, label: '公開済み' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                backgroundColor: tab === id ? '#dbeafe' : '#f3f4f6',
                color: tab === id ? '#1d4ed8' : '#4b5563',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', padding: '12px 24px' }}>
          <Search
            size={16}
            color="#9ca3af"
            style={{ position: 'absolute', left: 36, top: 22, pointerEvents: 'none' }}
          />
          <input
            type="search"
            placeholder="名前・unique_id・カテゴリで検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        <div style={listStyle}>
          {isLoading && <p style={{ color: '#6b7280', fontSize: '14px' }}>読み込み中…</p>}
          {!isLoading && filtered.length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>テンプレートがありません</p>
          )}
          {filtered.map((t) => (
            <article key={t.uniqueId} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{t.displayName}</h3>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: t.isDraft ? '#fef3c7' : '#d1fae5',
                    color: t.isDraft ? '#92400e' : '#065f46',
                    fontWeight: 600,
                  }}
                >
                  {t.isDraft ? 'ドラフト' : '公開済み'}
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                {t.uniqueId}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                {t.category} · v{t.version ?? 1} ·{' '}
                {t.updatedAt ? new Date(t.updatedAt).toLocaleString('ja-JP') : '—'}
              </p>
              <div style={cardActionsStyle}>
                <button type="button" style={actionBtnStyle} onClick={() => setEditingUniqueId(t.uniqueId)}>
                  <Pencil size={14} />
                  編集
                </button>
                {t.isDraft && (
                  <button type="button" style={publishBtnStyle} onClick={() => void handlePublish(t)}>
                    <Upload size={14} />
                    公開
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComponentTemplateManager;
