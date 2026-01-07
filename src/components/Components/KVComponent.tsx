import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Calendar, Users } from 'lucide-react';
import { ComponentData } from '../../types';
import { useComponentData } from '../../hooks/useComponentData';
import { useDataPropBinding } from '../../hooks/useDataPropBinding';

interface KVComponentProps {
  component: ComponentData;
  isEditing?: boolean;
}

const KVComponent: React.FC<KVComponentProps> = ({ component }) => {
  const { props, style, globalStyles } = useComponentData(component);
  const containerRef = useDataPropBinding({ props });

  const {
    mediaItems = [],
    title,
    description,
    cast,
    broadcastInfo,
    ctaButtons,
    additionalInfo,
    expandedDescription,
    showMoreText = 'もっと見る',
    showLessText = '閉じる',
    channelInfo,
  } = props;

  const { mainColor, baseColor, base2Color, accentColor } = globalStyles;

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // デフォルトのメディアアイテム（番組ヒーロー用）
  const defaultMediaItems = [
    {
      type: 'image',
      url: '/program/st/promo/generator_common/img/program01.jpg',
      alt: 'メインビジュアル'
    },
    {
      type: 'video',
      url: 'https://www.youtube.com/embed/XVVXQsv7o8I?rel=0&enablejsapi=1',
      alt: '予告編'
    },
    {
      type: 'image',
      url: '/program/st/promo/generator_common/img/program02.jpg',
      alt: 'シーン画像'
    }
  ];

  const activeMediaItems = mediaItems.length > 0 ? mediaItems : defaultMediaItems;

  // YouTube URLを埋め込み形式に変換
  const convertToEmbedUrl = (url: string): string => {
    if (!url) return '';
    // 既に埋め込み形式の場合はそのまま返す
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    // 通常のYouTube URLを埋め込み形式に変換
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/$${videoIdMatch[1]}`;
    }
    return url;
  };

  // 番組ヒーロー用の自動スライド
  useEffect(() => {
    if (activeMediaItems.length > 1 && isAutoSliding) {
      const interval = setInterval(() => {
        // 動画が再生中の場合は自動スライドを停止
        if (!isVideoPlaying) {
          setCurrentMediaIndex((prev) => {
            const newIndex = (prev + 1) % activeMediaItems.length;
            return newIndex;
          });
        }
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [activeMediaItems.length, isAutoSliding, isVideoPlaying]);

  // メディアスライド変更時の処理
  const changeMediaSlide = (newIndex: number) => {
    setCurrentMediaIndex(newIndex);
    setIsAutoSliding(true); // 手動変更時は自動スライドを再開
  };

  const nextMediaSlide = () => {
    const newIndex = (currentMediaIndex + 1) % activeMediaItems.length;
    changeMediaSlide(newIndex);
  };

  const prevMediaSlide = () => {
    const newIndex = (currentMediaIndex - 1 + activeMediaItems.length) % activeMediaItems.length;
    changeMediaSlide(newIndex);
  };


  // パターン4: 番組ヒーロー型
  return (
    <section ref={containerRef} id='kvArea' className="baseColor base-pattern-1">
      <div className="mainInfo">
        <div className="flexWrapper">

          {/* 左側：番組情報 */}
          <div className="textInfo">
            {/* タイトル */}
            <h2 className="commonColor" data-component-headline>
              {title || 'ブラックリスト ファイナル・シーズン'}
            </h2>

            {/* 放送情報バッジ */}
            {broadcastInfo && (
              <div className="flagWrapper">
                {/* 1. 配信バッジ (特別扱い) */}
                {broadcastInfo.streamingBadgeText && (
                  <p className="flag flag_streaming accentColor">
                    {broadcastInfo.streamingBadgeText}
                  </p>
                )}
                {/* 2. 追加バッジ (従来通り) */}
                {(broadcastInfo.badges || []).map((badge: any, index: number) => (
                  <p key={index} className="flag main-pattern-1 mainColor">
                    {badge.text}
                  </p>
                ))}
              </div>
            )}

            {/* スケジュール */}
            <p className="schedule">
              <span dangerouslySetInnerHTML={{ __html: broadcastInfo.schedule }} />
            </p>
            <div className="icon icon1">
              <div className="iconInfo">
                  <p className="chNumber">{channelInfo?.number || 'CS310'}</p>
                  <p className="chName">{channelInfo?.name || 'スーパー！ドラマＴＶ　＃海外ドラマ☆エンタメ'}</p>
              </div>
            </div>
            {/* <div className="icon icon2">
              <div className="iconImg"><img src="/program/st/promo/generator_common/img/kihon_logo.gif" alt="基本プラン" className="guard"/></div>
              <div className="iconInfo">
                  <p className="chExplain">スカパー！基本プランでもご視聴いただけます。</p>
                  <p><a href="#priceInfo2" className="borderBottom js-scroll">詳しくはこちら</a></p>
              </div>
            </div>
            <div className="streamingBox streamingBox01">
              <div className="streamingItem img"><img src="/program/st/promo/generator_common/img/skppi_logo.svg" alt="スカッピー"/></div>
              <div className="streamingItem text">
                  <p className="streamingText weightM">この番組は<span><img src="/program/st/promo/generator_common/img/streamingText.svg" alt="スカパー！番組配信"/></span>でも<br className="sp"/>ご視聴いただけます。</p>
                  <p className="streamingText weightS">
                      ●{channelInfo?.name || 'スーパー！ドラマＴＶ　＃海外ドラマ☆エンタメ'}チャンネルをご契約の方（パック・セット等含む）は、追加料金なしでご視聴いただけます。
                  </p>
                  <p className="streamingText fontM">スカパー！番組配信のご視聴方法は<a href="#streamingArea" className="borderBottom">こちら</a></p>
              </div>
            </div> */}
          </div>

          {/* 右側：メディアスライダー */}
          <div className="movieInfo movieInfo_single">
            {activeMediaItems && activeMediaItems.length > 0 && (
              <>
                {/* 現在のメディアアイテムを表示 */}
                <div id='kvSlider' data-slider={component.id} data-slider-autoplay="8000">
                  {activeMediaItems.map((item, index) => (
                    <div key={index} data-slider-item className={index === currentMediaIndex ? 'is-active' : ''}>
                      {item.type === 'video' ? (
                        <iframe id="player" width="440" height="329"
                          src={convertToEmbedUrl(item.url)}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <p className='img'>
                          <img
                            className='guard'
                            src={item.url}
                            alt={item.alt}
                          />
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* ナビゲーションボタン */}
                {activeMediaItems.length > 1 && (
                  <>
                    <button
                      data-slider-prev
                      onClick={prevMediaSlide}
                      className="slider-nav-button slider-nav-prev"
                    >
                      <span className='arrow arrow-prev'></span>
                    </button>

                    <button
                      data-slider-next
                      onClick={nextMediaSlide}
                      className="slider-nav-button slider-nav-next"
                    >
                      <span className='arrow arrow-next'></span>
                    </button>
                  </>
                )}

                {/* ドットインジケーター */}
                {activeMediaItems.length > 1 && (
                  <div className="slider-dots-container">
                    {activeMediaItems.map((_, index) => (
                      <button
                        key={index}
                        data-slider-dot={index}
                        onClick={() => changeMediaSlide(index)}
                        aria-current={index === currentMediaIndex ? 'true' : 'false'}
                        className="slider-dot"
                      />
                    ))}
                  </div>
                )}

                {/* メディア数インジケーター */}
                {activeMediaItems.length > 1 && (
                  <div className="slider-counter">
                    {currentMediaIndex + 1} / {activeMediaItems.length}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className='addInfo base2-pattern-1'>
        {/* 説明文（アコーディオン対応） */}
        <div className='inner'>
          <p
            className="description">
            {description || '世界で最も危険な犯罪者たちのリストを持つ元政府エージェント、レイモンド・レディントンが、FBIと協力して凶悪犯を追い詰める。'}
          </p>

          {/* 展開可能な詳細説明 */}
          {expandedDescription && (
            <div>
              <p className={`description description_add ${isExpanded ? 'show is-expanded' : ''}`} data-expanded-content={`${component.id}-expanded`} aria-hidden={!isExpanded}>
                {expandedDescription}
              </p>
              <button
                id='showDesc'
                data-toggle-expanded={`${component.id}-expanded`}
                data-show-more-text={showMoreText}
                data-show-less-text={showLessText}
                onClick={() => setIsExpanded(!isExpanded)}
                className={`borderBottom ${isExpanded ? 'active' : ''}`}
                aria-expanded={isExpanded}
              >
                {isExpanded ? showLessText : showMoreText}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
export default KVComponent;