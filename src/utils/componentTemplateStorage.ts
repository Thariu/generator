// Component Template localStorage and Supabase management

import { supabase } from '../lib/supabase';
import { REACT_VARIANT_SEEDS } from '../data/reactVariantSeeds';
import { mapDbRowToComponentTemplateData } from './componentTemplateMapper';

export type RenderMode = 'dynamic' | 'react';

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
  /** ランタイム用 HTML（data-prop 付き）。Supabase の html_markup と対応 */
  htmlMarkup?: string;
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
  renderMode?: RenderMode;
  componentType?: string;
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

// ==================== Supabase連携機能 ====================

/** unique_id ごとに最新バージョン1件に集約 */
const dedupeTemplatesByUniqueId = (rows: Record<string, unknown>[]): ComponentTemplateData[] => {
  const byUniqueId = new Map<string, ComponentTemplateData>();
  for (const row of rows) {
    const uid = row.unique_id as string;
    if (!uid || byUniqueId.has(uid)) continue;
    byUniqueId.set(uid, mapDbRowToComponentTemplateData(row));
  }
  return Array.from(byUniqueId.values()).sort((a, b) =>
    (b.updatedAt || '').localeCompare(a.updatedAt || '')
  );
};

/**
 * Supabaseからコンポーネントテンプレートを取得（リリース版のみ、unique_id 最新版）
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
      .order('version', { ascending: false });

    if (error) {
      console.error('Error fetching component templates from Supabase:', error);
      return [];
    }

    return dedupeTemplatesByUniqueId(data || []);
  } catch (error) {
    console.error('Error in getComponentTemplatesFromSupabase:', error);
    return [];
  }
};

/**
 * 組み込み React バリアントが未登録なら Supabase に投入（ローカル開発用ブートストラップ）
 */
export const ensureReactVariantsSeeded = async (): Promise<void> => {
  if (!supabase) return;

  const basePayload = (seed: (typeof REACT_VARIANT_SEEDS)[number]) => ({
    name: seed.nameRomanized,
    name_romanized: seed.nameRomanized,
    display_name: seed.displayName,
    category: seed.category,
    category_romanized: seed.categoryRomanized,
    unique_id: seed.uniqueId,
    section_id: seed.sectionId,
    thumbnail_url: seed.thumbnailUrl,
    description: seed.description,
    code_template: '',
    html_markup: '',
    default_props: seed.defaultProps,
    prop_schema: [],
    style_schema: [],
    css_files: seed.cssFiles,
    js_files: seed.jsFiles,
    is_active: true,
    is_draft: false,
    version: 1,
    parent_id: null,
  });

  try {
    for (const seed of REACT_VARIANT_SEEDS) {
      const { data: existing } = await supabase
        .from('component_templates')
        .select('id, is_draft')
        .eq('unique_id', seed.uniqueId)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        if (!existing.is_draft) continue;
        await releaseComponentTemplate(existing.id as string);
        continue;
      }

      const withMode = {
        ...basePayload(seed),
        render_mode: 'react',
        component_type: seed.componentType,
      };

      let insertError = (
        await supabase.from('component_templates').insert(withMode)
      ).error;

      if (insertError?.message?.includes('render_mode')) {
        insertError = (await supabase.from('component_templates').insert(basePayload(seed)))
          .error;
      }

      if (insertError) {
        console.warn(`ensureReactVariantsSeeded: failed for ${seed.uniqueId}`, insertError);
      }
    }
  } catch (e) {
    console.warn('ensureReactVariantsSeeded', e);
  }
};

export type ManagedTemplateFilter = 'all' | 'released' | 'draft';

/**
 * テンプレート管理画面用: unique_id ごとに最新バージョン1件を返す
 */
export const getManagedComponentTemplatesFromSupabase = async (
  filter: ManagedTemplateFilter = 'all'
): Promise<ComponentTemplateData[]> => {
  if (!supabase) return [];

  try {
    let query = supabase
      .from('component_templates')
      .select('*')
      .eq('is_active', true)
      .order('version', { ascending: false });

    if (filter === 'released') {
      query = query.eq('is_draft', false);
    } else if (filter === 'draft') {
      query = query.eq('is_draft', true);
    }

    const { data, error } = await query;
    if (error) {
      console.error('getManagedComponentTemplatesFromSupabase:', error);
      return [];
    }

    const byUniqueId = new Map<string, ComponentTemplateData>();
    for (const row of data || []) {
      const uid = row.unique_id as string;
      if (!uid || byUniqueId.has(uid)) continue;
      byUniqueId.set(uid, mapDbRowToComponentTemplateData(row as Record<string, unknown>));
    }

    return Array.from(byUniqueId.values()).sort((a, b) =>
      (b.updatedAt || '').localeCompare(a.updatedAt || '')
    );
  } catch (e) {
    console.error('getManagedComponentTemplatesFromSupabase', e);
    return [];
  }
};

/** 編集用: unique_id の最新バージョンを ComponentTemplateData で取得 */
export const getLatestComponentTemplateByUniqueId = async (
  uniqueId: string
): Promise<ComponentTemplateData | null> => {
  const row = await fetchLatestComponentTemplateRowByUniqueId(uniqueId);
  if (!row) return null;
  return mapDbRowToComponentTemplateData(row);
};

/**
 * Supabaseにコンポーネントテンプレートを保存（ドラフト版として）
 */
export const saveComponentTemplateToSupabase = async (
  template: Omit<ComponentTemplateData, 'id' | 'createdAt' | 'updatedAt' | 'supabaseId'>,
  isDraft: boolean = true
): Promise<ComponentTemplateData | null> => {
  if (!supabase) {
    console.warn('Supabase is not configured');
    return null;
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
        html_markup: template.htmlMarkup ?? '',
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
        render_mode: template.renderMode ?? 'dynamic',
        component_type: template.componentType ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving component template to Supabase:', error);
      return null;
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
    return null;
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
 * 同一 logical テンプレートの最新バージョン行（Realtime 反映・描画用）
 */
export const fetchLatestComponentTemplateRowByUniqueId = async (
  uniqueId: string
): Promise<Record<string, any> | null> => {
  if (!supabase || !uniqueId) return null;
  try {
    const { data, error } = await supabase
      .from('component_templates')
      .select('*')
      .eq('unique_id', uniqueId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('fetchLatestComponentTemplateRowByUniqueId:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.error('fetchLatestComponentTemplateRowByUniqueId', e);
    return null;
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

    return mapDbRowToComponentTemplateData(data as Record<string, unknown>);
  } catch (error) {
    console.error('Error in getComponentTemplateByVersion:', error);
    return null;
  }
};
