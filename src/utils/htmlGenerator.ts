// HTML generation utilities for component export
import { ComponentData, PageData } from '../types';
import { getGlobalStyleValue } from './globalStylesHelper';
import { componentTemplates } from '../data/componentTemplates';
import { getComponentTemplates } from './componentTemplateStorage';

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

// Generate inline styles from style object
export const generateInlineStyles = (styles: Record<string, string>): string => {
  return Object.entries(styles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
};

// Generate HTML for Headline component
export const generateHeadlineHTML = (component: ComponentData, globalStyles: any): string => {
  const { text, usePageTitle } = component.props;
  const { backgroundColor, textColor, headlineColor } = component.style || {};
  
  const mainColor = getGlobalStyleValue(globalStyles, 'mainColor');
  const mainColorSub = getGlobalStyleValue(globalStyles, 'mainColorSub');
  
  const containerStyles = {
    'background-color': backgroundColor || mainColor,
    color: textColor || mainColorSub,
    'padding': '20px 0'
  };
  
  const innerStyles = {
    'max-width': '1200px',
    'margin': '0 auto',
    'padding': '0 20px'
  };
  
  const headlineStyles = {
    'font-size': '24px',
    'font-weight': 'bold',
    'line-height': '1.4',
    'margin': '0',
    'color': headlineColor || textColor || mainColorSub
  };
  
  const displayText = text || 'シリーズ10年の歴史がついに完結！ジェームズ・スペイダー主演「ブラックリスト ファイナル・シーズン」独占日本初放送！';
  
  return `
    <div style="${generateInlineStyles(containerStyles)}">
      <div style="${generateInlineStyles(innerStyles)}">
        <h1 style="${generateInlineStyles(headlineStyles)}">${displayText}</h1>
      </div>
    </div>
  `;
};

// Generate HTML for KV component
export const generateKVHTML = (component: ComponentData, globalStyles: any): string => {
  const { 
    headline, 
    description, 
    ctaText, 
    ctaUrl, 
    backgroundImage, 
    pattern = 'default',
    title,
    cast,
    broadcastInfo,
    ctaButtons,
    mediaItems = [],
    expandedDescription,
    showMoreText = 'もっと見る',
    showLessText = '閉じる'
  } = component.props;
  
  const { 
    backgroundColor, 
    textColor, 
    headlineColor, 
    descriptionColor, 
    buttonBackgroundColor, 
    buttonTextColor 
  } = component.style || {};

  const mainColor = getGlobalStyleValue(globalStyles, 'mainColor');
  const baseColor = getGlobalStyleValue(globalStyles, 'baseColor');
  
  if (pattern === 'program-hero') {
    const containerStyles = {
      'background-color': backgroundColor || baseColor,
      'color': textColor || '#333',
      'padding': '48px 0 64px'
    };
    
    const gridStyles = {
      'max-width': '1400px',
      'margin': '0 auto',
      'padding': '0 16px',
      'display': 'grid',
      'grid-template-columns': '1fr 1fr',
      'gap': '48px',
      'align-items': 'start'
    };
    
    const mediaContainerStyles = {
      'position': 'relative'
    };
    
    const mediaItemStyles = {
      'width': '100%',
      'height': '400px',
      'border-radius': '12px',
      'overflow': 'hidden'
    };
    
    const titleStyles = {
      'font-size': '48px',
      'font-weight': 'bold',
      'line-height': '1.2',
      'margin-bottom': '16px',
      'color': headlineColor || textColor || '#333'
    };
    
    const descriptionStyles = {
      'font-size': '18px',
      'line-height': '1.6',
      'margin-bottom': '24px',
      'color': descriptionColor || textColor || '#666'
    };
    
    const badgesHTML = (broadcastInfo?.badges || []).map((badge: any, index: number) => 
      `<span style="display: inline-block; padding: 4px 12px; font-size: 12px; font-weight: bold; border-radius: 20px; margin-right: 8px; margin-bottom: 8px; background-color: ${index === 0 ? badge.color : mainColor}; color: white;">${badge.text}</span>`
    ).join('');
    
    const ctaButtonsHTML = (ctaButtons || []).map((button: any) => {
      const buttonStyles = button.type === 'primary' 
        ? `background-color: ${buttonBackgroundColor || mainColor}; color: ${buttonTextColor || '#ffffff'}; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: 500; display: inline-flex; align-items: center; margin-right: 16px; margin-bottom: 16px;`
        : `background-color: white; color: ${mainColor}; border: 2px solid ${mainColor}; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: 500; display: inline-flex; align-items: center; margin-right: 16px; margin-bottom: 16px;`;
      
      return `<a href="${button.url}" style="${buttonStyles}">${button.text}</a>`;
    }).join('');
    
    const currentMediaItem = mediaItems[0] || { type: 'image', url: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'メインビジュアル' };
    
    const mediaHTML = currentMediaItem.type === 'video' 
      ? `<iframe src="${currentMediaItem.url}" style="width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
      : `<img src="${currentMediaItem.url}" alt="${currentMediaItem.alt}" style="width: 100%; height: 100%; object-fit: cover;" />`;
    
    return `
      <div style="${generateInlineStyles(containerStyles)}">
        <div style="${generateInlineStyles(gridStyles)}">
          <div style="${generateInlineStyles(mediaContainerStyles)}">
            <div style="${generateInlineStyles(mediaItemStyles)}">
              ${mediaHTML}
            </div>
          </div>
          <div>
            <h1 style="${generateInlineStyles(titleStyles)}">${title || 'ブラックリスト ファイナル・シーズン'}</h1>
            ${badgesHTML ? `<div style="margin-bottom: 16px;">${badgesHTML}</div>` : ''}
            <p style="${generateInlineStyles(descriptionStyles)}">${description || '世界で最も危険な犯罪者たちのリストを持つ元政府エージェント、レイモンド・レディントンが、FBIと協力して凶悪犯を追い詰める。'}</p>
            ${expandedDescription ? `
              <div id="expanded-desc-${component.id}" style="display: none;">
                <p style="${generateInlineStyles(descriptionStyles)}">${expandedDescription}</p>
              </div>
              <button onclick="toggleExpanded('${component.id}')" id="toggle-btn-${component.id}" style="background: none; border: none; color: ${mainColor}; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: underline; margin-bottom: 24px;">${showMoreText}</button>
            ` : ''}
            ${cast ? `<p style="font-size: 16px; color: ${textColor || '#333'}; margin-bottom: 24px;"><strong>出演:</strong> ${cast}</p>` : ''}
            <div style="display: flex; flex-wrap: wrap; gap: 16px;">
              ${ctaButtonsHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Default KV pattern
  const containerStyles = {
    'position': 'relative',
    'min-height': '100vh',
    'display': 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'background-color': backgroundColor || baseColor,
    'color': textColor || '#333',
    ...(backgroundImage ? {
      'background-image': `url(${backgroundImage})`,
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat'
    } : {})
  };
  
  const overlayStyles = backgroundImage ? {
    'position': 'absolute',
    'top': '0',
    'left': '0',
    'right': '0',
    'bottom': '0',
    'background-color': 'rgba(0, 0, 0, 0.5)'
  } : {};
  
  const contentStyles = {
    'position': 'relative',
    'z-index': '10',
    'max-width': '1024px',
    'margin': '0 auto',
    'padding': '0 16px',
    'text-align': 'center'
  };
  
  const headlineStyles = {
    'font-size': '48px',
    'font-weight': 'bold',
    'line-height': '1.2',
    'margin-bottom': '24px',
    'color': backgroundImage ? 'white' : (headlineColor || textColor || '#333')
  };
  
  const descStyles = {
    'font-size': '20px',
    'line-height': '1.6',
    'margin-bottom': '32px',
    'max-width': '768px',
    'margin-left': 'auto',
    'margin-right': 'auto',
    'color': backgroundImage ? 'rgba(255, 255, 255, 0.9)' : (descriptionColor || textColor || '#666')
  };
  
  const buttonStyles = {
    'display': 'inline-flex',
    'align-items': 'center',
    'padding': '16px 32px',
    'border': 'none',
    'border-radius': '8px',
    'font-size': '18px',
    'font-weight': '500',
    'text-decoration': 'none',
    'background-color': buttonBackgroundColor || mainColor,
    'color': buttonTextColor || '#ffffff',
    'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    'transition': 'all 0.2s ease-in-out'
  };
  
  return `
    <div style="${generateInlineStyles(containerStyles)}">
      ${backgroundImage ? `<div style="${generateInlineStyles(overlayStyles)}"></div>` : ''}
      <div style="${generateInlineStyles(contentStyles)}">
        <h1 style="${generateInlineStyles(headlineStyles)}">${headline}</h1>
        <p style="${generateInlineStyles(descStyles)}">${description}</p>
        <div style="display: flex; justify-content: center;">
          <a href="${ctaUrl}" style="${generateInlineStyles(buttonStyles)}">${ctaText}</a>
        </div>
      </div>
    </div>
  `;
};

// Generate HTML for Pricing component
export const generatePricingHTML = (component: ComponentData, globalStyles: any): string => {
  const { title, subtitle, mainPlan, additionalPlans } = component.props;
  const { backgroundColor, textColor, headlineColor, mainPlanBackgroundColor, mainPlanBoxColor, priceColor } = component.style || {};
  
  const mainColor = getGlobalStyleValue(globalStyles, 'mainColor');
  const baseColor = getGlobalStyleValue(globalStyles, 'baseColor');
  const accentColor = getGlobalStyleValue(globalStyles, 'accentColor');
  const commonColor = getGlobalStyleValue(globalStyles, 'commonColor');
  
  const containerStyles = {
    'background-color': backgroundColor || baseColor,
    'color': textColor || commonColor,
    'padding': '64px 0 96px'
  };
  
  const innerStyles = {
    'max-width': '1200px',
    'margin': '0 auto',
    'padding': '0 16px'
  };
  
  const titleStyles = {
    'font-size': '48px',
    'font-weight': 'bold',
    'text-align': 'center',
    'margin-bottom': '24px',
    'color': headlineColor || textColor || '#333'
  };
  
  const subtitleStyles = {
    'background-color': mainPlanBackgroundColor || mainColor,
    'color': 'white',
    'padding': '24px 32px',
    'font-size': '24px',
    'font-weight': 'bold',
    'margin-bottom': '48px',
    'border-radius': '8px',
    'text-align': 'center'
  };
  
  const mainPlanHTML = mainPlan ? `
    <div style="text-align: center; margin-bottom: 48px;">
      <p style="font-size: 20px; margin-bottom: 24px; color: ${textColor || '#666'};">${mainPlan.description}</p>
      <div style="display: flex; justify-content: center; align-items: center; gap: 24px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="background-color: ${mainPlanBoxColor || accentColor}; color: white; padding: 16px 32px; border-radius: 8px; font-size: 24px; font-weight: bold; min-width: 320px; text-align: center;">
          ${mainPlan.name}
        </div>
        <div style="text-align: center;">
          <div style="font-size: 18px; color: ${textColor || '#333'};">${mainPlan.priceLabel}</div>
          <div style="display: flex; align-items: baseline; justify-content: center;">
            <span style="font-size: 60px; font-weight: bold; font-family: monospace; color: ${priceColor || accentColor};">${mainPlan.price}</span>
            <span style="font-size: 18px; margin-left: 4px; color: ${textColor || '#333'};">${mainPlan.unit}</span>
          </div>
        </div>
      </div>
      ${mainPlan.note ? `<p style="text-align: center; font-size: 14px; color: ${textColor || '#666'};">${mainPlan.note}</p>` : ''}
    </div>
  ` : '';
  
  const additionalPlansHTML = (additionalPlans || []).map((plan: any) => `
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="font-size: 18px; margin-bottom: 16px; color: ${textColor || '#666'};">${plan.description}</p>
      <div style="display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: wrap;">
        <div style="background-color: ${plan.backgroundColor || accentColor}; color: white; padding: 16px 32px; border-radius: 8px; font-size: 20px; font-weight: bold; min-width: 320px; text-align: center;">
          ${plan.name}
        </div>
        <div style="text-align: center;">
          <div style="font-size: 18px; color: ${textColor || '#333'};">${plan.priceLabel}</div>
          <div style="display: flex; align-items: baseline; justify-content: center;">
            <span style="font-size: 60px; font-weight: bold; font-family: monospace; color: ${plan.priceColor || accentColor};">${plan.price}</span>
            <span style="font-size: 18px; margin-left: 4px; color: ${textColor || '#333'};">${plan.unit}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  // 価格比較ボックスのHTML生成
  const priceBoxesHTML = fixedPriceBoxes.map((box, index) => `
    <div class="flex-1 max-w-sm mx-auto lg:mx-0 main-pattern-1" style="border-radius: 8px; overflow: hidden;">
      <!-- ヘッダー -->
      <div class="main-pattern-1 py-4 px-6 text-center font-medium text-lg" style="filter: brightness(1.1);">
        ${box.period}
      </div>
      
      <!-- 料金項目 -->
      <div class="main-sub-text">
        ${box.items.map((item, itemIndex) => `
          <div class="flex justify-between items-center py-6 px-6 ${itemIndex === 0 ? 'border-b border-white border-opacity-30' : ''}">
            <div class="flex items-center">
              <span class="px-3 py-1 text-sm font-bold rounded main-pattern-2">
                ${item.label}
              </span>
            </div>
            <div class="text-right">
              ${item.price ? `
                <div class="flex items-baseline">
                  <span class="text-4xl sm:text-5xl font-bold font-mono">
                    ${item.price}
                  </span>
                  <span class="text-lg ml-1">${item.unit}</span>
                </div>
              ` : `
                <div class="text-lg font-bold leading-tight">
                  ${item.description}
                </div>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  
  return `
    <div style="${generateInlineStyles(containerStyles)}">
      <div style="${generateInlineStyles(innerStyles)}">
        <h2 style="${generateInlineStyles(titleStyles)}">${title}</h2>
        <div class="main-pattern-1" style="padding: 24px 32px; font-size: 24px; font-weight: bold; margin-bottom: 48px; border-radius: 8px; text-align: center;">${subtitle}</div>
        
        <!-- 価格比較テーブル -->
        <div style="position: relative; margin-bottom: 64px;">
          <div style="display: flex; justify-content: center; align-items: stretch; gap: 48px; margin-bottom: 32px; flex-wrap: wrap;">
            ${priceBoxesHTML}
          </div>
        </div>
        
        ${mainPlanHTML}
        ${additionalPlansHTML}
        <div style="display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: wrap;">
          <a href="#" class="main-pattern-1" style="padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: 500; min-width: 320px; text-align: center;">ご加入はこちら</a>
          <a href="#" style="background-color: white; color: ${accentColor}; border: 2px solid ${accentColor}; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: 500; min-width: 320px; text-align: center;">ご契約追加はこちら</a>
        </div>
      </div>
    </div>
  `;
};

// Generate HTML for App Intro component
export const generateAppIntroHTML = (component: ComponentData, globalStyles: any): string => {
  const { balloonText } = component.props;
  const { backgroundColor, textColor, cardBackgroundColor, accentColor } = component.style || {};
  
  const baseColor = getGlobalStyleValue(globalStyles, 'baseColor');
  const base2Color = getGlobalStyleValue(globalStyles, 'base2Color');
  const globalAccentColor = getGlobalStyleValue(globalStyles, 'accentColor');
  
  const containerStyles = {
    'background-color': backgroundColor || baseColor,
    'color': textColor || '#333333',
    'padding': '120px 0'
  };
  
  const innerStyles = {
    'max-width': '1200px',
    'margin': '0 auto',
    'padding': '0 20px'
  };
  
  const titleStyles = {
    'font-size': '30px',
    'font-weight': '500',
    'text-align': 'center',
    'margin-bottom': '24px',
    'color': textColor || '#333333'
  };
  
  const balloonStyles = {
    'color': accentColor || globalAccentColor,
    'font-size': '16px',
    'font-weight': '500',
    'background': '#fff',
    'border': `2px solid ${accentColor || globalAccentColor}`,
    'border-radius': '5px',
    'text-align': 'center',
    'padding': '10px',
    'margin': '0 auto 20px',
    'max-width': '360px',
    'position': 'relative'
  };
  
  return `
    <section style="${generateInlineStyles(containerStyles)}">
      <div style="${generateInlineStyles(innerStyles)}">
        <h3 style="${generateInlineStyles(titleStyles)}">スカパー！番組配信とは</h3>
        <p style="font-size: 16px; line-height: 1.8; text-align: center; color: ${textColor || '#333333'};">
          スカパー！ご加入のお客さまは、スマホ・タブレット・PCなどでも<br>
          追加料金なしで契約商品をご視聴いただけます。
        </p>
        <p style="font-size: 14px; line-height: 1; margin: 20px 0 50px; text-align: center; color: ${textColor || '#666666'};">
          ※ご契約している商品でも一部視聴できないチャンネル・番組がございます。
        </p>
        
        <div style="border: 2px solid #D3D3D3; background: ${cardBackgroundColor || base2Color}; border-radius: 12px; padding: 35px 0; max-width: 760px; margin: 0 auto;">
          <div style="display: flex; justify-content: center; align-items: flex-start; gap: 40px; flex-wrap: wrap;">
            <div>
              <div style="${generateInlineStyles(balloonStyles)}">
                ${balloonText || 'ブラックリスト'}をマイリスト登録すれば便利！
              </div>
              <div style="display: flex; justify-content: flex-start; align-items: center; gap: 20px;">
                <div style="margin-right: 20px;">
                  <img src="/program/st/promo/generator_common/img/streamingApp_logo.svg" alt="スカパー！番組配信" style="width: 120px; height: auto;">
                </div>
                <p style="font-size: 18px; font-weight: 500; line-height: 1.8; text-align: left; color: ${textColor || '#000'};">
                  スカパー！番組配信を<br>見るならアプリがおすすめ！
                </p>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
              <a href="https://itunes.apple.com/jp/app/id1059697991/" target="_blank" rel="noopener noreferrer">
                <img src="/program/st/promo/generator_common/img/app_store_button.png" alt="App Store" style="width: 200px; height: auto;">
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.yomumiru" target="_blank" rel="noopener noreferrer">
                <img src="/program/st/promo/generator_common/img/google_play_button.png" alt="Google Play" style="width: 200px; height: auto;">
              </a>
            </div>
          </div>
        </div>
        
        <h4 style="font-size: 30px; line-height: 1; font-weight: 500; margin-top: 50px; margin-bottom: 41px; text-align: center; color: ${textColor || '#333333'};">
          基本プランなら、50chのうち37chが番組配信も楽しめる！
        </h4>
        
        <div style="text-align: center; margin-top: 50px;">
          <img src="../generator_common/img/channel_list.png" alt="番組配信チャンネル一覧" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" class="common-image">
        </div>
      </div>
    </section>
  `;
};

// Generate HTML for Features component
export const generateFeaturesHTML = (component: ComponentData, globalStyles: any): string => {
  const { title, description, features } = component.props;
  const { backgroundColor, textColor, headlineColor, descriptionColor, cardBackgroundColor, cardTextColor, accentColor } = component.style || {};
  
  const baseColor = getGlobalStyleValue(globalStyles, 'baseColor');
  const globalAccentColor = getGlobalStyleValue(globalStyles, 'accentColor');
  const commonColor = getGlobalStyleValue(globalStyles, 'commonColor');
  
  const containerStyles = {
    'background-color': backgroundColor || baseColor,
    'color': textColor || commonColor,
    'padding': '64px 0 96px'
  };
  
  const innerStyles = {
    'max-width': '1400px',
    'margin': '0 auto',
    'padding': '0 16px'
  };
  
  const titleStyles = {
    'font-size': '48px',
    'font-weight': 'bold',
    'text-align': 'center',
    'margin-bottom': '16px',
    'color': headlineColor || textColor || '#333'
  };
  
  const descStyles = {
    'font-size': '20px',
    'text-align': 'center',
    'max-width': '768px',
    'margin': '0 auto 64px',
    'color': descriptionColor || textColor || '#666'
  };
  
  const isAlternatingLayout = features.some((f: any) => f.image);
  
  if (isAlternatingLayout) {
    const featuresHTML = features.map((feature: any, index: number) => {
      const isReversed = index % 2 === 1;
      const flexDirection = isReversed ? 'row-reverse' : 'row';
      
      return `
        <div style="display: flex; align-items: center; gap: 48px; margin-bottom: 80px; flex-direction: ${flexDirection}; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;">
            <img src="${feature.image}" alt="${feature.title}" style="width: 100%; height: 320px; object-fit: cover; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          </div>
          <div style="flex: 1; min-width: 300px;">
            <h3 style="font-size: 36px; font-weight: bold; margin-bottom: 24px; color: ${headlineColor || textColor || '#333'};">${feature.title}</h3>
            <p style="font-size: 18px; line-height: 1.6; color: ${descriptionColor || textColor || '#666'};">${feature.description}</p>
          </div>
        </div>
      `;
    }).join('');
    
    return `
      <div style="${generateInlineStyles(containerStyles)}">
        <div style="${generateInlineStyles(innerStyles)}">
          ${title ? `<h2 style="${generateInlineStyles(titleStyles)}">${title}</h2>` : ''}
          ${description ? `<p style="${generateInlineStyles(descStyles)}">${description}</p>` : ''}
          <div>
            ${featuresHTML}
          </div>
        </div>
      </div>
    `;
  }
  
  // 3-column grid layout
  const featuresHTML = features.map((feature: any) => `
    <div style="text-align: center;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 16px; background-color: ${cardBackgroundColor || '#ffffff'}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 24px;">
        <div style="width: 32px; height: 32px; background-color: ${accentColor || globalAccentColor}; border-radius: 4px;"></div>
      </div>
      <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: ${cardTextColor || headlineColor || textColor || '#333'};">${feature.title}</h3>
      <p style="line-height: 1.6; color: ${cardTextColor || descriptionColor || textColor || '#666'};">${feature.description}</p>
    </div>
  `).join('');
  
  return `
    <div style="${generateInlineStyles(containerStyles)}">
      <div style="${generateInlineStyles(innerStyles)}">
        <h2 style="${generateInlineStyles(titleStyles)}">${title}</h2>
        ${description ? `<p style="${generateInlineStyles(descStyles)}">${description}</p>` : ''}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 48px;">
          ${featuresHTML}
        </div>
      </div>
    </div>
  `;
};

// Generate HTML for CTA component
export const generateCTAHTML = (component: ComponentData, globalStyles: any): string => {
  const { headline, description, ctaText, ctaUrl, features } = component.props;
  const { backgroundColor, textColor, headlineColor, descriptionColor, buttonBackgroundColor, buttonTextColor } = component.style || {};
  
  const mainColor = getGlobalStyleValue(globalStyles, 'mainColor');
  const commonColor = getGlobalStyleValue(globalStyles, 'commonColor');
  
  const containerStyles = {
    'background-color': backgroundColor || mainColor,
    'color': textColor || (backgroundColor ? commonColor : 'white'),
    'padding': '64px 0 96px'
  };
  
  const innerStyles = {
    'max-width': '1024px',
    'margin': '0 auto',
    'padding': '0 16px',
    'text-align': 'center'
  };
  
  const titleStyles = {
    'font-size': '48px',
    'font-weight': 'bold',
    'margin-bottom': '24px',
    'color': headlineColor || textColor || 'white'
  };
  
  const descStyles = {
    'font-size': '20px',
    'line-height': '1.6',
    'margin-bottom': '32px',
    'opacity': '0.9',
    'color': descriptionColor || textColor || 'white'
  };
  
  const buttonStyles = {
    'display': 'inline-flex',
    'align-items': 'center',
    'padding': '16px 32px',
    'border-radius': '8px',
    'font-size': '18px',
    'font-weight': '500',
    'text-decoration': 'none',
    'background-color': buttonBackgroundColor || '#ffffff',
    'color': buttonTextColor || '#111827',
    'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    'transition': 'all 0.2s ease-in-out'
  };
  
  const featuresHTML = features ? `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px; max-width: 512px; margin-left: auto; margin-right: auto;">
      ${features.map((feature: string) => `
        <div style="display: flex; align-items: center; text-align: left;">
          <div style="width: 20px; height: 20px; margin-right: 12px; flex-shrink: 0;">✓</div>
          <span style="font-size: 18px;">${feature}</span>
        </div>
      `).join('')}
    </div>
  ` : '';
  
  return `
    <div style="${generateInlineStyles(containerStyles)}">
      <div style="${generateInlineStyles(innerStyles)}">
        <h2 style="${generateInlineStyles(titleStyles)}">${headline}</h2>
        <p style="${generateInlineStyles(descStyles)}">${description}</p>
        ${featuresHTML}
        <div>
          <a href="${ctaUrl}" style="${generateInlineStyles(buttonStyles)}">${ctaText}</a>
        </div>
      </div>
    </div>
  `;
};

// Generate HTML for FAQ component
export const generateFAQHTML = (component: ComponentData, globalStyles: any): string => {
  const { title, description, faqs } = component.props;
  const { backgroundColor, textColor, headlineColor, descriptionColor, cardBackgroundColor, cardTextColor } = component.style || {};
  
  const baseColor = getGlobalStyleValue(globalStyles, 'baseColor');
  
  const containerStyles = {
    'background-color': backgroundColor || baseColor,
    'color': textColor || '#333',
    'padding': '64px 0 96px'
  };
  
  const innerStyles = {
    'max-width': '1024px',
    'margin': '0 auto',
    'padding': '0 16px'
  };
  
  const titleStyles = {
    'font-size': '48px',
    'font-weight': 'bold',
    'text-align': 'center',
    'margin-bottom': '16px',
    'color': headlineColor || textColor || '#333'
  };
  
  const descStyles = {
    'font-size': '20px',
    'text-align': 'center',
    'max-width': '768px',
    'margin': '0 auto 64px',
    'color': descriptionColor || textColor || '#666'
  };
  
  const faqsHTML = faqs.map((faq: any, index: number) => {
    const accordionId = `${component.id}-faq-${index}`;
    return `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 16px; background-color: ${cardBackgroundColor || '#ffffff'};">
      <button
        data-accordion-trigger="${accordionId}"
        aria-expanded="false"
        style="width: 100%; padding: 16px 24px; text-align: left; display: flex; align-items: center; justify-content: space-between; background: none; border: none; cursor: pointer; font-size: 18px; font-weight: 600; color: ${cardTextColor || textColor || '#333'};">
        <span>${faq.question}</span>
        <span data-accordion-icon="${accordionId}" style="transition: transform 0.2s;">▼</span>
      </button>
      <div
        data-accordion-content="${accordionId}"
        aria-hidden="true"
        style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease; padding: 0 24px; color: ${cardTextColor || textColor || '#666'};">
        <p style="line-height: 1.6; margin: 0; padding-bottom: 16px;">${faq.answer}</p>
      </div>
    </div>
  `;
  }).join('');
  
  return `
    <div style="${generateInlineStyles(containerStyles)}">
      <div style="${generateInlineStyles(innerStyles)}">
        <h2 style="${generateInlineStyles(titleStyles)}">${title}</h2>
        ${description ? `<p style="${generateInlineStyles(descStyles)}">${description}</p>` : ''}
        <div>
          ${faqsHTML}
        </div>
      </div>
    </div>
  `;
};

// Generate HTML for Testimonials component
export const generateTestimonialsHTML = (component: ComponentData, globalStyles: any): string => {
  const { title, testimonials } = component.props;
  const { backgroundColor, textColor, headlineColor, cardBackgroundColor, cardTextColor } = component.style || {};
  
  const baseColor = getGlobalStyleValue(globalStyles, 'baseColor');
  
  const containerStyles = {
    'background-color': backgroundColor || baseColor,
    'color': textColor || '#333',
    'padding': '64px 0 96px'
  };
  
  const innerStyles = {
    'max-width': '1400px',
    'margin': '0 auto',
    'padding': '0 16px'
  };
  
  const titleStyles = {
    'font-size': '48px',
    'font-weight': 'bold',
    'text-align': 'center',
    'margin-bottom': '64px',
    'color': headlineColor || textColor || '#333'
  };
  
  const testimonialsHTML = testimonials.map((testimonial: any) => `
    <div style="padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background-color: ${cardBackgroundColor || '#ffffff'}; color: ${cardTextColor || textColor || '#333'};">
      <div style="display: flex; margin-bottom: 16px;">
        ${'★'.repeat(5)}
      </div>
      <blockquote style="font-size: 18px; line-height: 1.6; margin-bottom: 24px; font-style: italic;">
        "${testimonial.content}"
      </blockquote>
      <div style="display: flex; align-items: center;">
        <img src="${testimonial.avatar}" alt="${testimonial.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin-right: 16px;">
        <div>
          <div style="font-weight: 600;">${testimonial.name}</div>
          <div style="font-size: 14px; opacity: 0.7;">${testimonial.role} at ${testimonial.company}</div>
        </div>
      </div>
    </div>
  `).join('');
  
  return `
    <div style="${generateInlineStyles(containerStyles)}">
      <div style="${generateInlineStyles(innerStyles)}">
        ${title ? `<h2 style="${generateInlineStyles(titleStyles)}">${title}</h2>` : ''}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 32px;">
          ${testimonialsHTML}
        </div>
      </div>
    </div>
  `;
};

// Generate HTML for Tab component
export const generateTabHTML = (component: ComponentData, globalStyles: any): string => {
  const { title, description, tabs } = component.props;
  const { backgroundColor, textColor, headlineColor, descriptionColor, accentColor } = component.style || {};

  const baseColor = getGlobalStyleValue(globalStyles, 'baseColor');
  const mainColor = getGlobalStyleValue(globalStyles, 'mainColor');

  const containerStyles = {
    'background-color': backgroundColor || baseColor,
    'color': textColor || '#333',
    'padding': '64px 0 96px'
  };

  const innerStyles = {
    'max-width': '1200px',
    'margin': '0 auto',
    'padding': '0 16px'
  };

  const tabButtonsHTML = tabs.map((tab: any, index: number) => `
    <button
      role="tab"
      data-tab-trigger="${component.id}-tab-${index}"
      aria-selected="${index === 0 ? 'true' : 'false'}"
      aria-controls="${component.id}-panel-${index}"
      class="${index === 0 ? 'is-active' : ''}"
      style="padding: 12px 24px; font-size: 16px; font-weight: 500; border: none; border-bottom: 2px solid ${index === 0 ? (accentColor || mainColor) : 'transparent'}; background: none; color: ${index === 0 ? (accentColor || mainColor) : textColor || '#666'}; cursor: pointer; transition: all 0.3s;"
    >
      ${tab.label}
    </button>
  `).join('');

  const tabContentsHTML = tabs.map((tab: any, index: number) => `
    <div
      id="${component.id}-panel-${index}"
      role="tabpanel"
      data-tab-content="${component.id}-tab-${index}"
      data-tab-group="${component.id}"
      aria-labelledby="${component.id}-tab-${index}"
      class="${index === 0 ? 'is-active' : ''}"
      style="display: ${index === 0 ? 'block' : 'none'}; padding-top: 32px;"
    >
      <p style="font-size: 18px; line-height: 1.6; color: ${textColor || '#333'};">${tab.content}</p>
    </div>
  `).join('');

  return `
    <div style="${generateInlineStyles(containerStyles)}">
      <div style="${generateInlineStyles(innerStyles)}">
        ${title ? `<h2 style="font-size: 48px; font-weight: bold; text-align: center; margin-bottom: 16px; color: ${headlineColor || textColor || '#333'};">${title}</h2>` : ''}
        ${description ? `<p style="font-size: 20px; text-align: center; max-width: 768px; margin: 0 auto 48px; color: ${descriptionColor || textColor || '#666'};">${description}</p>` : ''}
        <div data-tab-group="${component.id}">
          <div role="tablist" style="border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; gap: 32px;">
              ${tabButtonsHTML}
            </div>
          </div>
          <div>
            ${tabContentsHTML}
          </div>
        </div>
      </div>
    </div>
  `;
};

// Generate HTML for Modal component
export const generateModalHTML = (component: ComponentData, globalStyles: any): string => {
  const { buttonText, modalTitle, modalContent, buttonStyle } = component.props;
  const { backgroundColor, textColor, accentColor, buttonBackgroundColor, buttonTextColor } = component.style || {};

  const baseColor = getGlobalStyleValue(globalStyles, 'baseColor');
  const mainColor = getGlobalStyleValue(globalStyles, 'mainColor');

  const containerStyles = {
    'background-color': backgroundColor || baseColor,
    'color': textColor || '#333',
    'padding': '64px 0 96px',
    'text-align': 'center'
  };

  const innerStyles = {
    'max-width': '1200px',
    'margin': '0 auto',
    'padding': '0 16px'
  };

  return `
    <div style="${generateInlineStyles(containerStyles)}">
      <div style="${generateInlineStyles(innerStyles)}">
        <button
          data-modal-open="${component.id}"
          style="padding: 12px 24px; font-size: 16px; font-weight: 600; border-radius: 8px; border: none; background-color: ${buttonBackgroundColor || mainColor}; color: ${buttonTextColor || '#fff'}; cursor: pointer; transition: opacity 0.3s;"
          onmouseover="this.style.opacity='0.9'"
          onmouseout="this.style.opacity='1'"
        >
          ${buttonText || 'モーダルを開く'}
        </button>

        <div class="modal-overlay" style="display: none; position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 1000; padding: 16px; align-items: center; justify-content: center;">
          <div
            data-modal="${component.id}"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title-${component.id}"
            style="position: relative; max-width: 768px; width: 100%; background-color: #fff; border-radius: 8px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); padding: 32px;"
          >
            <button
              data-modal-close
              aria-label="閉じる"
              style="position: absolute; top: 16px; right: 16px; padding: 8px; border-radius: 8px; border: none; background: none; cursor: pointer; font-size: 24px; line-height: 1;"
              onmouseover="this.style.backgroundColor='#f3f4f6'"
              onmouseout="this.style.backgroundColor='transparent'"
            >
              ×
            </button>
            <h3 id="modal-title-${component.id}" style="font-size: 32px; font-weight: bold; margin-bottom: 16px; padding-right: 40px;">${modalTitle || 'モーダルタイトル'}</h3>
            <p style="font-size: 18px; line-height: 1.6; color: #666;">${modalContent || 'モーダルのコンテンツがここに表示されます。'}</p>
            <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 16px;">
              <button
                data-modal-close
                style="padding: 8px 24px; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; transition: background-color 0.3s;"
                onmouseover="this.style.backgroundColor='#f9fafb'"
                onmouseout="this.style.backgroundColor='#fff'"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Generate HTML for Slider component
export const generateSliderHTML = (component: ComponentData, globalStyles: any): string => {
  const { title, description, slides, autoplay = true, autoplayDelay = 8000 } = component.props;
  const { backgroundColor, textColor, headlineColor, descriptionColor } = component.style || {};

  const baseColor = getGlobalStyleValue(globalStyles, 'baseColor');

  const containerStyles = {
    'background-color': backgroundColor || baseColor,
    'color': textColor || '#333',
    'padding': '64px 0 96px'
  };

  const innerStyles = {
    'max-width': '1200px',
    'margin': '0 auto',
    'padding': '0 16px'
  };

  const slidesHTML = slides.map((slide: any, index: number) => `
    <div
      data-slider-item
      class="${index === 0 ? 'is-active' : ''}"
      aria-hidden="${index !== 0}"
      style="position: absolute; inset: 0; opacity: ${index === 0 ? '1' : '0'}; transition: opacity 0.5s;"
    >
      <img
        src="${slide.image || 'https://images.pexels.com/photos/6044265/pexels-photo-6044265.jpeg?auto=compress&cs=tinysrgb&w=1200'}"
        alt="${slide.caption || `スライド ${index + 1}`}"
        style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"
      />
      ${slide.caption ? `
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background-color: rgba(0, 0, 0, 0.5); color: #fff; padding: 24px;">
          <p style="font-size: 18px; font-weight: 600; margin: 0;">${slide.caption}</p>
        </div>
      ` : ''}
    </div>
  `).join('');

  const dotsHTML = slides.map((_: any, index: number) => `
    <button
      data-slider-dot="${index}"
      aria-label="スライド ${index + 1} に移動"
      aria-current="${index === 0 ? 'true' : 'false'}"
      class="${index === 0 ? 'is-active' : ''}"
      style="width: 12px; height: 12px; border-radius: 50%; border: none; background-color: ${index === 0 ? '#fff' : 'rgba(255, 255, 255, 0.5)'}; cursor: pointer; transition: all 0.3s;"
    ></button>
  `).join('');

  return `
    <div style="${generateInlineStyles(containerStyles)}">
      <div style="${generateInlineStyles(innerStyles)}">
        ${title ? `<h2 style="font-size: 48px; font-weight: bold; text-align: center; margin-bottom: 16px; color: ${headlineColor || textColor || '#333'};">${title}</h2>` : ''}
        ${description ? `<p style="font-size: 20px; text-align: center; max-width: 768px; margin: 0 auto 48px; color: ${descriptionColor || textColor || '#666'};">${description}</p>` : ''}
        <div data-slider="${component.id}" data-slider-autoplay="${autoplayDelay}" style="position: relative;">
          <div style="position: relative; overflow: hidden; border-radius: 8px; min-height: 400px;">
            ${slidesHTML}
          </div>
          ${slides.length > 1 ? `
            <button
              data-slider-prev
              aria-label="前のスライド"
              style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); padding: 12px; border-radius: 50%; border: none; background-color: rgba(255, 255, 255, 0.8); cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); transition: background-color 0.3s;"
              onmouseover="this.style.backgroundColor='rgba(255, 255, 255, 1)'"
              onmouseout="this.style.backgroundColor='rgba(255, 255, 255, 0.8)'"
            >
              <span style="display: block; width: 24px; height: 24px; border-left: 3px solid #333; border-bottom: 3px solid #333; transform: rotate(45deg);"></span>
            </button>
            <button
              data-slider-next
              aria-label="次のスライド"
              style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); padding: 12px; border-radius: 50%; border: none; background-color: rgba(255, 255, 255, 0.8); cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); transition: background-color 0.3s;"
              onmouseover="this.style.backgroundColor='rgba(255, 255, 255, 1)'"
              onmouseout="this.style.backgroundColor='rgba(255, 255, 255, 0.8)'"
            >
              <span style="display: block; width: 24px; height: 24px; border-right: 3px solid #333; border-top: 3px solid #333; transform: rotate(45deg);"></span>
            </button>
            <div style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px;">
              ${dotsHTML}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};

// Main function to generate HTML for any component
export const generateComponentHTML = (component: ComponentData, globalStyles: any): string => {
  switch (component.type) {
    case 'headline':
      return generateHeadlineHTML(component, globalStyles);
    case 'kv':
      return generateKVHTML(component, globalStyles);
    case 'pricing':
      return generatePricingHTML(component, globalStyles);
    case 'app-intro':
      return generateAppIntroHTML(component, globalStyles);
    case 'test':
      return generateFAQHTML(component, globalStyles);
    case 'tab':
      return generateTabHTML(component, globalStyles);
    case 'modal':
      return generateModalHTML(component, globalStyles);
    case 'slider':
      return generateSliderHTML(component, globalStyles);
    default:
      return `<div><!-- Unsupported component type: ${component.type} --></div>`;
  }
};