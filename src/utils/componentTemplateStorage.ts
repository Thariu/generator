// Component Template localStorage and Supabase management

import { supabase } from '../lib/supabase';

export interface ComponentTemplateData {
  id: string;
  name: string;
  nameRomanized: string;
  displayName: string;
  category: string;
  categoryRomanized: string;
  uniqueId: string;
  sectionId: string;
  thumbnailUrl?: string;
  description?: string;
  codeTemplate: string;
  defaultProps: Record<string, any>;
  propSchema: any[];
  styleSchema?: any[];
  cssFiles: string[];
  jsFiles: string[];
  customCssCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // バージョン管理フィールド
  version?: number;
  isDraft?: boolean;
  parentId?: string;
  supabaseId?: string; // SupabaseのUUID
}

export interface ComponentVersion {
  id: string;
  version: number;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

const COMPONENT_TEMPLATES_KEY = 'lp-builder-component-templates';

export const getComponentTemplates = (): ComponentTemplateData[] => {
  try {
    const stored = localStorage.getItem(COMPONENT_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load component templates:', error);
    return [];
  }
};

export const saveComponentTemplates = (templates: ComponentTemplateData[]): void => {
  try {
    localStorage.setItem(COMPONENT_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save component templates:', error);
  }
};

export const addComponentTemplate = (template: Omit<ComponentTemplateData, 'id' | 'createdAt' | 'updatedAt'>): ComponentTemplateData => {
  const templates = getComponentTemplates();
  const now = new Date().toISOString();
  const newTemplate: ComponentTemplateData = {
    ...template,
    id: `template-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  templates.push(newTemplate);
  saveComponentTemplates(templates);
  return newTemplate;
};

export const updateComponentTemplate = (id: string, updates: Partial<ComponentTemplateData>): void => {
  const templates = getComponentTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index >= 0) {
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveComponentTemplates(templates);
  }
};

export const deleteComponentTemplate = (id: string): void => {
  const templates = getComponentTemplates();
  const filtered = templates.filter(t => t.id !== id);
  saveComponentTemplates(filtered);
};

/**
 * componentTemplates.tsに存在するコンポーネントと重複するlocalStorageのデータを削除
 */
export const removeDuplicateTemplates = (componentTemplatesFromFile: Array<{ id?: string; uniqueId?: string }>): number => {
  const templates = getComponentTemplates();
  const fileIds = new Set<string>();
  
  // componentTemplates.tsのidとuniqueIdを収集
  componentTemplatesFromFile.forEach(t => {
    if (t.id) fileIds.add(t.id);
    if (t.uniqueId) fileIds.add(t.uniqueId);
  });
  
  // 重複するテンプレートをフィルタリング
  const filtered = templates.filter(t => {
    return !fileIds.has(t.id) && !(t.uniqueId && fileIds.has(t.uniqueId));
  });
  
  const removedCount = templates.length - filtered.length;
  
  if (removedCount > 0) {
    saveComponentTemplates(filtered);
  }
  
  return removedCount;
};

export const getComponentTemplateByName = (name: string): ComponentTemplateData | undefined => {
  const templates = getComponentTemplates();
  return templates.find(t => t.name === name);
};

export const getComponentTemplatesByCategory = (category: string): ComponentTemplateData[] => {
  const templates = getComponentTemplates();
  return templates.filter(t => t.category === category);
};

// ==================== Supabase連携機能 ====================

/**
 * Supabaseからコンポーネントテンプレートを取得（リリース版のみ）
 */
export const getComponentTemplatesFromSupabase = async (): Promise<ComponentTemplateData[]> => {
  if (!supabase) {
    console.warn('Supabase is not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('component_templates')
      .select('*')
      .eq('is_active', true)
      .eq('is_draft', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching component templates from Supabase:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      supabaseId: item.id,
      name: item.name_romanized || item.name,
      nameRomanized: item.name_romanized || item.name,
      displayName: item.display_name,
      category: item.category,
      categoryRomanized: item.category_romanized || item.category.toLowerCase(),
      uniqueId: item.unique_id || `${item.category_romanized || item.category}_${item.name_romanized || item.name}`,
      sectionId: item.section_id || `${item.unique_id || item.name}Area`,
      thumbnailUrl: item.thumbnail_url,
      description: item.description,
      codeTemplate: item.code_template,
      defaultProps: item.default_props || {},
      propSchema: item.prop_schema || [],
      styleSchema: item.style_schema || [],
      cssFiles: item.css_files || [],
      jsFiles: item.js_files || [],
      customCssCode: item.custom_css_code,
      isActive: item.is_active !== false,
      version: item.version || 1,
      isDraft: item.is_draft || false,
      parentId: item.parent_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    console.error('Error in getComponentTemplatesFromSupabase:', error);
    return [];
  }
};

/**
 * Supabaseにコンポーネントテンプレートを保存（ドラフト版として）
 */
export const saveComponentTemplateToSupabase = async (
  template: Omit<ComponentTemplateData, 'id' | 'createdAt' | 'updatedAt' | 'supabaseId'>,
  isDraft: boolean = true
): Promise<ComponentTemplateData | null> => {
  if (!supabase) {
    console.warn('Supabase is not configured, saving to localStorage only');
    return addComponentTemplate(template);
  }

  try {
    // 既存のバージョンを確認
    const { data: existing } = await supabase
      .from('component_templates')
      .select('id, version')
      .eq('unique_id', template.uniqueId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const nextVersion = existing ? (existing.version || 1) + 1 : 1;
    const parentId = existing?.id || null;

    const { data, error } = await supabase
      .from('component_templates')
      .insert({
        name: template.nameRomanized || template.name,
        name_romanized: template.nameRomanized || template.name,
        display_name: template.displayName,
        category: template.category,
        category_romanized: template.categoryRomanized,
        unique_id: template.uniqueId,
        section_id: template.sectionId,
        thumbnail_url: template.thumbnailUrl,
        description: template.description,
        code_template: template.codeTemplate,
        default_props: template.defaultProps,
        prop_schema: template.propSchema,
        style_schema: template.styleSchema || [],
        css_files: template.cssFiles,
        js_files: template.jsFiles,
        custom_css_code: template.customCssCode,
        is_active: template.isActive !== false,
        is_draft: isDraft,
        version: nextVersion,
        parent_id: parentId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving component template to Supabase:', error);
      // フォールバック: localStorageに保存
      return addComponentTemplate(template);
    }

    return {
      ...template,
      id: data.id,
      supabaseId: data.id,
      version: data.version,
      isDraft: data.is_draft,
      parentId: data.parent_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error in saveComponentTemplateToSupabase:', error);
    // フォールバック: localStorageに保存
    return addComponentTemplate(template);
  }
};

/**
 * ドラフト版をリリース版に変更
 */
export const releaseComponentTemplate = async (supabaseId: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase is not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('component_templates')
      .update({ is_draft: false })
      .eq('id', supabaseId);

    if (error) {
      console.error('Error releasing component template:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in releaseComponentTemplate:', error);
    return false;
  }
};

/**
 * コンポーネントのバージョン履歴を取得
 */
export const getComponentVersionHistory = async (uniqueId: string): Promise<ComponentVersion[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('component_templates')
      .select('id, version, is_draft, created_at, updated_at')
      .eq('unique_id', uniqueId)
      .order('version', { ascending: false });

    if (error) {
      console.error('Error fetching version history:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      version: item.version || 1,
      isDraft: item.is_draft || false,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    console.error('Error in getComponentVersionHistory:', error);
    return [];
  }
};

/**
 * 特定のバージョンを取得
 */
export const getComponentTemplateByVersion = async (
  uniqueId: string,
  version: number
): Promise<ComponentTemplateData | null> => {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('component_templates')
      .select('*')
      .eq('unique_id', uniqueId)
      .eq('version', version)
      .single();

    if (error || !data) {
      console.error('Error fetching component template by version:', error);
      return null;
    }

    return {
      id: data.id,
      supabaseId: data.id,
      name: data.name_romanized || data.name,
      nameRomanized: data.name_romanized || data.name,
      displayName: data.display_name,
      category: data.category,
      categoryRomanized: data.category_romanized || data.category.toLowerCase(),
      uniqueId: data.unique_id,
      sectionId: data.section_id,
      thumbnailUrl: data.thumbnail_url,
      description: data.description,
      codeTemplate: data.code_template,
      defaultProps: data.default_props || {},
      propSchema: data.prop_schema || [],
      styleSchema: data.style_schema || [],
      cssFiles: data.css_files || [],
      jsFiles: data.js_files || [],
      customCssCode: data.custom_css_code,
      isActive: data.is_active !== false,
      version: data.version || 1,
      isDraft: data.is_draft || false,
      parentId: data.parent_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error in getComponentTemplateByVersion:', error);
    return null;
  }
};
