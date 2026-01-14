// プロジェクト同期機能（Supabase + localStorage ハイブリッド）
import { supabase } from '../lib/supabase';
import { SavedProject } from '../types';

const SHARED_PROJECTS_STORAGE_KEY = 'lp-builder-shared-projects';
const SHARED_PROJECTS_BACKUP_KEY = 'lp-builder-shared-projects-backup';
const LAST_SYNC_KEY = 'lp-builder-last-sync';

/**
 * Supabaseからプロジェクトを取得
 */
export const getProjectsFromSupabase = async (): Promise<SavedProject[]> => {
  if (!supabase) {
    console.warn('Supabase is not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects from Supabase:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category || '未分類',
      pageData: item.page_data,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      order: item.order || 0,
    }));
  } catch (error) {
    console.error('Error in getProjectsFromSupabase:', error);
    return [];
  }
};

/**
 * Supabaseにプロジェクトを保存
 */
export const saveProjectToSupabase = async (project: SavedProject): Promise<SavedProject | null> => {
  if (!supabase) {
    console.warn('Supabase is not configured, saving to localStorage only');
    return null;
  }

  try {
    const projectData = {
      name: project.name,
      category: project.category || '未分類',
      page_data: project.pageData,
      order: project.order || 0,
      updated_at: project.updatedAt,
    };

    // 既存プロジェクトを確認（nameで検索）
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('name', project.name)
      .single();

    let result;
    if (existing) {
      // 既存プロジェクトを更新
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project in Supabase:', error);
        return null;
      }
      result = data;
    } else {
      // 新規プロジェクトを作成
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_at: project.createdAt,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project in Supabase:', error);
        return null;
      }
      result = data;
    }

    return {
      id: result.id,
      name: result.name,
      category: result.category || '未分類',
      pageData: result.page_data,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      order: result.order || 0,
    };
  } catch (error) {
    console.error('Error in saveProjectToSupabase:', error);
    return null;
  }
};

/**
 * Supabaseからプロジェクトを削除
 */
export const deleteProjectFromSupabase = async (projectId: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase is not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project from Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProjectFromSupabase:', error);
    return false;
  }
};

/**
 * localStorageからプロジェクトを取得
 */
export const getProjectsFromLocalStorage = (): SavedProject[] => {
  try {
    const stored = localStorage.getItem(SHARED_PROJECTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load projects from localStorage:', error);
    return [];
  }
};

/**
 * localStorageにプロジェクトを保存
 */
export const saveProjectsToLocalStorage = (projects: SavedProject[]): void => {
  try {
    const projectsJson = JSON.stringify(projects);
    localStorage.setItem(SHARED_PROJECTS_STORAGE_KEY, projectsJson);
    localStorage.setItem(SHARED_PROJECTS_BACKUP_KEY, projectsJson);
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
};

/**
 * SupabaseとlocalStorageを同期
 * Supabaseが利用可能な場合はSupabaseを優先、利用不可の場合はlocalStorageを使用
 */
export const syncProjects = async (): Promise<SavedProject[]> => {
  const localProjects = getProjectsFromLocalStorage();
  
  if (!supabase) {
    // Supabaseが利用不可の場合はlocalStorageのみ使用
    return localProjects;
  }

  try {
    // Supabaseから最新のプロジェクトを取得
    const supabaseProjects = await getProjectsFromSupabase();
    
    if (supabaseProjects.length === 0 && localProjects.length > 0) {
      // Supabaseにデータがないが、localStorageにデータがある場合
      // localStorageのデータをSupabaseにアップロード
      for (const project of localProjects) {
        await saveProjectToSupabase(project);
      }
      return localProjects;
    }

    // Supabaseのデータを優先（最新のデータソース）
    // localStorageも更新して同期
    saveProjectsToLocalStorage(supabaseProjects);
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    
    return supabaseProjects;
  } catch (error) {
    console.error('Error syncing projects:', error);
    // エラー時はlocalStorageのデータを返す
    return localProjects;
  }
};

/**
 * プロジェクトを保存（Supabase優先、フォールバックでlocalStorage）
 */
export const saveProjectHybrid = async (project: SavedProject): Promise<SavedProject> => {
  // まずSupabaseに保存を試みる
  const supabaseProject = await saveProjectToSupabase(project);
  
  if (supabaseProject) {
    // Supabaseに保存成功した場合、localStorageも更新
    const localProjects = getProjectsFromLocalStorage();
    const existingIndex = localProjects.findIndex(p => p.id === project.id || p.name === project.name);
    
    if (existingIndex >= 0) {
      localProjects[existingIndex] = supabaseProject;
    } else {
      localProjects.push(supabaseProject);
    }
    
    saveProjectsToLocalStorage(localProjects);
    return supabaseProject;
  } else {
    // Supabaseが利用不可の場合はlocalStorageのみ使用
    const localProjects = getProjectsFromLocalStorage();
    const existingIndex = localProjects.findIndex(p => p.id === project.id || p.name === project.name);
    
    if (existingIndex >= 0) {
      localProjects[existingIndex] = project;
    } else {
      localProjects.push(project);
    }
    
    saveProjectsToLocalStorage(localProjects);
    return project;
  }
};

/**
 * プロジェクトを削除（Supabase優先、フォールバックでlocalStorage）
 */
export const deleteProjectHybrid = async (projectId: string): Promise<boolean> => {
  // Supabaseから削除を試みる
  if (supabase) {
    const success = await deleteProjectFromSupabase(projectId);
    if (!success) {
      console.warn('Failed to delete from Supabase, falling back to localStorage');
    }
  }

  // localStorageからも削除
  const localProjects = getProjectsFromLocalStorage();
  const updatedProjects = localProjects.filter(p => p.id !== projectId);
  saveProjectsToLocalStorage(updatedProjects);

  return true;
};

