import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Check } from 'lucide-react';
import { getCommonImagesList, getCommonImagePath } from '../../utils/commonImages';

interface CommonImageSelectorProps {
  onImageSelect: (imagePath: string) => void;
  currentImagePath?: string;
  className?: string;
}

const CommonImageSelector: React.FC<CommonImageSelectorProps> = ({
  onImageSelect,
  currentImagePath,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commonImages, setCommonImages] = useState<Array<{name: string, path: string, key: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 共通画像一覧を取得
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      try {
        const images = await getCommonImagesList();
        setCommonImages(images);
      } catch (error) {
        console.error('Failed to load common images:', error);
        setCommonImages([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadImages();
  }, []);

  const handleImageSelect = (imagePath: string) => {
    onImageSelect(imagePath);
    setIsOpen(false);
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    transition: 'border-color 0.15s ease-in-out',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxHeight: '200px',
    overflowY: 'auto',
    marginTop: '4px',
  };

  const imageItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#374151',
    transition: 'background-color 0.15s ease-in-out',
  };

  const imagePreviewStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
  };

  const getCurrentImageName = () => {
    if (!currentImagePath) return '画像を選択';
    
    // パスからファイル名を抽出
    const filename = currentImagePath.split('/').pop() || '画像を選択';
    return filename;
  };

  return (
    <div style={containerStyle} className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
      >
        <ImageIcon size={16} />
        <span>{getCurrentImageName()}</span>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          {isLoading ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
              読み込み中...
            </div>
          ) : commonImages.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
              共通画像が見つかりません
            </div>
          ) : (
            commonImages.map((image) => (
            <div
              key={image.key}
              onClick={() => handleImageSelect(image.path)}
              style={imageItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={image.path}
                  alt={image.name}
                  style={imagePreviewStyle}
                  onError={(e) => {
                    // 画像が読み込めない場合はプレースホルダーを表示
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span>{image.name}</span>
              </div>
              {currentImagePath === image.path && (
                <Check size={14} color="#2563eb" />
              )}
            </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommonImageSelector;