import { create } from 'zustand';

/** Supabase 由来の dynamic-template 1件分（fetch / ポーリングで更新） */
export interface DynamicTemplateRowSlice {
  htmlMarkup: string;
  sectionId: string;
  customCssCode?: string;
  cssFiles: string[];
  jsFiles: string[];
  supabaseRowId: string;
  /** 変更検知用（Supabase updated_at） */
  updatedAt?: string;
}

interface DynamicTemplateRowState {
  rowsByUniqueId: Record<string, DynamicTemplateRowSlice>;
  setRow: (uniqueId: string, slice: DynamicTemplateRowSlice) => void;
}

export const useDynamicTemplateRowStore = create<DynamicTemplateRowState>((set) => ({
  rowsByUniqueId: {},
  setRow: (uniqueId, slice) =>
    set((state) => ({
      rowsByUniqueId: { ...state.rowsByUniqueId, [uniqueId]: slice },
    })),
}));
