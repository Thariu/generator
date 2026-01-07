import React, { useState, useMemo, useEffect } from 'react';
import { X, Save, FolderOpen, Trash2, Calendar, FileText, Tag, ChevronDown, ArchiveRestore, Copy, GripVertical } from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePageStore } from '../../store/usePageStore';
import { SavedProject } from '../../types';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ isOpen, onClose }) => {
  const { 
    saveProject, 
    loadProject, 
    deleteProject, 
    duplicateProject,
    reorderProjects,
    getSavedProjects, 
    getCurrentProjectName,
    restoreFromBackup 
  } = usePageStore();
  
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const categories = useMemo(() => [...new Set(savedProjects.map(p => p.category).filter(Boolean))] as string[], [savedProjects]);
  const projectsByCategory = useMemo(() => {
    return savedProjects.reduce<Record<string, SavedProject[]>>((acc, project) => {
      const cat = project.category || '未分類';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(project);
      return acc;
    }, {});
  }, [savedProjects]);

  // カテゴリごとにソート（order順）
  const sortedProjectsByCategory = useMemo(() => {
    const sorted: Record<string, SavedProject[]> = {};
    Object.keys(projectsByCategory).forEach(cat => {
      sorted[cat] = [...projectsByCategory[cat]].sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderA - orderB;
      });
    });
    return sorted;
  }, [projectsByCategory]);

  useEffect(() => {
    if (isOpen) {
      const projects = getSavedProjects();
      setSavedProjects(projects);
      const currentName = getCurrentProjectName();
      if (currentName) {
        const currentProject = projects.find(p => p.name === currentName);
        setProjectName(currentName);
        setCategory(currentProject?.category || '');
      } else {
        setProjectName('');
        setCategory('');
      }
      setExpandedCategories(new Set());
    }
  }, [isOpen, getCurrentProjectName]);

  const handleSave = () => {
    const finalCategory = category.trim() || '未分類';
    if (projectName.trim()) {
      saveProject(projectName.trim(), finalCategory);
      setSavedProjects(getSavedProjects());
      setShowSaveForm(false);
      setExpandedCategories(prev => new Set(prev).add(finalCategory));
    }
  };

  const handleSaveAsNew = () => {
    const finalCategory = category.trim() || '未分類';
    if (projectName.trim()) {
      // 新規プロジェクトとして保存（既存の同名プロジェクトがあっても新規作成）
      const projects = getSavedProjects();
      const baseName = projectName.trim();
      let newName = baseName;
      let counter = 1;
      
      // 同名のプロジェクトが存在する場合、番号を付ける
      while (projects.some(p => p.name === newName)) {
        counter++;
        newName = `${baseName} ${counter}`;
      }
      
      // プロジェクト名を更新して保存
      setProjectName(newName);
      saveProject(newName, finalCategory);
      setSavedProjects(getSavedProjects());
      setShowSaveForm(false);
      setExpandedCategories(prev => new Set(prev).add(finalCategory));
    }
  };

  const handleSaveOverwrite = () => {
    const finalCategory = category.trim() || '未分類';
    if (projectName.trim()) {
      // 確認ダイアログを表示
      if (confirm(`プロジェクト「${projectName.trim()}」を上書き保存しますか？\n既存のデータが置き換えられます。`)) {
        // 既存プロジェクトを上書き保存
        saveProject(projectName.trim(), finalCategory);
        setSavedProjects(getSavedProjects());
        setShowSaveForm(false);
        setExpandedCategories(prev => new Set(prev).add(finalCategory));
      }
    }
  };

  const handleRestore = () => {
    if (restoreFromBackup()) {
      onClose();
      setTimeout(() => {
        alert("復元が完了しました。再度プロジェクト管理を開いてください。");
      }, 100);
    }
  };

  const handleLoad = (projectId: string) => {
    loadProject(projectId);
    onClose();
  };

  const handleDelete = (projectId: string) => {
    if (confirm('このプロジェクトを削除してもよろしいですか？')) {
      deleteProject(projectId);
      setSavedProjects(getSavedProjects());
    }
  };

  const handleDuplicate = (projectId: string) => {
    const originalProject = savedProjects.find(p => p.id === projectId);
    if (!originalProject) return;
    
    if (confirm(`プロジェクト「${originalProject.name}」を複製しますか？`)) {
      duplicateProject(projectId);
      const updatedProjects = getSavedProjects();
      setSavedProjects(updatedProjects);
      
      // 複製されたプロジェクトのカテゴリを展開
      const category = originalProject.category || '未分類';
      setExpandedCategories(prev => new Set(prev).add(category));
    }
  };

  const handleDragEnd = (event: DragEndEvent, category: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const categoryProjects = sortedProjectsByCategory[category] || [];
    const oldIndex = categoryProjects.findIndex(p => p.id === active.id);
    const newIndex = categoryProjects.findIndex(p => p.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderProjects(category, oldIndex, newIndex);
      setSavedProjects(getSavedProjects());
    }
  };
  const toggleCategory = (cat: string) => setExpandedCategories(prev => { const newSet = new Set(prev); if (newSet.has(cat)) newSet.delete(cat); else newSet.add(cat); return newSet; });
  const formatDate = (date: string) => new Date(date).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getProjectDescription = (p: SavedProject) => `${p.pageData.components.length}個のコンポーネント • ${p.pageData.globalSettings.title}`;

  // SortableProjectCardコンポーネント
  interface SortableProjectCardProps {
    project: SavedProject;
    onLoad: (projectId: string) => void;
    onDelete: (projectId: string) => void;
    onDuplicate: (projectId: string) => void;
  }

  const SortableProjectCard: React.FC<SortableProjectCardProps> = ({ project, onLoad, onDelete, onDuplicate }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: project.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div 
        ref={setNodeRef} 
        style={{ ...projectCardStyle, ...style }}
        onClick={() => onLoad(project.id)}
      >
        <div style={projectHeaderStyle}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div 
                {...attributes} 
                {...listeners}
                style={{ 
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#6b7280',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <GripVertical size={16} />
              </div>
              <h3 style={projectTitleStyle}>{project.name}</h3>
            </div>
            <p style={{...projectDescStyle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getProjectDescription(project)}</p>
            <div style={projectMetaStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /><span>更新: {formatDate(project.updatedAt)}</span></div>
            </div>
          </div>
          <div style={projectActionsStyle}>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onDuplicate(project.id); 
              }} 
              style={iconButtonStyle}
              title="プロジェクトを複製"
            >
              <Copy size={16} color="#2563eb" />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onDelete(project.id); 
              }} 
              style={iconButtonStyle}
              title="プロジェクトを削除"
            >
              <Trash2 size={16} color="#dc2626" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  // --- Styles (omitted for brevity) ---
  const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const modalStyle: React.CSSProperties = { backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '800px', margin: '16px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' };
  const headerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 };
  const headerContentStyle: React.CSSProperties = { display: 'flex', alignItems: 'center' };
  const headerTitleStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 600, color: '#111827', marginLeft: '12px' };
  const closeButtonStyle: React.CSSProperties = { padding: '8px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer' };
  const contentStyle: React.CSSProperties = { padding: '24px', overflowY: 'auto', flexGrow: 1 };
  const actionBarStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' };
  const currentProjectStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563' };
  const buttonStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'background-color 0.15s ease-in-out', gap: '8px' };
  const primaryButtonStyle: React.CSSProperties = { ...buttonStyle, backgroundColor: '#2563eb', color: '#ffffff' };
  const secondaryButtonStyle: React.CSSProperties = { ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' };
  const saveFormStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' };
  const inputGroupStyle: React.CSSProperties = { display: 'flex', gap: '12px' };
  const inputStyle: React.CSSProperties = { flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' };
  const projectListContainerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '16px' };
  const categoryHeaderStyle: React.CSSProperties = { fontSize: '16px', fontWeight: 600, color: '#111827', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: '#f9fafb' };
  const projectGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', paddingLeft: '16px', borderLeft: '2px solid #e5e7eb', marginLeft: '12px' };
  const projectCardStyle: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff', transition: 'box-shadow 0.15s ease-in-out', cursor: 'pointer' };
  const projectHeaderStyle: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' };
  const projectTitleStyle: React.CSSProperties = { fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '4px' };
  const projectDescStyle: React.CSSProperties = { fontSize: '14px', color: '#6b7280', marginBottom: '8px' };
  const projectMetaStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#9ca3af' };
  const projectActionsStyle: React.CSSProperties = { display: 'flex', gap: '8px' };
  const iconButtonStyle: React.CSSProperties = { padding: '4px', backgroundColor: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' };
  const emptyStateStyle: React.CSSProperties = { textAlign: 'center', padding: '48px 24px', color: '#6b7280' };
  const emptyIconStyle: React.CSSProperties = { width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' };
  const restoreButtonStyle: React.CSSProperties = { ...secondaryButtonStyle, backgroundColor: '#fefce8', color: '#a16207', border: '1px solid #facc15' };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div style={headerContentStyle}><FolderOpen size={24} color="#2563eb" /><h2 style={headerTitleStyle}>プロジェクト管理</h2></div>
          <button onClick={onClose} style={closeButtonStyle}><X size={20} color="#6b7280" /></button>
        </div>
        <div style={contentStyle}>
          <div style={actionBarStyle}>
            <div style={currentProjectStyle}><FileText size={16} /><span>現在のプロジェクト: {getCurrentProjectName() || '未保存'}</span></div>
            <button onClick={() => setShowSaveForm(!showSaveForm)} style={primaryButtonStyle}><Save size={16} />プロジェクトを保存</button>
          </div>
          {showSaveForm && (
            <div style={saveFormStyle}>
              <div style={inputGroupStyle}>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="プロジェクト名を入力..." style={inputStyle} autoFocus />
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="カテゴリ名（例：テンプレート）" style={inputStyle} list="category-suggestions" />
                <datalist id="category-suggestions">{categories.map(cat => <option key={cat} value={cat} />)}</datalist>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setShowSaveForm(false)} style={secondaryButtonStyle}>キャンセル</button>
                {getCurrentProjectName() && (
                  <button 
                    onClick={handleSaveOverwrite} 
                    disabled={!projectName.trim()} 
                    style={{ ...primaryButtonStyle, opacity: projectName.trim() ? 1 : 0.5, backgroundColor: '#dc2626' }}
                  >
                    上書き保存
                  </button>
                )}
                <button 
                  onClick={handleSaveAsNew} 
                  disabled={!projectName.trim()} 
                  style={{ ...primaryButtonStyle, opacity: projectName.trim() ? 1 : 0.5 }}
                >
                  {getCurrentProjectName() ? '新規プロジェクトとして保存' : '保存'}
                </button>
              </div>
            </div>
          )}
          {savedProjects.length === 0 ? (
            <div style={emptyStateStyle}>
              <FolderOpen style={emptyIconStyle} />
              <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>保存されたプロジェクトがありません</h3>
              <p style={{marginBottom: '16px'}}>現在のページを保存して、後で編集を再開することが出来ます。</p>
              <button onClick={handleRestore} style={restoreButtonStyle}><ArchiveRestore size={16} />バックアップから復元</button>
            </div>
          ) : (
            <div style={projectListContainerStyle}>
              {Object.keys(sortedProjectsByCategory).sort().map(cat => (
                <div key={cat}>
                  <div onClick={() => toggleCategory(cat)} style={categoryHeaderStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Tag size={16} color="#4b5563"/>{cat} ({sortedProjectsByCategory[cat].length})</div>
                    <ChevronDown size={20} style={{ transform: expandedCategories.has(cat) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </div>
                  {expandedCategories.has(cat) && (
                    <DndContext 
                      collisionDetection={closestCenter} 
                      onDragEnd={(e) => handleDragEnd(e, cat)}
                    >
                      <SortableContext 
                        items={sortedProjectsByCategory[cat].map(p => p.id)} 
                        strategy={verticalListSortingStrategy}
                      >
                        <div style={projectGridStyle}>
                          {sortedProjectsByCategory[cat].map((p) => (
                            <SortableProjectCard
                              key={p.id}
                              project={p}
                              onLoad={handleLoad}
                              onDelete={handleDelete}
                              onDuplicate={handleDuplicate}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;