// コンポーネントエディタのレジストリ

import { ComponentType } from '../../../types';
import { BaseEditorProps } from './BaseEditor';
import { HeadlineEditor } from './HeadlineEditor';
import { KVEditor } from './KVEditor';
import { FAQEditor } from './FAQEditor';
import { FooterEditor } from './FooterEditor';
import { PricingEditor } from './PricingEditor';
import { AppIntroEditor } from './AppIntroEditor';
import React from 'react';

export type ComponentEditor = React.FC<BaseEditorProps>;

/**
 * コンポーネントタイプごとのエディタマッピング
 * 新しいコンポーネントエディタを追加する場合は、ここに登録する
 */
export const componentEditors: Partial<Record<ComponentType, ComponentEditor>> = {
  'headline': HeadlineEditor,
  'kv': KVEditor,
  'test': FAQEditor,
  'footer': FooterEditor,
  'pricing': PricingEditor,
  'app-intro': AppIntroEditor,
};

/**
 * コンポーネントタイプに対応するエディタを取得
 * コンポーネントビルダーで作成されたコンポーネントなど、未登録のタイプの場合はnullを返す
 */
export const getComponentEditor = (type: ComponentType): ComponentEditor | null => {
  return componentEditors[type] || null;
};
