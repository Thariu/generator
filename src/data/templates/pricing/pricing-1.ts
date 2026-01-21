import { ComponentTemplate } from '../../types';

export const pricing1Template: ComponentTemplate = {
  id: 'pricing-1',
  type: 'pricing',
  name: '料金表示',
  nameRomanized: 'price-table',
  description: '価格比較と詳細な料金プランを表示する料金表コンポーネント',
  thumbnail: '/program/st/promo/generator_common/img/thumbnail_pricing-1.jpg',
  category: '料金',
  categoryRomanized: 'pricing',
  uniqueId: 'pricing_price_table',
  defaultProps: {
    showMustReadBox: true,
    mainPlan: {
      description: 'ブラックリスト',
      name: 'スカパー！基本プラン',
      price: '1,980',
      note: '※翌月以降は3,960円/月（税込）',
      hasDetails: true,
      detailsLabel: '初回視聴料1,980円(税込)の注意事項'
    },
    additionalPlans: [
      {
        description: '○○（番組・特集・アーティスト名など）が見られる、スーパー！ドラマTVなど5チャンネルがえらべる',
        name: 'スーパー！セレクト5',
        price: '1,100',
      },
      {
        description: '○○（番組・特集・アーティスト名など）が見られる、スーパー！ドラマTVなど5チャンネルがえらべる',
        name: 'スーパー！セレクト5',
        price: '1,100',
      }
    ]
  },
  cssFiles: ['pricing.css'],
  jsFiles: [],
};
