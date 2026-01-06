import React, { useRef, useEffect, useMemo } from 'react';
import { useDataPropBinding } from '../../hooks/useDataPropBinding';
import { scopeCSSWithSectionId } from '../../utils/cssTemplateGenerator';

interface ComponentPreviewProps {
  htmlCode: string;
  props: Record<string, any>;
  cssFiles?: string[];
  customCssCode?: string;
  sectionId?: string;
  globalStyles?: {
    mainColor?: string;
    baseColor?: string;
    baseColorSub?: string;
    base2Color?: string;
    accentColor?: string;
    commonColor?: string;
    commonColorBg?: string;
  };
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  htmlCode,
  props,
  cssFiles = [],
  customCssCode,
  sectionId,
  globalStyles = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useDataPropBinding({ props, containerRef });
  const styleRef = useRef<HTMLStyleElement | null>(null);
  
  // プレビューインスタンスごとに一意のIDを生成
  const previewId = useMemo(() => `preview-${Math.random().toString(36).slice(2, 11)}`, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // CSSファイルを動的に読み込む
    const existingLinks = document.head.querySelectorAll('link[data-preview-css]');
    existingLinks.forEach(link => link.remove());

    cssFiles.forEach((cssFile) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/program/st/promo/generator_common/css/${cssFile}`;
      link.setAttribute('data-preview-css', 'true');
      document.head.appendChild(link);
    });

    return () => {
      // クリーンアップ（必要に応じて）
    };
  }, [cssFiles]);

  // カスタムCSSを適用
  useEffect(() => {
    // このプレビューインスタンスの既存のカスタムCSSスタイルタグを削除
    if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }

    if (customCssCode && customCssCode.trim()) {
      let cssToApply = customCssCode;
      
      // sectionIdが存在する場合はスコープ化
      if (sectionId) {
        cssToApply = scopeCSSWithSectionId(customCssCode, sectionId);
      }
      
      // スタイルタグを作成して追加
      const style = document.createElement('style');
      style.setAttribute('data-preview-custom-css', 'true');
      style.setAttribute('data-preview-id', previewId);
      style.textContent = cssToApply;
      document.head.appendChild(style);
      styleRef.current = style;
    }

    return () => {
      // クリーンアップ：このプレビューインスタンスのスタイルタグを削除
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
      // 念のため、data-preview-idで検索して削除
      const existingStyle = document.head.querySelector(`style[data-preview-id="${previewId}"]`);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [customCssCode, sectionId, previewId]);

  // グローバルスタイルをCSS変数として注入
  const containerStyle: React.CSSProperties & Record<string, string> = {
    padding: '20px',
    backgroundColor: '#ffffff',
    minHeight: '200px',
    position: 'relative',
    ...(Object.keys(globalStyles).length > 0 && {
      '--main-color': globalStyles.mainColor || '#dc2626',
      '--base-color': globalStyles.baseColor || '#3b82f6',
      '--base-color-sub': globalStyles.baseColorSub || '#93c5fd',
      '--base2-color': globalStyles.base2Color || '#8b5cf6',
      '--accent-color': globalStyles.accentColor || '#f59e0b',
      '--common-color': globalStyles.commonColor || '#10b981',
      '--common-color-bg': globalStyles.commonColorBg || '#d1fae5',
    }),
  };

  // sectionIdでラップされたHTMLを生成
  // HTMLコード内に既にsectionIdが含まれている場合はラップしない
  const hasSectionIdInHtml = sectionId && (
    htmlCode.includes(`id="${sectionId}"`) || 
    htmlCode.includes(`id='${sectionId}'`)
  );
  const wrappedHtml = sectionId && !hasSectionIdInHtml
    ? `<div id="${sectionId}">${htmlCode}</div>`
    : htmlCode;

  return (
    <div style={containerStyle}>
      <div
        ref={previewRef as React.RefObject<HTMLDivElement>}
        dangerouslySetInnerHTML={{ __html: wrappedHtml }}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      />
    </div>
  );
};

export default ComponentPreview;

