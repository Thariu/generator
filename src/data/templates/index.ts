import { ComponentTemplate } from '../types';
import { kv1Template } from './kv/kv-1';
import { pricing1Template } from './pricing/pricing-1';
import { appIntro1Template } from './app-intro/app-intro-1';
import { faq1Template } from './test/faq-1';

/**
 * すべてのコンポーネントテンプレートを一覧で取得
 * 
 * 新しいコンポーネントを追加する場合:
 * 1. 適切なディレクトリ（または新規作成）にコンポーネントファイルを作成
 * 2. このファイルにインポートを追加
 * 3. componentTemplates配列に追加
 * 
 * 例:
 * import { newComponentTemplate } from './category/new-component';
 * export const componentTemplates: ComponentTemplate[] = [
 *   ...,
 *   newComponentTemplate,
 * ];
 */
export const componentTemplates: ComponentTemplate[] = [
  kv1Template,
  pricing1Template,
  appIntro1Template,
  faq1Template,
];
