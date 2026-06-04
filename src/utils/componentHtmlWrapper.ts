// Component HTML wrapper with unique IDs

import { ComponentData } from '../types';
import { getCatalogRowForComponent } from './templateCatalog';

/**
 * コンポーネントに対応するテンプレート行を取得（カタログキャッシュ）
 */
export const getComponentTemplate = (component: ComponentData) => {
  return getCatalogRowForComponent(component);
};

/**
 * コンポーネントHTMLを一意のIDを持つdivでラップ
 */
export const wrapComponentHTML = (
  componentHTML: string,
  component: ComponentData
): string => {
  const template = getComponentTemplate(component);

  if (!template) {
    return componentHTML;
  }

  const sectionId = template.sectionId || (template.uniqueId ? `${template.uniqueId}Area` : undefined);
  const uniqueId = template.uniqueId;

  if (!uniqueId || !sectionId) {
    return componentHTML;
  }

  return `
    <div id="${sectionId}" class="component-wrapper" data-component-type="${component.type}" data-unique-id="${uniqueId}">
      ${componentHTML}
    </div>
  `.trim();
};

/**
 * コンポーネントの一意のIDを取得
 */
export const getComponentUniqueId = (component: ComponentData): string | null => {
  const template = getComponentTemplate(component);
  return template?.uniqueId || component.templateUniqueId || null;
};

/**
 * コンポーネントのセクションIDを取得
 */
export const getComponentSectionId = (component: ComponentData): string | null => {
  const template = getComponentTemplate(component);
  if (template?.sectionId) return template.sectionId;
  const uid = template?.uniqueId || component.templateUniqueId;
  if (uid) return `${uid}Area`;
  return null;
};
