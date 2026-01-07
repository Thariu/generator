import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { usePageStore } from '../../store/usePageStore';
import SortableComponent from './SortableComponent';
import ComponentRenderer from './ComponentRenderer';
import AccessibilityChecker from './AccessibilityChecker';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import { generateGlobalStylesCSS } from '../../utils/globalStylesHelper';
import { getRequiredCSSFiles } from '../../utils/htmlGenerator';

const Canvas: React.FC = () => {
  const { pageData, reorderComponents, viewMode, previewMode, selectedComponentId } = usePageStore();
  const [showAccessibilityChecker, setShowAccessibilityChecker] = useState(false);
  const [hasAccessibilityIssues, setHasAccessibilityIssues] = useState(false);
  const [containerQueriesCSS, setContainerQueriesCSS] = useState<string>('');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pageData.components.findIndex((item) => item.id === active.id);
      const newIndex = pageData.components.findIndex((item) => item.id === over.id);
      reorderComponents(oldIndex, newIndex);
    }
  };

  const getCanvasWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return { maxWidth: '384px' };
      case 'tablet':
        return { maxWidth: '768px' };
      default:
        return { maxWidth: 'none' };
    }
  };

  // viewModeに応じたコンテナ幅を取得
  const getContainerWidth = (): number => {
    switch (viewMode) {
      case 'mobile':
        return 384;
      case 'tablet':
        return 768;
      default:
        return 1200; // Desktopのデフォルト幅
    }
  };

  // 選択されたコンポーネントを取得
  const selectedComponent = selectedComponentId 
    ? pageData.components.find(c => c.id === selectedComponentId)
    : null;

  // アクセシビリティ問題をチェック
  useEffect(() => {
    if (!selectedComponent) {
      setHasAccessibilityIssues(false);
      setShowAccessibilityChecker(false);
      return;
    }

    const checkAccessibilityIssues = () => {
      const { style } = selectedComponent;
      
      if (!style?.backgroundColor || !style?.textColor) {
        setHasAccessibilityIssues(false);
        setShowAccessibilityChecker(false);
        return;
      }

      // コントラスト比を計算
      const calculateContrastRatio = (color1: string, color2: string): number => {
        const getLuminance = (color: string): number => {
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) / 255;
          const g = parseInt(hex.substr(2, 2), 16) / 255;
          const b = parseInt(hex.substr(4, 2), 16) / 255;

          const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          
          return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
        };

        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);

        return (brightest + 0.05) / (darkest + 0.05);
      };

      const contrastRatio = calculateContrastRatio(style.backgroundColor, style.textColor);
      const bgColor = style.backgroundColor.toLowerCase();
      const textColor = style.textColor.toLowerCase();
      
      // エラーまたは警告条件をチェック
      const hasIssues = 
        contrastRatio < 4.5 || // AA基準未満
        bgColor === textColor || // 同色
        ((bgColor.includes('red') || bgColor.includes('#ff') || bgColor.includes('#f00')) &&
         (textColor.includes('green') || textColor.includes('#0f') || textColor.includes('#00ff00'))) ||
        ((bgColor.includes('green') || bgColor.includes('#0f') || bgColor.includes('#00ff00')) &&
         (textColor.includes('red') || textColor.includes('#ff') || textColor.includes('#f00')));

      setHasAccessibilityIssues(hasIssues);
      
      // 問題がある場合は自動的に表示
      if (hasIssues) {
        setShowAccessibilityChecker(true);
      }
    };

    checkAccessibilityIssues();
  }, [selectedComponent?.style?.backgroundColor, selectedComponent?.style?.textColor, selectedComponent?.id]);

  // CSSファイルからメディアクエリをContainer Queriesに変換
  useEffect(() => {
    const convertMediaQueriesToContainerQueries = async () => {
      try {
        // 必要なCSSファイルのリストを取得
        const requiredCSSFiles = getRequiredCSSFiles(pageData.components);
        
        // 各CSSファイルを読み込んで変換
        const conversionPromises = requiredCSSFiles.map(async (cssFile) => {
          try {
            const response = await fetch(`/program/st/promo/generator_common/css/${cssFile}`);
            if (!response.ok) {
              console.warn(`Failed to load CSS file: ${cssFile}`);
              return '';
            }
            const cssText = await response.text();
            
            // VWをpxに変換する関数
            const convertVWToPx = (cssText: string, containerWidth: number): string => {
              // VW単位の値を検出して変換
              // 例: 13.33vw -> (containerWidth * 13.33 / 100)px
              const vwRegex = /(\d+\.?\d*)\s*vw/g;
              
              return cssText.replace(vwRegex, (match, value) => {
                const vwValue = parseFloat(value);
                const pxValue = (containerWidth * vwValue / 100).toFixed(2);
                return `${pxValue}px`;
              });
            };

            // メディアクエリをContainer Queriesに変換
            // @media (max-width: XXXpx) { ... } を @container canvas-container (max-width: XXXpx) { ... } に変換
            const convertMediaQueryToContainerQuery = (text: string, containerWidth: number): string => {
              // 正規表現でメディアクエリを検出して変換
              // @media (max-width: XXXpx) { ... } のパターン
              const mediaQueryRegex = /@media\s*\(([^)]+)\)\s*\{/g;
              
              let convertedText = text;
              let match;
              
              // すべてのメディアクエリを検出
              const matches: Array<{ start: number; end: number; condition: string }> = [];
              while ((match = mediaQueryRegex.exec(text)) !== null) {
                const condition = match[1];
                // max-width または min-width を含む条件のみ変換
                if (condition.includes('max-width') || condition.includes('min-width')) {
                  matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    condition: condition.trim()
                  });
                }
              }
              
              // 後ろから前に変換（インデックスのずれを防ぐため）
              for (let i = matches.length - 1; i >= 0; i--) {
                const { start, end, condition } = matches[i];
                // メディアクエリの内容を取得（対応する閉じ括弧まで）
                let contentStart = end;
                let contentEnd = contentStart;
                let braceCount = 1;
                
                while (contentEnd < text.length && braceCount > 0) {
                  if (text[contentEnd] === '{') braceCount++;
                  else if (text[contentEnd] === '}') braceCount--;
                  contentEnd++;
                }
                
                // メディアクエリの内容を抽出
                const mediaContent = text.slice(contentStart, contentEnd - 1);
                
                // Container Queries内のVWをpxに変換
                const mediaContentWithPx = convertVWToPx(mediaContent, containerWidth);
                
                // Container Queriesに変換
                const containerQuery = `@container canvas-container (${condition}) {${mediaContentWithPx}}`;
                
                // 元のメディアクエリ全体を置換
                convertedText = convertedText.slice(0, start) + containerQuery + convertedText.slice(contentEnd);
              }
              
              return convertedText;
            };
            
            const containerWidth = getContainerWidth();
            return convertMediaQueryToContainerQuery(cssText, containerWidth);
          } catch (error) {
            console.warn(`Error converting CSS file ${cssFile}:`, error);
            return '';
          }
        });
        
        const convertedCSSArray = await Promise.all(conversionPromises);
        const combinedCSS = convertedCSSArray.filter(Boolean).join('\n\n');
        
        // デバッグ用: 変換後のCSSをコンソールに出力
        if (combinedCSS) {
          console.log('Converted Container Queries CSS:', combinedCSS.substring(0, 500));
        }
        
        setContainerQueriesCSS(combinedCSS);
      } catch (error) {
        console.error('Error converting media queries to container queries:', error);
        setContainerQueriesCSS('');
      }
    };

    convertMediaQueriesToContainerQueries();
  }, [pageData.components, viewMode]);

  // 動的スタイルの生成
  const dynamicStyles = useMemo(() => `
    ${generateGlobalStylesCSS(pageData.globalStyles)}
    ${pageData.components.map(component => 
      component.style ? `
        [data-component-id="${component.id}"] {
          ${component.style.backgroundColor ? `--component-background-color: ${component.style.backgroundColor};` : ''}
          ${component.style.textColor ? `--component-text-color: ${component.style.textColor};` : ''}
          ${component.style.headlineColor ? `--component-headline-color: ${component.style.headlineColor};` : ''}
          ${component.style.descriptionColor ? `--component-description-color: ${component.style.descriptionColor};` : ''}
          ${component.style.buttonBackgroundColor ? `--component-button-bg-color: ${component.style.buttonBackgroundColor};` : ''}
          ${component.style.buttonTextColor ? `--component-button-text-color: ${component.style.buttonTextColor};` : ''}
          ${component.style.cardBackgroundColor ? `--component-card-bg-color: ${component.style.cardBackgroundColor};` : ''}
          ${component.style.cardTextColor ? `--component-card-text-color: ${component.style.cardTextColor};` : ''}
          ${component.style.accentColor ? `--component-accent-color: ${component.style.accentColor};` : ''}
        }
      ` : ''
    ).join('')}
    
    /* Container Queries（メディアクエリから自動変換） */
    ${containerQueriesCSS}
  `, [pageData.globalStyles, pageData.components, containerQueriesCSS]);

  const canvasStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: '#f9fafb',
    overflowY: 'auto',
    height: '100%',
  };

  const canvasContentStyle: React.CSSProperties = {
    margin: '0 auto',
    backgroundColor: '#ffffff',
    position: 'relative',
    minHeight: '100%',
    ...getCanvasWidth(),
    // Container Queriesを有効化
    containerType: 'inline-size',
    containerName: 'canvas-container',
  } as React.CSSProperties & { containerType: string; containerName: string };

  const emptyCanvasStyle: React.CSSProperties = {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const emptyContentStyle: React.CSSProperties = {
    textAlign: 'center',
  };

  const emptyIconStyle: React.CSSProperties = {
    width: '96px',
    height: '96px',
    backgroundColor: '#e5e7eb',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  };

  const emptyTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 500,
    color: '#111827',
    marginBottom: '8px',
  };

  const emptyDescStyle: React.CSSProperties = {
    color: '#6b7280',
    marginBottom: '16px',
  };

  const hintsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    fontSize: '14px',
    color: '#9ca3af',
  };

  const hintItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  const hintDotStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '8px',
  };

  if (pageData.components.filter(c => c.type !== 'headline').length === 0) {
    return (
      <div style={canvasStyle}>
        <div style={canvasContentStyle}>
          <Header />
          {/* 必須ヘッドラインコンポーネント */}
          {pageData.components.find(c => c.type === 'headline') && (
            <ComponentRenderer 
              component={pageData.components.find(c => c.type === 'headline')!} 
            />
          )}
          <div style={emptyCanvasStyle}>
            <div style={emptyContentStyle}>
              <div style={emptyIconStyle}>
                <svg style={{ width: '48px', height: '48px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 style={emptyTitleStyle}>ページの構築を開始</h3>
              <p style={emptyDescStyle}>サイドバーからコンポーネントを選択してページに追加してください。</p>
              <div style={hintsStyle}>
                <div style={hintItemStyle}>
                  <div style={{ ...hintDotStyle, backgroundColor: '#3b82f6' }}></div>
                  クリックで追加
                </div>
                <div style={hintItemStyle}>
                  <div style={{ ...hintDotStyle, backgroundColor: '#10b981' }}></div>
                  ドラッグで並び替え
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div style={canvasStyle}>
        <style>{dynamicStyles}</style>
        <div style={canvasContentStyle}>
          <Header />
          {/* 必須ヘッドラインコンポーネント */}
          {pageData.components.find(c => c.type === 'headline') && (
            <ComponentRenderer
              component={pageData.components.find(c => c.type === 'headline')!}
            />
          )}
          {pageData.components.filter(c => c.type !== 'headline').map((component) => (
            <ComponentRenderer key={component.id} component={component} />
          ))}
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div style={canvasStyle}>
      {/* 動的スタイルの適用 */}
      <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      
      <div style={canvasContentStyle}>
        <Header />
        {/* 必須ヘッドラインコンポーネント */}
        {pageData.components.find(c => c.type === 'headline') && (
          <ComponentRenderer 
            component={pageData.components.find(c => c.type === 'headline')!} 
          />
        )}
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pageData.components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {pageData.components.filter(c => c.type !== 'headline').map((component) => (
              <div key={component.id} style={{ position: 'relative' }}>
                <SortableComponent 
                  component={component}
                  showAccessibilityToggle={selectedComponent?.id === component.id}
                  hasAccessibilityIssues={selectedComponent?.id === component.id && hasAccessibilityIssues}
                  onAccessibilityToggle={() => setShowAccessibilityChecker(!showAccessibilityChecker)}
                />
                
                {/* アクセシビリティチェッカー */}
                {selectedComponent && selectedComponent.id === component.id && (
                  <AccessibilityChecker 
                    component={selectedComponent} 
                    isVisible={showAccessibilityChecker}
                    onClose={() => setShowAccessibilityChecker(false)}
                  />
                )}
              </div>
            ))}
          </SortableContext>
        </DndContext>
        <Footer />
      </div>
    </div>
  );
};

export default Canvas;