import { create } from 'zustand';
import { ComponentData, PageData, ViewMode, SavedProject, GlobalStyles } from '../types';

interface PageStore {
  pageData: PageData;
  selectedComponentId: string | null;
  viewMode: ViewMode;
  previewMode: boolean;
  history: PageData[];
  historyIndex: number;
  showComponentLibrary: boolean;
  showPropertiesPanel: boolean;
  showClassNames: boolean;

  // Actions
  addComponent: (component: ComponentData) => void;
  updateComponent: (id: string, updates: Partial<ComponentData>) => void;
  deleteComponent: (id: string) => void;
  reorderComponents: (fromIndex: number, toIndex: number) => void;
  selectComponent: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setPreviewMode: (enabled: boolean) => void;
  updateGlobalSettings: (settings: Partial<PageData['globalSettings']>) => void;
  updateGlobalStyles: (styles: Partial<GlobalStyles>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  resetPage: () => void;
  toggleComponentLibrary: () => void;
  togglePropertiesPanel: () => void;
  toggleClassNames: () => void;
  
  // プロジェクト保存機能（共有ストレージ）
  saveProject: (name: string, category: string) => void;
  loadProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => void;
  reorderProjects: (category: string, oldIndex: number, newIndex: number) => void;
  getSavedProjects: () => SavedProject[];
  getCurrentProjectName: () => string | null;
  setCurrentProjectName: (name: string | null) => void;
  currentProjectName: string | null;
  restoreFromBackup: () => boolean;
}

const initialPageData: PageData = {
  components: [
    {
      id: 'headline-default',
      type: 'headline',
      props: {
        text: 'タイトルを挿入',
        usePageTitle: true
      },
      style: { theme: 'light', colorScheme: 'blue' as const },
    }
  ],
  globalSettings: {
      title: 'タイトルを挿入',
    description: 'ディスクリプションを挿入',
    directory: 'test',
  },
  globalStyles: {
    mainColor: '#C3000F',
    mainColorSub: '#ffffff',
    baseColor: '#f8fafc',
    baseColorSub: '#333333',
    base2Color: '#f1f5f9',
    base2ColorSub: '#333333',
    accentColor: '#E60012',
    accentColorSub: '#ffffff',
    commonColor: '#000000',
    commonColorBg: '#ffffff',
  },
};

const SHARED_PROJECTS_STORAGE_KEY = 'lp-builder-shared-projects';
const SHARED_PROJECTS_BACKUP_KEY = 'lp-builder-shared-projects-backup';
const CURRENT_PROJECT_KEY = 'lp-builder-current-project';

const getSharedProjects = (): SavedProject[] => {
  try {
    const stored = localStorage.getItem(SHARED_PROJECTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load shared projects:', error);
    return [];
  }
};

const saveSharedProjects = (projects: SavedProject[]): void => {
  try {
    const projectsJson = JSON.stringify(projects);
    localStorage.setItem(SHARED_PROJECTS_STORAGE_KEY, projectsJson);
    localStorage.setItem(SHARED_PROJECTS_BACKUP_KEY, projectsJson);
  } catch (error) {
    console.error('Failed to save shared projects:', error);
  }
};

const getBackupProjects = (): SavedProject[] => {
  try {
    const stored = localStorage.getItem(SHARED_PROJECTS_BACKUP_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load backup projects:', error);
    return [];
  }
};

export const usePageStore = create<PageStore>((set, get) => ({
  pageData: initialPageData,
  selectedComponentId: null,
  viewMode: 'desktop',
  previewMode: false,
  history: [initialPageData],
  historyIndex: 0,
  showComponentLibrary: true,
  showPropertiesPanel: true,
  showClassNames: false,
  currentProjectName: null,

  addComponent: (component) => {
    set((state) => {
      // 重複チェック：同じIDのコンポーネントが既に存在する場合は追加しない
      const existingComponent = state.pageData.components.find(c => c.id === component.id);
      if (existingComponent) {
        // エラーメッセージを表示
        alert(`同じIDのコンポーネントが既に存在しています。\n\nコンポーネントID: ${component.id}\nコンポーネントタイプ: ${component.type}`);
        console.warn(`Component with id "${component.id}" already exists. Skipping duplicate.`);
        return state;
      }
      
      const newPageData = { ...state.pageData, components: [...state.pageData.components, component] };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newPageData);
      return { pageData: newPageData, selectedComponentId: component.id, history: newHistory, historyIndex: newHistory.length - 1 };
    });
    setTimeout(() => {
      document.querySelector(`[data-component-id="${component.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  },

  updateComponent: (id, updates) => {
    set((state) => {
      const newComponents = state.pageData.components.map((comp) => comp.id === id ? { ...comp, ...updates } : comp);
      const newPageData = { ...state.pageData, components: newComponents };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newPageData);
      return { pageData: newPageData, history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },

  deleteComponent: (id) => {
    set((state) => {
      const newComponents = state.pageData.components.filter((comp) => comp.id !== id);
      const newPageData = { ...state.pageData, components: newComponents };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newPageData);
      return { pageData: newPageData, selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId, history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },

  reorderComponents: (fromIndex, toIndex) => {
    set((state) => {
      const newComponents = [...state.pageData.components];
      const [removed] = newComponents.splice(fromIndex, 1);
      newComponents.splice(toIndex, 0, removed);
      const newPageData = { ...state.pageData, components: newComponents };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newPageData);
      return { pageData: newPageData, history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },

  selectComponent: (id) => set({ selectedComponentId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setPreviewMode: (enabled) => set({ previewMode: enabled, selectedComponentId: enabled ? null : get().selectedComponentId }),
  updateGlobalSettings: (settings) => {
    set((state) => {
      const newPageData = { ...state.pageData, globalSettings: { ...state.pageData.globalSettings, ...settings } };
      if (settings.title && !settings.title.includes('｜スカパー！:')) {
        newPageData.globalSettings.title = `${settings.title}｜スカパー！: スポーツ＆音楽ライブ、アイドル、アニメ、ドラマ、映画など`;
      }
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newPageData);
      return { pageData: newPageData, history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },
  updateGlobalStyles: (styles) => {
    set((state) => {
      const newPageData = { ...state.pageData, globalStyles: { ...state.pageData.globalStyles, ...styles } };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newPageData);
      return { pageData: newPageData, history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },
  undo: () => set((state) => state.historyIndex > 0 ? { pageData: state.history[state.historyIndex - 1], historyIndex: state.historyIndex - 1, selectedComponentId: null } : state),
  redo: () => set((state) => state.historyIndex < state.history.length - 1 ? { pageData: state.history[state.historyIndex + 1], historyIndex: state.historyIndex + 1, selectedComponentId: null } : state),
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  resetPage: () => {
    set((state) => {
      const headlineComponent = { id: 'headline-default', type: 'headline' as const, props: { text: 'タイトルを挿入', usePageTitle: true }, style: { theme: 'light' as const, colorScheme: 'blue' as const } };
      const resetPageData = { ...initialPageData, components: [headlineComponent] };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(resetPageData);
      return { pageData: resetPageData, selectedComponentId: null, history: newHistory, historyIndex: newHistory.length - 1, currentProjectName: null };
    });
  },
  toggleComponentLibrary: () => set((state) => ({ showComponentLibrary: !state.showComponentLibrary })),
  togglePropertiesPanel: () => set((state) => ({ showPropertiesPanel: !state.showPropertiesPanel })),
  toggleClassNames: () => set((state) => ({ showClassNames: !state.showClassNames })),

  saveProject: (name, category) => {
    const state = get();
    const now = new Date().toISOString();
    const newProject: SavedProject = {
      id: `project-${Date.now()}`,
      name,
      category,
      pageData: state.pageData,
      createdAt: now,
      updatedAt: now
    };
    const existingProjects = getSharedProjects();
    const existingProjectIndex = existingProjects.findIndex(p => p.name === name);
    let updatedProjects: SavedProject[];
    if (existingProjectIndex >= 0) {
      updatedProjects = [...existingProjects];
      updatedProjects[existingProjectIndex] = {
        ...existingProjects[existingProjectIndex],
        pageData: state.pageData,
        category,
        updatedAt: now
      };
    } else {
      updatedProjects = [...existingProjects, newProject];
    }
    saveSharedProjects(updatedProjects);
    set({ currentProjectName: name });
    localStorage.setItem(CURRENT_PROJECT_KEY, name);
  },
  
  loadProject: (projectId) => {
    const projects = getSharedProjects();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      set(state => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(project.pageData);
        return {
          pageData: project.pageData,
          selectedComponentId: null,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          currentProjectName: project.name
        };
      });
      localStorage.setItem(CURRENT_PROJECT_KEY, project.name);
    }
  },

  deleteProject: (projectId) => {
    const projects = getSharedProjects();
    const updatedProjects = projects.filter(p => p.id !== projectId);
    saveSharedProjects(updatedProjects);
    const deletedProject = projects.find(p => p.id === projectId);
    if (deletedProject && get().currentProjectName === deletedProject.name) {
      set({ currentProjectName: null });
      localStorage.removeItem(CURRENT_PROJECT_KEY);
    }
  },

  duplicateProject: (projectId) => {
    const projects = getSharedProjects();
    const projectToDuplicate = projects.find(p => p.id === projectId);
    if (!projectToDuplicate) return;

    // 複製名を生成（重複チェック）
    const baseName = `${projectToDuplicate.name} (コピー)`;
    let newName = baseName;
    let counter = 1;
    
    while (projects.some(p => p.name === newName)) {
      counter++;
      newName = `${projectToDuplicate.name} (コピー ${counter})`;
    }

    // カテゴリ内の最大orderを取得して+1
    const category = projectToDuplicate.category || '未分類';
    const categoryProjects = projects.filter(p => (p.category || '未分類') === category);
    const maxOrder = categoryProjects.length > 0 
      ? Math.max(...categoryProjects.map(p => p.order || 0))
      : -1;

    const now = new Date().toISOString();
    const duplicatedProject: SavedProject = {
      id: `project-${Date.now()}`,
      name: newName,
      category,
      pageData: JSON.parse(JSON.stringify(projectToDuplicate.pageData)), // ディープコピー
      createdAt: now,
      updatedAt: now,
      order: maxOrder + 1
    };

    const updatedProjects = [...projects, duplicatedProject];
    saveSharedProjects(updatedProjects);
  },

  reorderProjects: (category, oldIndex, newIndex) => {
    const projects = getSharedProjects();
    const categoryKey = category || '未分類';
    const categoryProjects = projects
      .filter(p => (p.category || '未分類') === categoryKey)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0 || 
        oldIndex >= categoryProjects.length || newIndex >= categoryProjects.length) {
      return;
    }

    // 配列の並び替え
    const [movedProject] = categoryProjects.splice(oldIndex, 1);
    categoryProjects.splice(newIndex, 0, movedProject);

    // orderを再設定
    categoryProjects.forEach((project, index) => {
      project.order = index;
    });

    // 全プロジェクトを更新
    const updatedProjects = projects.map(p => {
      if ((p.category || '未分類') === categoryKey) {
        const updated = categoryProjects.find(cp => cp.id === p.id);
        return updated || p;
      }
      return p;
    });

    saveSharedProjects(updatedProjects);
  },
  
  getSavedProjects: getSharedProjects,
  getCurrentProjectName: () => get().currentProjectName,
  setCurrentProjectName: (name) => {
    set({ currentProjectName: name });
    if (name) localStorage.setItem(CURRENT_PROJECT_KEY, name);
    else localStorage.removeItem(CURRENT_PROJECT_KEY);
  },

  restoreFromBackup: () => {
    const backupProjects = getBackupProjects();
    if (backupProjects.length > 0) {
      if (confirm('バックアップからプロジェクトを復元しますか？現在のプロジェクトリストは上書きされます。')) {
        saveSharedProjects(backupProjects);
        alert('バックアップからプロジェクトを復元しました。');
        return true;
      }
    } else {
      alert('利用可能なバックアップが見つかりませんでした。');
    }
    return false;
  },
}));