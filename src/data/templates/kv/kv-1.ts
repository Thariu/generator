import { ComponentTemplate } from '../../types';

export const kv1Template: ComponentTemplate = {
  id: 'kv-1',
  type: 'kv',
  name: 'KV-1',
  nameRomanized: 'program-hero',
  description: '単番組ジェネレータ用スライダー付きKV',
  thumbnail: '/program/st/promo/generator_common/img/thumbnail_kv-1.jpg',
  category: 'KV',
  categoryRomanized: 'kv',
  uniqueId: 'kv_program_hero',
  defaultProps: {
    pattern: 'program-hero',
    title: 'ブラックリスト ファイナル・シーズン',
    description: '世界で最も危険な犯罪者たちのリストを持つ元政府エージェント、レイモンド・レディントンが、FBIと協力して凶悪犯を追い詰める。シリーズ最終章となる今シーズンでは、これまでの謎がついに明かされる。',
    expandedDescription: 'レイモンド・"レッド"・レディントンは、シーズン1冒頭に世界で暗躍する凶悪犯罪者たちのリスト"ブラックリスト"を持参してFBIに自首した。彼の目的は、このリストに載った犯罪者たちを一人ずつ捕まえることだった。しかし、彼には一つだけ条件があった。それは、新人FBI捜査官エリザベス・キーンとだけ話をするということだった。',
    showMoreText: 'もっと見る',
    showLessText: '閉じる',
    channelInfo: {
      number: 'CS310',
      name: 'スーパー！ドラマＴＶ　＃海外ドラマ☆エンタメ'
    },
    broadcastInfo: {
      schedule: '7/25(火) 22:00～22:55 スタート<br>【二カ国語版】毎週(火) 22:00～ほか',
      streamingBadgeText: '同時・見逃し',
      badges: [
        { text: 'ドラマ', color: '#3b82f6' }
      ]
    },
    mediaItems: [
      {
        type: 'image',
        url: '/program/st/promo/generator_common/img/program01.jpg',
        alt: 'ブラックリスト メインビジュアル'
      },
      {
        type: 'video',
        url: 'https://www.youtube.com/embed/XVVXQsv7o8I?rel=0&enablejsapi=1',
        alt: 'ブラックリスト 予告編'
      },
      {
        type: 'image',
        url: '/program/st/promo/generator_common/img/program02.jpg',
        alt: 'ブラックリスト シーン3'
      }
    ],
  },
  cssFiles: ['kv.css'],
  jsFiles: [],
};
