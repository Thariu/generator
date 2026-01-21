// コンポーネントエディタのレジストリ

import { ComponentType } from '../../../types';
import { BaseEditorProps } from './BaseEditor';
import { HeadlineEditor } from './headline/HeadlineEditor';
import { KVEditor } from './kv/KVEditor';
import { FAQEditor } from './test/FAQEditor';
import { FooterEditor } from './footer/FooterEditor';
import { PricingEditor } from './pricing/PricingEditor';
import { AppIntroEditor } from './streaming/AppIntroEditor';
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
