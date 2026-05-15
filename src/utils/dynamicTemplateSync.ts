/**
 * Free プラン向け: Realtime 不要の dynamic-template 同期（ポーリング + 可視時再取得）
 */
import { usePageStore } from '../store/usePageStore';
import { useDynamicTemplateRowStore, DynamicTemplateRowSlice } from '../store/dynamicTemplateRowStore';
import { fetchLatestComponentTemplateRowByUniqueId } from './componentTemplateStorage';
import { supabase } from '../lib/supabase';

/** タブ表示中のポーリング間隔（ms） */
export const DYNAMIC_TEMPLATE_POLL_INTERVAL_MS = 15_000;

function rowToSlice(row: Record<string, any>): DynamicTemplateRowSlice {
  return {
    htmlMarkup: row.html_markup ?? '',
    sectionId: row.section_id ?? '',
    customCssCode: row.custom_css_code ?? undefined,
    cssFiles: row.css_files ?? [],
    jsFiles: row.js_files ?? [],
    supabaseRowId: row.id,
    updatedAt: row.updated_at ?? undefined,
  };
}

function sliceFromLocalData(data: {
  htmlMarkup?: string;
  sectionId?: string;
  customCssCode?: string;
  cssFiles?: string[];
  jsFiles?: string[];
  supabaseRowId: string;
  updatedAt?: string;
}): DynamicTemplateRowSlice {
  return {
    htmlMarkup: data.htmlMarkup ?? '',
    sectionId: data.sectionId ?? '',
    customCssCode: data.customCssCode,
    cssFiles: data.cssFiles ?? [],
    jsFiles: data.jsFiles ?? [],
    supabaseRowId: data.supabaseRowId,
    updatedAt: data.updatedAt,
  };
}

function rowFingerprint(row: Record<string, any>): string {
  return JSON.stringify({
    id: row.id,
    updated_at: row.updated_at,
    default_props: row.default_props,
    html_markup: row.html_markup,
  });
}

/** 変更がなければ props 同期をスキップ（ポーリング負荷軽減） */
const lastAppliedFingerprint = new Map<string, string>();

/**
 * DB 行またはローカルデータをクライアントに反映（B: props を default_props で上書き）
 */
export function applyTemplateRow(
  uniqueId: string,
  row: Record<string, any> | null,
  options?: { force?: boolean }
): void {
  if (!row) return;

  const fp = rowFingerprint(row);
  if (!options?.force && lastAppliedFingerprint.get(uniqueId) === fp) {
    return;
  }
  lastAppliedFingerprint.set(uniqueId, fp);

  const slice = rowToSlice(row);
  useDynamicTemplateRowStore.getState().setRow(uniqueId, slice);
  usePageStore
    .getState()
    .syncDynamicTemplateInstancesFromRemote(uniqueId, row.default_props ?? {}, row.id);
}

/** ローカル保存直後用（Supabase 未設定時） */
export function applyTemplateFromLocalPayload(
  uniqueId: string,
  payload: {
    htmlMarkup: string;
    sectionId: string;
    customCssCode?: string;
    cssFiles: string[];
    jsFiles: string[];
    defaultProps: Record<string, unknown>;
    rowId: string;
    updatedAt?: string;
  }
): void {
  const slice = sliceFromLocalData({
    htmlMarkup: payload.htmlMarkup,
    sectionId: payload.sectionId,
    customCssCode: payload.customCssCode,
    cssFiles: payload.cssFiles,
    jsFiles: payload.jsFiles,
    supabaseRowId: payload.rowId,
    updatedAt: payload.updatedAt,
  });
  useDynamicTemplateRowStore.getState().setRow(uniqueId, slice);

  const fp = JSON.stringify({
    id: payload.rowId,
    updated_at: payload.updatedAt,
    default_props: payload.defaultProps,
    html_markup: payload.htmlMarkup,
  });
  lastAppliedFingerprint.set(uniqueId, fp);

  usePageStore
    .getState()
    .syncDynamicTemplateInstancesFromRemote(uniqueId, payload.defaultProps, payload.rowId);
}

/** Supabase から最新行を取得して反映 */
export async function fetchAndApplyTemplateByUniqueId(
  uniqueId: string,
  options?: { force?: boolean }
): Promise<boolean> {
  if (!supabase || !uniqueId) return false;
  const row = await fetchLatestComponentTemplateRowByUniqueId(uniqueId);
  if (!row) return false;
  applyTemplateRow(uniqueId, row, options);
  return true;
}

const refCounts = new Map<string, number>();
const intervalsByUniqueId = new Map<string, ReturnType<typeof setInterval>>();
const visibilityHandlersByUniqueId = new Map<string, () => void>();

function startPollingForUniqueId(uniqueId: string): void {
  if (!supabase) return;

  const poll = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }
    void fetchAndApplyTemplateByUniqueId(uniqueId);
  };

  void fetchAndApplyTemplateByUniqueId(uniqueId);

  const intervalId = setInterval(poll, DYNAMIC_TEMPLATE_POLL_INTERVAL_MS);
  intervalsByUniqueId.set(uniqueId, intervalId);

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      void fetchAndApplyTemplateByUniqueId(uniqueId, { force: true });
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  visibilityHandlersByUniqueId.set(uniqueId, onVisibility);
}

function stopPollingForUniqueId(uniqueId: string): void {
  const intervalId = intervalsByUniqueId.get(uniqueId);
  if (intervalId) {
    clearInterval(intervalId);
    intervalsByUniqueId.delete(uniqueId);
  }
  const onVisibility = visibilityHandlersByUniqueId.get(uniqueId);
  if (onVisibility) {
    document.removeEventListener('visibilitychange', onVisibility);
    visibilityHandlersByUniqueId.delete(uniqueId);
  }
}

/**
 * キャンバス上の dynamic-template 用: 初回 fetch + ポーリング + タブ復帰時再取得
 * （Free プラン: Realtime publication 不要）
 */
export function subscribeDynamicTemplateSync(uniqueId: string | undefined): () => void {
  if (!uniqueId || !supabase) {
    return () => undefined;
  }

  const prev = refCounts.get(uniqueId) ?? 0;
  refCounts.set(uniqueId, prev + 1);

  if (prev === 0) {
    startPollingForUniqueId(uniqueId);
  }

  return () => {
    const next = (refCounts.get(uniqueId) ?? 1) - 1;
    if (next <= 0) {
      refCounts.delete(uniqueId);
      stopPollingForUniqueId(uniqueId);
    } else {
      refCounts.set(uniqueId, next);
    }
  };
}

/** 保存直後など: 即時反映（ポーリング待ち不要） */
export function refreshDynamicTemplateNow(uniqueId: string, force = true): void {
  if (supabase) {
    void fetchAndApplyTemplateByUniqueId(uniqueId, { force });
  }
}
