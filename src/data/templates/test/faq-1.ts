import { ComponentTemplate } from '../../types';

export const faq1Template: ComponentTemplate = {
  id: 'faq-1',
  type: 'test',
  name: 'テスト',
  nameRomanized: 'faq',
  description: 'テストコンポーネント',
  thumbnail: 'https://placehold.jp/400x267.png',
  category: 'テスト',
  categoryRomanized: 'test',
  uniqueId: 'test_faq',
  defaultProps: {
    title: 'テスト',
    description: 'テストコンポーネント',
    faqs: [
      {
        question: '質問1',
        answer: '回答1'
      },
      {
        question: '質問2',
        answer: '回答2'
      },
      {
        question: '質問3',
        answer: '回答3'
      },
      {
        question: '質問4',
        answer: '回答4'
      }
    ]
  },
  cssFiles: ['test.css'],
  jsFiles: [],
};
