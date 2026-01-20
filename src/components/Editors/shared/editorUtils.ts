// エディタの共通ユーティリティ関数

import React from 'react';

/**
 * ネストされたプロパティの値を取得（例: 'broadcastInfo.streamingBadgeText'）
 */
export const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);
};

/**
 * ネストされたプロパティの値を更新
 */
export const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  if (keys.length === 0) {
    // トップレベルのプロパティ
    return { ...obj, [lastKey]: value };
  }
  
  // ネストされたプロパティを再帰的に更新
  const result = { ...obj };
  let current = result;
  
  // 中間のキーをたどる
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] || {}) };
    current = current[key];
  }
  
  // 最後のキーに値を設定
  const lastParentKey = keys[keys.length - 1];
  current[lastParentKey] = { ...(current[lastParentKey] || {}), [lastKey]: value };
  
  return result;
};

/**
 * フォーカスハンドラーを作成
 */
export const createFocusHandler = () => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  (e.target as HTMLElement).style.borderColor = '#2563eb';
  (e.target as HTMLElement).style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.1)';
};

/**
 * ブラーハンドラーを作成
 */
export const createBlurHandler = () => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  (e.target as HTMLElement).style.borderColor = '#d1d5db';
  (e.target as HTMLElement).style.boxShadow = 'none';
};
