import React, { useEffect, useRef } from 'react';
import { ComponentData } from '../../types';
import { usePageStore } from '../../store/usePageStore';
import { componentTemplates } from '../../data/componentTemplates';
import { getComponentTemplates } from '../../utils/componentTemplateStorage';
import { getComponentName } from '../../utils/componentRegistry';

interface ComponentRendererProps {
  component: ComponentData;
}

// グローバルに読み込まれたCSSファイルを追跡（重複読み込みを防ぐ）
const loadedCssFiles = new Set<string>();

// コンポーネント名からコンポーネントを取得するマッピングオブジェクト
// 動的インポートで対応するコンポーネントを自動解決するために使用
// import.meta.globを使用してComponentsディレクトリ内のすべてのコンポーネントを自動的にインポート
const componentModules = import.meta.glob('../Components/*.tsx', { 
  eager: true,
  import: 'default'
}) as Record<string, React.ComponentType<any>>;

// ファイル名からコンポーネント名を推測してcomponentMapを自動構築
const componentMap: Record<string, React.ComponentType<any>> = {};

Object.keys(componentModules).forEach((path) => {
  try {
    // パスからファイル名を取得（例：../Components/Test10CComponent.tsx -> Test10CComponent.tsx）
    const fileName = path.split('/').pop() || '';
    // ファイル名から拡張子を除去（例：Test10CComponent.tsx -> Test10CComponent）
    const componentName = fileName.replace(/\.tsx$/, '');
    
    // コンポーネント名が有効な場合（空文字列でない場合）のみマッピングに追加
    if (componentName && componentModules[path]) {
      componentMap[componentName] = componentModules[path];
    }
  } catch (error) {
    console.warn(`Failed to load component from ${path}:`, error);
  }
});

// デバッグ用：読み込まれたコンポーネントを確認
console.log('Loaded components:', Object.keys(componentMap));

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component }) => {
  const { showClassNames } = usePageStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // コンポーネントのテンプレート情報を取得してCSSファイルを読み込む
  useEffect(() => {
    if (!component || !component.type) {
      return;
    }

    try {
      // componentTemplates.tsから取得
      const template = componentTemplates.find(t => t.type === component.type);
      
      // localStorageからも取得（カスタムテンプレート）
      const customTemplates = getComponentTemplates();
      const customTemplate = customTemplates.find(t => {
        const templateType = t.name.replace('Component', '').toLowerCase();
        return templateType === component.type;
      });

      // cssFilesを取得（componentTemplates.tsを優先、型定義にcssFilesがない場合はanyでキャスト）
      const cssFiles = (template as any)?.cssFiles || customTemplate?.cssFiles || [];

      // CSSファイルを動的に読み込む
      cssFiles.forEach((cssFile: string) => {
        if (!cssFile || loadedCssFiles.has(cssFile)) {
          return; // 既に読み込まれている場合はスキップ
        }

        // 既に同じCSSファイルが読み込まれているかチェック
        const existingLink = document.head.querySelector(
          `link[href="/program/st/promo/generator_common/css/${cssFile}"]`
        );
        
        if (existingLink) {
          loadedCssFiles.add(cssFile);
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/program/st/promo/generator_common/css/${cssFile}`;
        link.setAttribute('data-component-css', component.id);
        document.head.appendChild(link);
        loadedCssFiles.add(cssFile);
      });
    } catch (error) {
      console.error('CSSファイルの読み込みに失敗しました:', error);
    }
  }, [component?.type, component?.id]);

  const commonProps = {
    component,
    isEditing: false,
  };

  useEffect(() => {
    if (!showClassNames || !containerRef.current) return;

    const container = containerRef.current;
    const overlays: HTMLDivElement[] = [];

    const classPatterns = [
      { pattern: /mainColor/i, label: 'mainColor', color: '#dc2626' },
      { pattern: /baseColor/i, label: 'baseColor', color: '#3b82f6' },
      { pattern: /base2Color/i, label: 'base2Color', color: '#8b5cf6' },
      { pattern: /accentColor/i, label: 'accentColor', color: '#f59e0b' },
      { pattern: /commonColor/i, label: 'commonColor', color: '#10b981' },
    ];

    const elements = container.querySelectorAll('*');

    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const classList = Array.from(htmlElement.classList);

      classPatterns.forEach(({ pattern, label, color }) => {
        const matchingClasses = classList.filter(cls => pattern.test(cls));

        if (matchingClasses.length > 0) {
          const rect = htmlElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const overlay = document.createElement('div');
          overlay.style.position = 'absolute';
          overlay.style.top = `${rect.top - containerRect.top}px`;
          overlay.style.left = `${rect.left - containerRect.left}px`;
          overlay.style.width = `${rect.width}px`;
          overlay.style.height = `${rect.height}px`;
          overlay.style.border = `2px dashed ${color}`;
          overlay.style.backgroundColor = `${color}15`;
          overlay.style.pointerEvents = 'none';
          overlay.style.zIndex = '1000';
          overlay.style.borderRadius = '4px';

          const labelDiv = document.createElement('div');
          labelDiv.textContent = matchingClasses.join(', ');
          labelDiv.style.position = 'absolute';
          labelDiv.style.top = '-24px';
          labelDiv.style.left = '0';
          labelDiv.style.backgroundColor = color;
          labelDiv.style.color = '#ffffff';
          labelDiv.style.padding = '2px 8px';
          labelDiv.style.fontSize = '11px';
          labelDiv.style.fontWeight = '600';
          labelDiv.style.borderRadius = '4px';
          labelDiv.style.whiteSpace = 'nowrap';
          labelDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

          overlay.appendChild(labelDiv);
          container.appendChild(overlay);
          overlays.push(overlay);
        }
      });
    });

    return () => {
      overlays.forEach(overlay => overlay.remove());
    };
  }, [showClassNames]);

  // uniqueIdからコンポーネント名を推測する関数
  const getComponentNameFromUniqueId = (uniqueId: string): string => {
    // uniqueIdの形式: {categoryRomanized}_{componentNameRomanized}
    // 例: test10_btn -> Test10BtnComponent, test10_a -> Test10AComponent
    const parts = uniqueId.split('_');
    if (parts.length < 2) {
      return '';
    }
    
    // カテゴリ部分とコンポーネント名部分を取得
    const componentNamePart = parts.slice(1).join('_'); // 複数のアンダースコアに対応
    
    // コンポーネント名をパスカルケースに変換
    const componentName = componentNamePart
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    
    // カテゴリ名もパスカルケースに変換
    const categoryPart = parts[0];
    const categoryName = categoryPart
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    
    return `${categoryName}${componentName}Component`;
  };

  const renderComponent = () => {
    // templateIdに基づいて適切なコンポーネントを判定（同じカテゴリ内の複数コンポーネント対応）
    if (component.templateId) {
      let componentName: string | null = null;
      
      // componentTemplates.tsから該当するテンプレートを取得
      const template = componentTemplates.find(t => t.id === component.templateId || t.uniqueId === component.templateId);
      
      if (template) {
        // uniqueIdからコンポーネント名を推測
        const uniqueId = template.uniqueId || template.id;
        componentName = getComponentNameFromUniqueId(uniqueId);
      } else {
        // テンプレートが見つからない場合（コンポーネント作成直後など）、templateIdを直接uniqueIdとして使用
        // templateIdがuniqueId形式（例：test10_b）の場合、直接コンポーネント名を推測
        componentName = getComponentNameFromUniqueId(component.templateId);
      }
      
      // コンポーネント名から動的にコンポーネントを取得
      if (componentName && componentMap[componentName]) {
        const DynamicComponent = componentMap[componentName];
        return <DynamicComponent {...commonProps} />;
      }
    }

    // templateIdがない場合、または該当するコンポーネントが見つからない場合はcomponentRegistryを使用
    const componentName = getComponentName(component.type);
    if (componentName && componentMap[componentName]) {
      const DynamicComponent = componentMap[componentName];
      return <DynamicComponent {...commonProps} />;
    }

    // 該当するコンポーネントが見つからない場合
    return (
      <div className="p-8 bg-gray-100 text-center">
        <p className="text-gray-500">Unknown component type: {component.type}</p>
        <p className="text-xs text-gray-400 mt-2">
          Component type &quot;{component.type}&quot; is not registered in ComponentRenderer.
          Please add it to the switch statement.
        </p>
      </div>
    );
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {renderComponent()}
    </div>
  );
};

export default ComponentRenderer;
