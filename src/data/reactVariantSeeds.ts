import type { ComponentTemplateData } from '../utils/componentTemplateStorage';

/**
 * Built-in React component variants (migrated from src/data/templates).
 * Used for Supabase bootstrap when rows are missing.
 */
export interface ReactVariantSeed {
  nameRomanized: string;
  displayName: string;
  category: string;
  categoryRomanized: string;
  uniqueId: string;
  sectionId: string;
  description: string;
  thumbnailUrl: string;
  componentType: string;
  defaultProps: Record<string, unknown>;
  cssFiles: string[];
  jsFiles: string[];
}

export const REACT_VARIANT_SEEDS: ReactVariantSeed[] = [
  {
    nameRomanized: 'program-hero',
    displayName: 'KV-1',
    category: 'KV',
    categoryRomanized: 'kv',
    uniqueId: 'kv_program_hero',
    sectionId: 'kv_program_heroArea',
    description: '単番組ジェネレータ用スライダー付きKV',
    thumbnailUrl: '/program/st/promo/generator_common/img/thumbnail_kv-1.jpg',
    componentType: 'kv',
    cssFiles: ['kv.css'],
    jsFiles: [],
    defaultProps: {
      pattern: 'program-hero',
      title: 'ブラックリスト ファイナル・シーズン',
      description:
        '世界で最も危険な犯罪者たちのリストを持つ元政府エージェント、レイモンド・レディントンが、FBIと協力して凶悪犯を追い詰める。シリーズ最終章となる今シーズンでは、これまでの謎がついに明かされる。',
      expandedDescription:
        'レイモンド・"レッド"・レディントンは、シーズン1冒頭に世界で暗躍する凶悪犯罪者たちのリスト"ブラックリスト"を持参してFBIに自首した。彼の目的は、このリストに載った犯罪者たちを一人ずつ捕まえることだった。しかし、彼には一つだけ条件があった。それは、新人FBI捜査官エリザベス・キーンとだけ話をするということだった。',
      showMoreText: 'もっと見る',
      showLessText: '閉じる',
      channelInfo: {
        number: 'CS310',
        name: 'スーパー！ドラマＴＶ　＃海外ドラマ☆エンタメ',
      },
      broadcastInfo: {
        schedule: '7/25(火) 22:00～22:55 スタート<br>【二カ国語版】毎週(火) 22:00～ほか',
        streamingBadgeText: '同時・見逃し',
        badges: [{ text: 'ドラマ', color: '#3b82f6' }],
      },
      mediaItems: [
        {
          type: 'image',
          url: '/program/st/promo/generator_common/img/program01.jpg',
          alt: 'ブラックリスト メインビジュアル',
        },
        {
          type: 'video',
          url: 'https://www.youtube.com/embed/XVVXQsv7o8I?rel=0&enablejsapi=1',
          alt: 'ブラックリスト 予告編',
        },
        {
          type: 'image',
          url: '/program/st/promo/generator_common/img/program02.jpg',
          alt: 'ブラックリスト シーン3',
        },
      ],
    },
  },
  {
    nameRomanized: 'price-table',
    displayName: '料金表示',
    category: '料金',
    categoryRomanized: 'pricing',
    uniqueId: 'pricing_price_table',
    sectionId: 'pricing_price_tableArea',
    description: '価格比較と詳細な料金プランを表示する料金表コンポーネント',
    thumbnailUrl: '/program/st/promo/generator_common/img/thumbnail_pricing-1.jpg',
    componentType: 'pricing',
    cssFiles: ['pricing.css'],
    jsFiles: [],
    defaultProps: {
      showMustReadBox: true,
      showPriceInfo2: true,
      mainPlan: {
        description: 'ブラックリスト',
        name: 'スカパー！基本プラン',
        price: '1,980',
        note: '※翌月以降は3,960円/月（税込）',
        hasDetails: true,
        detailsLabel: '初回視聴料1,980円(税込)の注意事項',
      },
      additionalPlans: [
        {
          description:
            '○○（番組・特集・アーティスト名など）が見られる、スーパー！ドラマTVなど5チャンネルがえらべる',
          name: 'スーパー！セレクト5',
          price: '1,100',
        },
        {
          description:
            '○○（番組・特集・アーティスト名など）が見られる、スーパー！ドラマTVなど5チャンネルがえらべる',
          name: 'スーパー！セレクト5',
          price: '1,100',
        },
      ],
    },
  },
];

/** 旧 componentTemplates.ts の id → unique_id（保存済みページの templateId 互換） */
export const LEGACY_TEMPLATE_ID_MAP: Record<string, string> = {
  'kv-1': 'kv_program_hero',
  'pricing-1': 'pricing_price_table',
};

const now = () => new Date().toISOString();

/** Supabase 未接続・未投入時もライブラリ・描画に使う組み込みカタログ */
export const builtinReactVariantsAsTemplateData = (): ComponentTemplateData[] =>
  REACT_VARIANT_SEEDS.map((seed) => ({
    id: `builtin-${seed.uniqueId}`,
    name: seed.nameRomanized,
    nameRomanized: seed.nameRomanized,
    displayName: seed.displayName,
    category: seed.category,
    categoryRomanized: seed.categoryRomanized,
    uniqueId: seed.uniqueId,
    sectionId: seed.sectionId,
    thumbnailUrl: seed.thumbnailUrl,
    description: seed.description,
    codeTemplate: '',
    htmlMarkup: '',
    defaultProps: seed.defaultProps as Record<string, unknown>,
    propSchema: [],
    cssFiles: seed.cssFiles,
    jsFiles: seed.jsFiles,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
    renderMode: 'react' as const,
    componentType: seed.componentType,
    isDraft: false,
  }));

export const resolveLegacyTemplateId = (id: string): string =>
  LEGACY_TEMPLATE_ID_MAP[id] ?? id;
