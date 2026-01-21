import { ComponentTemplate } from '../../types';

export const appIntro1Template: ComponentTemplate = {
  id: 'app-intro-1',
  type: 'app-intro',
  name: '番組配信とは',
  nameRomanized: 'streaming-intro',
  description: 'スカパー！番組配信の紹介とアプリダウンロードを促進するコンポーネント',
  thumbnail: '/program/st/promo/generator_common/img/thumbnail_app-intro-1.jpg',
  category: '番組配信',
  categoryRomanized: 'streaming',
  uniqueId: 'streaming_streaming_intro',
  defaultProps: {
    balloonText: 'ブラックリスト'
  }
};
