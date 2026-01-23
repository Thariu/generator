// KVコンポーネントのエディタ

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BaseEditorProps, useBaseEditor } from '../BaseEditor';
import ImageDropZone from '../../../UI/ImageDropZone';
import { ImageUploadResult } from '../../../../utils/imageHandler';

export const KVEditor: React.FC<BaseEditorProps> = (props) => {
  const { component, styles, handlePropChange, handleFocus, handleBlur } = useBaseEditor(props);

  const handleChannelInfoChange = (field: 'number' | 'name', value: string) => {
    const newChannelInfo = { ...component.props.channelInfo, [field]: value };
    handlePropChange('channelInfo', newChannelInfo);
  };

  const handleMediaItemChange = (index: number, field: string, value: string) => {
    const newItems = [...(component.props.mediaItems || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    handlePropChange('mediaItems', newItems);
  };

  const handleMediaImageUpload = (index: number, field: string, result: ImageUploadResult) => {
    const newItems = [...(component.props.mediaItems || [])];
    newItems[index] = { ...newItems[index], [field]: result.url };
    handlePropChange('mediaItems', newItems);
  };

  const addMediaItem = () => {
    const newItems = [...(component.props.mediaItems || [])];
    newItems.push({
      type: 'image',
      url: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800',
      alt: '番組画像'
    });
    handlePropChange('mediaItems', newItems);
  };

  const removeMediaItem = (index: number) => {
    const newItems = [...(component.props.mediaItems || [])];
    newItems.splice(index, 1);
    handlePropChange('mediaItems', newItems);
  };

  const convertToEmbedUrl = (url: string): string => {
    if (!url) return '';

    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }

    return url;
  };

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>基本情報</h3>

        <div style={styles.field}>
          <label style={styles.label}>番組タイトル</label>
          <input
            type="text"
            value={component.props.title || ''}
            onChange={(e) => handlePropChange('title', e.target.value)}
            style={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>番組説明（基本）</label>
          <textarea
            value={component.props.description || ''}
            onChange={(e) => handlePropChange('description', e.target.value)}
            rows={3}
            style={styles.textarea}
            placeholder="デフォルトで表示される番組説明を入力してください"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>番組説明（展開時）</label>
          <textarea
            value={component.props.expandedDescription || ''}
            onChange={(e) => handlePropChange('expandedDescription', e.target.value)}
            rows={4}
            style={styles.textarea}
            placeholder="「もっと見る」をクリックした時に表示される詳細説明を入力してください（空の場合は「もっと見る」ボタンは表示されません）"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <div style={styles.note}>
            このフィールドが空の場合、「もっと見る」ボタンは表示されません。
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>放送情報</h3>
          <div style={styles.field}>
            <label style={styles.label}>配信バッジ種別</label>
            <select
              value={component.props.broadcastInfo?.streamingBadgeText || '同時・見逃し'}
              onChange={(e) => handlePropChange('broadcastInfo', { ...component.props.broadcastInfo, streamingBadgeText: e.target.value })}
              style={styles.input}
            >
              <option value="同時・見逃し">同時・見逃し</option>
              <option value="見逃し配信">見逃し配信</option>
              <option value="同時配信">同時配信</option>
              <option value="テスト">テスト</option>
            </select>
          </div>

          <div style={styles.field}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={styles.label}>放送情報バッジ</label>
            </div>

            {(component.props.broadcastInfo?.badges || []).map((badge: any, badgeIndex: number) => (
              <div key={badgeIndex} style={styles.itemCard}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemIndex}>バッジ {badgeIndex + 1}</span>
                  <button
                    onClick={() => {
                      const currentBadges = [...(component.props.broadcastInfo?.badges || [])];
                      currentBadges.splice(badgeIndex, 1);
                      handlePropChange('broadcastInfo', {
                        ...component.props.broadcastInfo,
                        badges: currentBadges
                      });
                    }}
                    style={styles.deleteButton}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>バッジテキスト</label>
                  <input
                    type="text"
                    value={badge.text || ''}
                    onChange={(e) => {
                      const currentBadges = [...(component.props.broadcastInfo?.badges || [])];
                      currentBadges[badgeIndex] = { ...currentBadges[badgeIndex], text: e.target.value };
                      handlePropChange('broadcastInfo', {
                        ...component.props.broadcastInfo,
                        badges: currentBadges
                      });
                    }}
                    placeholder="例: 最新話配信中"
                    style={styles.input}
                  />
                </div>
              </div>
            ))}

            {(!component.props.broadcastInfo?.badges || component.props.broadcastInfo.badges.length === 0) && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '12px'
              }}>
                放送情報バッジが設定されていません。「バッジ追加」ボタンで追加してください。
              </div>
            )}

            {(component.props.broadcastInfo?.badges || []).length < 10 && (
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  onClick={() => {
                    const currentBadges = component.props.broadcastInfo?.badges || [];
                    handlePropChange('broadcastInfo', {
                      ...component.props.broadcastInfo,
                      badges: [...currentBadges, { text: '新しいバッジ', color: '#dc2626' }]
                    });
                  }}
                  style={styles.addButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  <Plus size={12} style={{ marginRight: '4px' }} />
                  バッジ追加
                </button>
              </div>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>放送スケジュール</label>
            <input
              type="text"
              value={component.props.broadcastInfo?.schedule || ''}
              onChange={(e) => handlePropChange('broadcastInfo', { ...component.props.broadcastInfo, schedule: e.target.value })}
              placeholder="例: 毎週金曜 21:00-22:00"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>チャンネル番号</label>
            <input
              type="text"
              value={component.props.channelInfo?.number || ''}
              onChange={(e) => handleChannelInfoChange('number', e.target.value)}
              placeholder="例: CS310"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>チャンネル名</label>
            <input
              type="text"
              value={component.props.channelInfo?.name || ''}
              onChange={(e) => handleChannelInfoChange('name', e.target.value)}
              placeholder="例: スーパー！ドラマＴＶ"
              style={styles.input}
            />
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={styles.sectionTitle}>カルーセルアイテム（画像・動画）</h3>
        </div>

        <div>
          {(component.props.mediaItems || []).map((item: any, index: number) => (
            <div key={index} style={styles.itemCard}>
              <div style={styles.itemHeader}>
                <span style={styles.itemIndex}>メディア {index + 1}</span>
                <button
                  onClick={() => removeMediaItem(index)}
                  style={styles.deleteButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>メディアタイプ</label>
                <select
                  value={item.type || 'image'}
                  onChange={(e) => {
                    handleMediaItemChange(index, 'type', e.target.value);
                    if (e.target.value === 'video') {
                      handleMediaItemChange(index, 'url', 'https://www.youtube.com/embed/XVVXQsv7o8I');
                    }
                  }}
                  style={styles.input}
                >
                  <option value="image">画像</option>
                  <option value="video">動画（YouTube埋め込み）</option>
                </select>
              </div>

              {item.type === 'video' ? (
                <div style={styles.field}>
                  <label style={styles.label}>YouTube埋め込みURL</label>
                  <input
                    type="url"
                    value={convertToEmbedUrl(item.url) || ''}
                    onChange={(e) => handleMediaItemChange(index, 'url', e.target.value)}
                    placeholder="例: https://www.youtube.com/embed/VIDEO_ID"
                    style={styles.input}
                  />
                  <div style={styles.note}>
                    YouTube動画の埋め込みURLを入力してください。通常のYouTube URLは自動的に埋め込み形式に変換されます。
                  </div>
                </div>
              ) : (
                <div style={styles.field}>
                  <label style={styles.label}>画像</label>
                  <ImageDropZone
                    onImageUpload={(result) => handleMediaImageUpload(index, 'url', result)}
                    currentImageUrl={item.url}
                    placeholder="画像をドラッグ&ドロップまたはクリックして選択"
                    showPreview={true}
                  />
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>代替テキスト</label>
                <input
                  type="text"
                  value={item.alt || ''}
                  onChange={(e) => handleMediaItemChange(index, 'alt', e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button
            onClick={addMediaItem}
            style={styles.addButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <Plus size={12} style={{ marginRight: '4px' }} />
            カルーセルアイテムを追加
          </button>
        </div>
      </div>
    </div>
  );
};
