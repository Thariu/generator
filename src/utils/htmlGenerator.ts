// HTML generation utilities for component export
import { ComponentData } from '../types';
import { componentTemplates } from '../data/componentTemplates';
import { getComponentTemplates } from './componentTemplateStorage';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { usePageStore } from '../store/usePageStore';
import { getComponentName } from './componentRegistry';

// カテゴリ名からCSSファイル名を生成
const generateCSSFileName = (category: string): string => {
  // カテゴリ名を小文字にして、スペースや特殊文字をハイフンに変換
  return category
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '') + '.css';
};

// カテゴリとCSSファイルのマッピング（既存のカテゴリ）
const PREDEFINED_CATEGORY_CSS_MAP: Record<string, string> = {
  'KV': 'kv.css',
  '料金': 'pricing.css',
  '番組配信': 'app-intro.css',
  'FAQ': 'faq.css',
  'footer': 'footer.css'
};

// カテゴリからCSSファイル名を取得（動的生成対応）
const getCSSFileNameForCategory = (category: string): string => {
  // 既存のマッピングがあればそれを使用
  if (PREDEFINED_CATEGORY_CSS_MAP[category]) {
    return PREDEFINED_CATEGORY_CSS_MAP[category];
  }
  // なければカテゴリ名から自動生成
  return generateCSSFileName(category);
};

// コンポーネントタイプからカテゴリを取得
export const getCategoryFromComponentType = (type: string): string | null => {
  const template = componentTemplates.find(t => t.type === type);
  if (template) {
    return template.category;
  }
  // カスタムテンプレートも確認
  const customTemplates = getComponentTemplates();
  const customTemplate = customTemplates.find(t => t.name === type || t.uniqueId === type);
  return customTemplate?.category || null;
};

// 使用されているコンポーネントからCSSファイルのリストを生成
export const getRequiredCSSFiles = (components: ComponentData[]): string[] => {
  const cssFiles = new Set<string>();

  components.forEach(component => {
    // componentTemplates.tsから直接cssFilesを取得
    const template = componentTemplates.find(t => t.type === component.type);
    if (template && (template as any).cssFiles) {
      (template as any).cssFiles.forEach((file: string) => cssFiles.add(file));
    }
    
    // カスタムテンプレートも確認
    const customTemplates = getComponentTemplates();
    const customTemplate = customTemplates.find(t => {
      const templateType = t.name.replace('Component', '').toLowerCase();
      return templateType === component.type || t.uniqueId === component.type;
    });
    if (customTemplate?.cssFiles) {
      customTemplate.cssFiles.forEach((file: string) => cssFiles.add(file));
    }
    
    // フォールバック: カテゴリからCSSファイル名を生成（既存のロジック）
    const category = getCategoryFromComponentType(component.type);
    if (category && !template && !customTemplate) {
      const cssFileName = getCSSFileNameForCategory(category);
      cssFiles.add(cssFileName);
    }
  });

  // 共通CSSとcomponent-common.cssは常に含める
  return ['common.css', 'component-common.css', ...Array.from(cssFiles)];
};

// CSSリンクタグを生成
export const generateCSSLinks = (cssFiles: string[]): string => {
  return cssFiles
    .map(file => `  <link rel="stylesheet" href="/program/st/promo/generator_common/css/${file}">`)
    .join('\n');
};

// ============================================
// Reactコンポーネントから直接HTMLを生成する機能
// ============================================

// コンポーネント名からコンポーネントを取得するマッピングオブジェクト
// ComponentRendererと同じロジックを使用
const componentModules = import.meta.glob('../components/Components/*.tsx', { 
  eager: true,
  import: 'default'
}) as Record<string, React.ComponentType<any>>;

const componentMap: Record<string, React.ComponentType<any>> = {};

Object.keys(componentModules).forEach((path) => {
  try {
    const fileName = path.split('/').pop() || '';
    const componentName = fileName.replace(/\.tsx$/, '');
    
    if (componentName && componentModules[path]) {
      componentMap[componentName] = componentModules[path];
    }
  } catch (error) {
    console.warn(`Failed to load component from ${path}:`, error);
  }
});

// uniqueIdからコンポーネント名を取得（ComponentRendererと同じロジック）
const getComponentNameFromUniqueId = (uniqueId: string): string => {
  // uniqueIdの形式: "test10_btn" -> "Test10BtnComponent"
  const parts = uniqueId.split('_');
  const componentName = parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Component';
  return componentName;
};

// コンポーネントタイプからコンポーネント名を取得（componentRegistryからインポート）
import { COMPONENT_TYPE_MAP, getComponentName } from './componentRegistry';

/**
 * ReactコンポーネントをHTML文字列に変換
 * コンポーネントを一時的なDOM要素にレンダリングしてHTMLを取得
 */
const renderComponentToHTML = async (
  component: ComponentData,
  globalStyles: any
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // 一時的なDOM要素を作成
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.visibility = 'hidden';
      document.body.appendChild(tempContainer);

      // コンポーネントを解決
      let ComponentToRender: React.ComponentType<any> | null = null;

      // templateIdに基づいて適切なコンポーネントを判定
      if (component.templateId) {
        let componentName: string | null = null;
        
        // componentTemplates.tsから該当するテンプレートを取得
        const template = componentTemplates.find(t => t.id === component.templateId || t.uniqueId === component.templateId);
        
        if (template) {
          // uniqueIdからコンポーネント名を推測
          const uniqueId = template.uniqueId || template.id;
          componentName = getComponentNameFromUniqueId(uniqueId);
        } else {
          // テンプレートが見つからない場合、templateIdを直接uniqueIdとして使用
          componentName = getComponentNameFromUniqueId(component.templateId);
        }
        
        if (componentName && componentMap[componentName]) {
          ComponentToRender = componentMap[componentName];
        }
      }

      // templateIdで解決できない場合、typeから解決
      if (!ComponentToRender) {
        const componentName = getComponentName(component.type);
        if (componentName && componentMap[componentName]) {
          ComponentToRender = componentMap[componentName];
        }
      }

      if (!ComponentToRender) {
        document.body.removeChild(tempContainer);
        resolve(`<div><!-- Unsupported component type: ${component.type} --></div>`);
        return;
      }

      // グローバルスタイルをコンポーネントに渡すためにpageDataを一時的に更新
      const originalPageData = usePageStore.getState().pageData;
      
      // 一時的にpageDataを更新（グローバルスタイルを含む）
      usePageStore.setState({
        pageData: {
          ...originalPageData,
          globalStyles: globalStyles || originalPageData.globalStyles,
        }
      });

      // Reactコンポーネントをレンダリング
      const root = createRoot(tempContainer);
      
      root.render(
        React.createElement(ComponentToRender, {
          component,
          isEditing: false,
        })
      );

      // レンダリング完了を待つ（React 18の非同期レンダリングに対応）
      // requestAnimationFrameを2回使用してレンダリング完了を確実に待機
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // さらに少し待機して、すべての副作用が完了するのを待つ
          setTimeout(() => {
            try {
              // HTMLを取得
              const html = tempContainer.innerHTML;
              
              // クリーンアップ
              root.unmount();
              document.body.removeChild(tempContainer);
              
              // 元のpageDataを復元
              usePageStore.setState({ pageData: originalPageData });
              
              resolve(html);
            } catch (error) {
              // エラー時もクリーンアップ
              try {
                root.unmount();
              } catch {}
              try {
                document.body.removeChild(tempContainer);
              } catch {}
              usePageStore.setState({ pageData: originalPageData });
              reject(error);
            }
          }, 50); // 50ms待機して副作用の完了を確実にする
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * コンポーネントのHTMLを生成（非同期版）
 * Reactコンポーネントから直接HTMLを生成
 */
export const generateComponentHTMLAsync = async (
  component: ComponentData,
  globalStyles: any
): Promise<string> => {
  return renderComponentToHTML(component, globalStyles);
};