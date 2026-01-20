// フィールド定義の型定義

export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'color' | 'image' | 'link';

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  rows?: number;
  options?: { value: string; label: string }[];
  note?: string;
  defaultValue?: any;
  section?: string; // '基本情報', '放送情報' など
}

export interface ComponentFieldConfig {
  componentType: string;
  sections: {
    title: string;
    fields: FieldDefinition[];
  }[];
}

// コンポーネントタイプごとのフィールド定義（手動定義用）
export const componentFieldConfigs: Record<string, ComponentFieldConfig> = {
  kv: {
    componentType: 'kv',
    sections: [
      {
        title: '基本情報',
        fields: [
          {
            key: 'title',
            label: '番組タイトル',
            type: 'text',
            section: '基本情報',
          },
          {
            key: 'description',
            label: '番組説明（基本）',
            type: 'textarea',
            rows: 3,
            placeholder: 'デフォルトで表示される番組説明を入力してください',
            section: '基本情報',
          },
          {
            key: 'expandedDescription',
            label: '番組説明（展開時）',
            type: 'textarea',
            rows: 4,
            placeholder: '「もっと見る」をクリックした時に表示される詳細説明を入力してください',
            note: 'このフィールドが空の場合、「もっと見る」ボタンは表示されません。',
            section: '基本情報',
          },
        ],
      },
      {
        title: '放送情報',
        fields: [
          {
            key: 'broadcastInfo.streamingBadgeText',
            label: '配信バッジ種別',
            type: 'select',
            options: [
              { value: '同時・見逃し', label: '同時・見逃し' },
              { value: '見逃し配信', label: '見逃し配信' },
              { value: '同時配信', label: '同時配信' },
            ],
            section: '放送情報',
          },
        ],
      },
    ],
  },
  headline: {
    componentType: 'headline',
    sections: [
      {
        title: 'コンテンツ',
        fields: [
          {
            key: 'text',
            label: 'ヘッドラインテキスト',
            type: 'textarea',
            rows: 3,
            section: 'コンテンツ',
          },
        ],
      },
    ],
  },
};
