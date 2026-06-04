/**
 * Supabase 駆動のテンプレートカタログ（ライブラリ・描画・HTML 生成の単一参照源）
 * 組み込み React バリアントは Supabase が空でも常にマージする
 */
import {
  builtinReactVariantsAsTemplateData,
  resolveLegacyTemplateId,
} from '../data/reactVariantSeeds';
import type { ComponentTemplate } from '../types';
import type { ComponentData } from '../types';
import type { ComponentType } from './componentRegistry';
import {
  ensureReactVariantsSeeded,
  getComponentTemplates,
  getComponentTemplatesFromSupabase,
  type ComponentTemplateData,
} from './componentTemplateStorage';

let catalogCache: ComponentTemplateData[] = [];

export const setCatalogCache = (items: ComponentTemplateData[]): void => {
  catalogCache = items;
};

export const getCatalogCache = (): ComponentTemplateData[] => catalogCache;

/** 組み込み + Supabase + localStorage を unique_id でマージ（Supabase 優先） */
export const mergeCatalogRows = (
  supabaseRows: ComponentTemplateData[]
): ComponentTemplateData[] => {
  const byUniqueId = new Map<string, ComponentTemplateData>();

  for (const builtin of builtinReactVariantsAsTemplateData()) {
    byUniqueId.set(builtin.uniqueId, builtin);
  }

  for (const row of supabaseRows) {
    if (!row.uniqueId) continue;
    const prev = byUniqueId.get(row.uniqueId);
    byUniqueId.set(row.uniqueId, prev ? { ...prev, ...row } : row);
  }

  try {
    const localRows = getComponentTemplates().filter((t) => t.isActive);
    for (const row of localRows) {
      if (!row.uniqueId || byUniqueId.has(row.uniqueId)) continue;
      const renderMode =
        row.renderMode ?? (row.htmlMarkup?.trim() ? 'dynamic' : undefined);
      byUniqueId.set(row.uniqueId, {
        ...row,
        renderMode: renderMode ?? 'dynamic',
        componentType: row.componentType,
      });
    }
  } catch {
    // ignore localStorage errors
  }

  return Array.from(byUniqueId.values()).sort((a, b) =>
    (a.category || '').localeCompare(b.category || '', 'ja')
  );
};

export const componentTemplateDataToLibraryItem = (
  item: ComponentTemplateData
): ComponentTemplate => {
  const isReact = item.renderMode === 'react' && item.componentType;
  return {
    id: item.supabaseId || item.id,
    name: item.displayName,
    description: item.description || '',
    category: item.category,
    type: (isReact ? item.componentType : 'dynamic-template') as ComponentType,
    thumbnail: item.thumbnailUrl || '',
    defaultProps: item.defaultProps || {},
    uniqueId: item.uniqueId,
    cssFiles: item.cssFiles,
    jsFiles: item.jsFiles,
    sectionId: item.sectionId,
    templateUniqueId: item.uniqueId,
    renderMode: item.renderMode,
    componentType: item.componentType,
  };
};

/** リリース済みテンプレートを読み込みキャッシュを更新（組み込みバリアントは常に含む） */
export const loadReleasedCatalog = async (): Promise<ComponentTemplate[]> => {
  await ensureReactVariantsSeeded();
  const supabaseRows = await getComponentTemplatesFromSupabase();
  const merged = mergeCatalogRows(supabaseRows);
  setCatalogCache(merged);
  return merged.map(componentTemplateDataToLibraryItem);
};

export const getCatalogRowByUniqueId = (
  uniqueId: string
): ComponentTemplateData | undefined => {
  const resolved = resolveLegacyTemplateId(uniqueId);
  return catalogCache.find((t) => t.uniqueId === resolved || t.uniqueId === uniqueId);
};

export const getCatalogRowById = (id: string): ComponentTemplateData | undefined => {
  const direct = catalogCache.find((t) => t.id === id || t.supabaseId === id);
  if (direct) return direct;

  const legacyUid = resolveLegacyTemplateId(id);
  if (legacyUid !== id) {
    return getCatalogRowByUniqueId(legacyUid);
  }
  return undefined;
};

export const getCatalogRowForComponent = (
  component: ComponentData
): ComponentTemplateData | undefined => {
  if (component.templateUniqueId) {
    return getCatalogRowByUniqueId(component.templateUniqueId);
  }
  if (component.templateId) {
    return getCatalogRowById(component.templateId);
  }
  if (component.type !== 'dynamic-template') {
    return catalogCache.find(
      (t) => t.renderMode === 'react' && t.componentType === component.type
    );
  }
  return undefined;
};

export const getCssFilesForComponent = (component: ComponentData): string[] => {
  const row = getCatalogRowForComponent(component);
  return row?.cssFiles ?? [];
};

/** モジュール読み込み時点で組み込みバリアントをキャッシュ（非同期取得前の描画・ライブラリ用） */
setCatalogCache(mergeCatalogRows([]));
