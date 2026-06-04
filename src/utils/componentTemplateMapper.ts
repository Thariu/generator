import { REACT_VARIANT_SEEDS } from '../data/reactVariantSeeds';
import type { ComponentTemplateData, RenderMode } from './componentTemplateStorage';

const BUILTIN_UNIQUE_IDS = new Set(REACT_VARIANT_SEEDS.map((s) => s.uniqueId));

function inferRenderMode(item: Record<string, unknown>): RenderMode {
  const mode = item.render_mode as string | undefined;
  if (mode === 'react' || mode === 'dynamic') return mode;

  if (item.component_type) return 'react';

  const uniqueId = item.unique_id as string | undefined;
  if (uniqueId && BUILTIN_UNIQUE_IDS.has(uniqueId)) return 'react';

  const html = (item.html_markup as string) || '';
  if (html.trim()) return 'dynamic';

  return 'dynamic';
}

function inferComponentType(item: Record<string, unknown>): string | undefined {
  if (item.component_type) return item.component_type as string;
  const uniqueId = item.unique_id as string | undefined;
  return REACT_VARIANT_SEEDS.find((s) => s.uniqueId === uniqueId)?.componentType;
}

export interface PropFieldLike {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'link' | 'image' | 'color' | 'backgroundColor' | 'colorBoth' | 'array' | 'visibility';
  label: string;
  defaultValue: unknown;
  description?: string;
  arrayFieldName?: string;
  arrayParentId?: string;
}

const PROP_TYPES = new Set<PropFieldLike['type']>([
  'text',
  'textarea',
  'link',
  'image',
  'color',
  'backgroundColor',
  'colorBoth',
  'array',
  'visibility',
]);

export function mapDbRowToComponentTemplateData(item: Record<string, unknown>): ComponentTemplateData {
  return {
    id: item.id as string,
    supabaseId: item.id as string,
    name: (item.name_romanized || item.name) as string,
    nameRomanized: (item.name_romanized || item.name) as string,
    displayName: item.display_name as string,
    category: item.category as string,
    categoryRomanized: (item.category_romanized || String(item.category).toLowerCase()) as string,
    uniqueId: item.unique_id as string,
    sectionId: (item.section_id || `${item.unique_id}Area`) as string,
    thumbnailUrl: item.thumbnail_url as string | undefined,
    description: item.description as string | undefined,
    codeTemplate: (item.code_template || '') as string,
    htmlMarkup: (item.html_markup as string) ?? undefined,
    defaultProps: (item.default_props as Record<string, unknown>) || {},
    propSchema: (item.prop_schema as unknown[]) || [],
    styleSchema: (item.style_schema as unknown[]) || [],
    cssFiles: (item.css_files as string[]) || [],
    jsFiles: (item.js_files as string[]) || [],
    customCssCode: item.custom_css_code as string | undefined,
    isActive: item.is_active !== false,
    version: (item.version as number) || 1,
    isDraft: Boolean(item.is_draft),
    parentId: item.parent_id as string | undefined,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    renderMode: inferRenderMode(item),
    componentType: inferComponentType(item),
  };
}

/** prop_schema からビルダー用 propFields を復元（編集モード） */
export function propSchemaToPropFields(schema: unknown[]): PropFieldLike[] {
  if (!Array.isArray(schema)) return [];
  return schema.map((raw, index) => {
    const s = raw as Record<string, unknown>;
    const type = PROP_TYPES.has(s.type as PropFieldLike['type'])
      ? (s.type as PropFieldLike['type'])
      : 'text';
    return {
      id: `prop_edit_${index}_${Date.now()}`,
      name: String(s.name ?? ''),
      type,
      label: String(s.label ?? s.name ?? ''),
      defaultValue: s.defaultValue,
      description: s.description != null ? String(s.description) : undefined,
    };
  });
}
