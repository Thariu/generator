import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, RefreshCw, Settings2 } from 'lucide-react';
import { ComponentTemplate } from '../../types';
import { usePageStore } from '../../store/usePageStore';
import { fetchAndApplyTemplateByUniqueId } from '../../utils/dynamicTemplateSync';
import { loadReleasedCatalog } from '../../utils/templateCatalog';
import ComponentBuilder from './ComponentBuilder';
import ComponentTemplateManager from './ComponentTemplateManager';

const ComponentLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [catalogTemplates, setCatalogTemplates] = useState<ComponentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showComponentBuilder, setShowComponentBuilder] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [keySequence, setKeySequence] = useState('');
  const { addComponent, pageData } = usePageStore();

  const SECRET_KEY = 'mode_admin';
  const excludedCategories = ['UI要素', 'メディア', 'お問い合わせ'];

  const allTemplates = catalogTemplates.filter(
    (template) => !excludedCategories.includes(template.category)
  );
  const categories = ['All', ...Array.from(new Set(allTemplates.map((t) => t.category)))];

  const refreshActiveDynamicTemplatesOnPage = useCallback(async () => {
    const uniqueIds = Array.from(
      new Set(
        pageData.components
          .filter((c) => c.type === 'dynamic-template' && c.templateUniqueId)
          .map((c) => c.templateUniqueId as string)
      )
    );
    await Promise.all(uniqueIds.map((id) => fetchAndApplyTemplateByUniqueId(id, { force: true })));
  }, [pageData.components]);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await loadReleasedCatalog();
      setCatalogTemplates(items);
      await refreshActiveDynamicTemplatesOnPage();
    } catch (e) {
      console.error('Catalog load failed', e);
      setCatalogTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, [refreshActiveDynamicTemplatesOnPage]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);


  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setKeySequence(prev => {
        const newSequence = (prev + e.key).slice(-SECRET_KEY.length);
        if (newSequence === SECRET_KEY) {
          setShowComponentBuilder(true);
          return '';
        }
        return newSequence;
      });
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  const isTemplateUsedOnPage = (template: ComponentTemplate) => {
    return pageData.components.some((c) => {
      if (template.uniqueId && c.templateUniqueId === template.uniqueId) return true;
      if (c.templateId && c.templateId === template.id) return true;
      return (
        c.type === template.type &&
        JSON.stringify(c.props) === JSON.stringify(template.defaultProps)
      );
    });
  };

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddComponent = (template: ComponentTemplate) => {
    if (isTemplateUsedOnPage(template)) {
      return;
    }

    const isDynamic = template.renderMode === 'dynamic' || template.type === 'dynamic-template';

    const newComponent = {
      id: `${template.type}-${Date.now()}`,
      type: template.type,
      props: { ...template.defaultProps },
      style: { theme: 'light' as const, colorScheme: 'blue' as const },
      templateId: template.id,
      ...(template.uniqueId ? { templateUniqueId: template.uniqueId } : {}),
      ...(isDynamic ? {} : {}),
    };
    addComponent(newComponent);

    if (isDynamic && template.uniqueId) {
      void fetchAndApplyTemplateByUniqueId(template.uniqueId, { force: true });
    }
  };

  const containerStyle: React.CSSProperties = {
    width: '320px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '16px',
  };

  const searchContainerStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: '16px',
  };

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  };

  const searchIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  };

  const categoriesStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  };

  const categoryButtonStyle: React.CSSProperties = {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
  };

  const getCategoryButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    ...categoryButtonStyle,
    backgroundColor: isSelected ? '#dbeafe' : '#f3f4f6',
    color: isSelected ? '#1d4ed8' : '#4b5563',
  });

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  };

  const componentCardStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s ease-in-out',
    marginBottom: '12px',
    position: 'relative',
  };

  const getComponentCardStyle = (isUsed: boolean): React.CSSProperties => ({
    ...componentCardStyle,
    cursor: isUsed ? 'not-allowed' : 'pointer',
    opacity: isUsed ? 0.6 : 1,
  });

  const thumbnailStyle: React.CSSProperties = {
    aspectRatio: '16/9',
    backgroundColor: '#f3f4f6',
    position: 'relative',
    overflow: 'hidden',
  };

  const thumbnailImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.2s ease-in-out',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease-in-out',
  };

  const plusIconContainerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    padding: '8px',
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const usedOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  };

  const usedTextStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '8px 16px',
    borderRadius: '8px',
    backdropFilter: 'blur(4px)',
  };

  const cardContentStyle: React.CSSProperties = {
    padding: '12px',
  };

  const cardTitleStyle: React.CSSProperties = {
    fontWeight: 500,
    color: '#111827',
    fontSize: '14px',
    marginBottom: '4px',
  };

  const cardDescriptionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.4',
    marginBottom: '8px',
  };

  const categoryTagStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    fontSize: '10px',
    borderRadius: '20px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ ...titleStyle, marginBottom: 0 }}>コンポーネント</h2>
          <button
            type="button"
            onClick={() => setShowTemplateManager(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1d4ed8',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <Settings2 size={16} />
            テンプレート管理
          </button>
        </div>

        <div style={searchContainerStyle}>
          <Search style={searchIconStyle} size={16} />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        <div style={categoriesStyle}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={getCategoryButtonStyle(selectedCategory === category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div style={listStyle}>
        {filteredTemplates.map((template) => {
          const isUsed = isTemplateUsedOnPage(template);
          
          return (
            <div
              key={template.id}
              style={getComponentCardStyle(isUsed)}
              onClick={() => handleAddComponent(template)}
              onMouseEnter={(e) => {
                if (!isUsed) {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement;
                  const plusIcon = e.currentTarget.querySelector('.plus-icon') as HTMLElement;
                  const image = e.currentTarget.querySelector('.thumbnail-image') as HTMLElement;
                  if (overlay) overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                  if (plusIcon) plusIcon.style.opacity = '1';
                  if (image) image.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isUsed) {
                  e.currentTarget.style.boxShadow = 'none';
                  const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement;
                  const plusIcon = e.currentTarget.querySelector('.plus-icon') as HTMLElement;
                  const image = e.currentTarget.querySelector('.thumbnail-image') as HTMLElement;
                  if (overlay) overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                  if (plusIcon) plusIcon.style.opacity = '0';
                  if (image) image.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={thumbnailStyle}>
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  style={thumbnailImageStyle}
                  className="thumbnail-image"
                />
                
                {/* 使用中オーバーレイ */}
                {isUsed && (
                  <div style={usedOverlayStyle}>
                    <div style={usedTextStyle}>使用中</div>
                  </div>
                )}
                
                {/* 通常のホバーオーバーレイ（未使用の場合のみ） */}
                {!isUsed && (
                  <div style={overlayStyle} className="overlay">
                    <div style={plusIconContainerStyle} className="plus-icon">
                      <Plus size={16} color="#4b5563" />
                    </div>
                  </div>
                )}
              </div>
              
              <div style={cardContentStyle}>
                <h3 style={cardTitleStyle}>{template.name}</h3>
                <p style={cardDescriptionStyle}>{template.description}</p>
                <span style={categoryTagStyle}>{template.category}</span>
              </div>
            </div>
          );
        })}
      </div>


      {showTemplateManager && (
        <ComponentTemplateManager
          onClose={() => setShowTemplateManager(false)}
          onTemplatesChanged={() => {
            void loadCatalog();
          }}
        />
      )}

      {showComponentBuilder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => {
            setShowComponentBuilder(false);
            void loadCatalog();
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '1400px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                コンポーネントビルダー
              </h2>
              <button
                onClick={() => {
                  setShowComponentBuilder(false);
                  void loadCatalog();
                }}
                style={{
                  padding: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>
            <ComponentBuilder
              onClose={() => {
                setShowComponentBuilder(false);
                void loadCatalog();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentLibrary;