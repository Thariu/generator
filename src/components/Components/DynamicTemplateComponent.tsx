import React, { useEffect, useMemo, useRef } from 'react';
import { ComponentData } from '../../types';
import { useComponentData } from '../../hooks/useComponentData';
import { useDataPropBinding } from '../../hooks/useDataPropBinding';
import { usePageStore } from '../../store/usePageStore';
import { useDynamicTemplateRowStore } from '../../store/dynamicTemplateRowStore';
import { subscribeDynamicTemplateSync } from '../../utils/dynamicTemplateSync';
import { getComponentTemplates } from '../../utils/componentTemplateStorage';
import { supabase } from '../../lib/supabase';
import { scopeCSSWithSectionId } from '../../utils/cssTemplateGenerator';

interface DynamicTemplateComponentProps {
  component: ComponentData;
  isEditing?: boolean;
}

const loadedCssFiles = new Set<string>();

const DynamicTemplateComponent: React.FC<DynamicTemplateComponentProps> = ({ component }) => {
  const { props, style, globalStyles } = useComponentData(component);
  const pageData = usePageStore((s) => s.pageData);
  const uniqueId = component.templateUniqueId;
  const rowSlice = useDynamicTemplateRowStore((s) =>
    uniqueId ? s.rowsByUniqueId[uniqueId] : undefined
  );

  const bindRef = useDataPropBinding({ props });
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const instanceStyleId = useMemo(() => `dyn-css-${component.id}`, [component.id]);

  useEffect(() => {
    if (!uniqueId || supabase) return;
    const t = getComponentTemplates().find((x) => x.uniqueId === uniqueId);
    if (!t) return;
    useDynamicTemplateRowStore.getState().setRow(uniqueId, {
      htmlMarkup: t.htmlMarkup || '',
      sectionId: t.sectionId || '',
      customCssCode: t.customCssCode,
      cssFiles: t.cssFiles || [],
      jsFiles: t.jsFiles || [],
      supabaseRowId: t.supabaseId || t.id,
    });
  }, [uniqueId]);

  useEffect(() => {
    if (!uniqueId) return undefined;
    if (!supabase) return undefined;
    return subscribeDynamicTemplateSync(uniqueId);
  }, [uniqueId]);

  const cssFiles = rowSlice?.cssFiles ?? [];
  useEffect(() => {
    cssFiles.forEach((cssFile) => {
      if (!cssFile || loadedCssFiles.has(`${component.id}:${cssFile}`)) return;
      const href = `/program/st/promo/generator_common/css/${cssFile}`;
      if (document.head.querySelector(`link[href="${href}"]`)) {
        loadedCssFiles.add(`${component.id}:${cssFile}`);
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-dynamic-template-css', component.id);
      document.head.appendChild(link);
      loadedCssFiles.add(`${component.id}:${cssFile}`);
    });
  }, [cssFiles, component.id]);

  useEffect(() => {
    const prev = styleRef.current;
    if (prev) {
      prev.remove();
      styleRef.current = null;
    }
    const custom = rowSlice?.customCssCode?.trim();
    const sid = rowSlice?.sectionId;
    if (!custom) return undefined;
    let cssToApply = custom;
    if (sid) {
      cssToApply = scopeCSSWithSectionId(custom, sid);
    }
    const el = document.createElement('style');
    el.setAttribute('data-dynamic-template-instance', instanceStyleId);
    el.textContent = cssToApply;
    document.head.appendChild(el);
    styleRef.current = el;
    return () => {
      el.remove();
      styleRef.current = null;
    };
  }, [rowSlice?.customCssCode, rowSlice?.sectionId, instanceStyleId]);

  const htmlMarkup = rowSlice?.htmlMarkup ?? '';
  const sectionId = rowSlice?.sectionId;

  const hasSectionIdInHtml =
    sectionId &&
    (htmlMarkup.includes(`id="${sectionId}"`) || htmlMarkup.includes(`id='${sectionId}'`));
  const wrappedHtml =
    sectionId && !hasSectionIdInHtml ? `<div id="${sectionId}">${htmlMarkup}</div>` : htmlMarkup;

  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || globalStyles.baseColor,
    padding: '60px 20px',
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const gs = pageData.globalStyles;

  if (!uniqueId) {
    return (
      <section style={containerStyle}>
        <div style={innerStyle}>
          <p style={{ color: '#6b7280' }}>templateUniqueId が未設定です。</p>
        </div>
      </section>
    );
  }

  if (!htmlMarkup.trim()) {
    return (
      <section style={containerStyle}>
        <div style={innerStyle}>
          <p style={{ color: '#6b7280' }}>
            テンプレートを読み込み中、または html_markup が未登録です（Supabase のマイグレーションを確認してください）。
          </p>
        </div>
      </section>
    );
  }

  return (
    <div
      key={`${uniqueId}-${rowSlice?.supabaseRowId ?? ''}-${htmlMarkup.length}`}
      ref={bindRef as React.RefObject<HTMLDivElement>}
      style={
        {
          ...(gs && {
            '--main-color': gs.mainColor,
            '--base-color': gs.baseColor,
            '--base-color-sub': gs.baseColorSub,
            '--base2-color': gs.base2Color,
            '--accent-color': gs.accentColor,
            '--common-color': gs.commonColor,
            '--common-color-bg': gs.commonColorBg,
          }),
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: wrappedHtml }}
    />
  );
};

export default DynamicTemplateComponent;
