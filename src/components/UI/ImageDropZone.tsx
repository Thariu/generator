import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { uploadImage, ImageUploadResult } from '../../utils/imageHandler';

interface ImageDropZoneProps {
  onImageUpload: (result: ImageUploadResult) => void;
  /** 指定時は localStorage ではなくこの関数でアップロード */
  customUpload?: (file: File) => Promise<ImageUploadResult>;
  currentImageUrl?: string;
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
  disabled?: boolean;
}

const ImageDropZone: React.FC<ImageDropZoneProps> = ({
  onImageUpload,
  customUpload,
  currentImageUrl,
  className = '',
  placeholder = '画像をドラッグ&ドロップまたはクリックして選択',
  showPreview = true,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('画像ファイルをドロップしてください。');
      return;
    }
    
    // 最初の画像ファイルのみを処理
    await handleFileUpload(imageFiles[0]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (disabled) return;
    setIsUploading(true);
    setError(null);
    
    try {
      const result = customUpload ? await customUpload(file) : await uploadImage(file);
      onImageUpload(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : '画像のアップロードに失敗しました。');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageUpload({
      url: '',
      filename: '',
      originalName: '',
      size: 0,
      type: ''
    });
    setError(null);
  };

  const containerStyle: React.CSSProperties = {
    border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.65 : 1,
    transition: 'all 0.2s ease-in-out',
    backgroundColor: isDragging && !disabled ? '#f0f9ff' : '#fafafa',
    position: 'relative',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const previewStyle: React.CSSProperties = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '6px',
    marginBottom: '8px',
  };

  const uploadingOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
  };

  const errorStyle: React.CSSProperties = {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const removeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
  };

  return (
    <div className={className}>
      <div
        style={containerStyle}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* 現在の画像プレビュー */}
        {currentImageUrl && showPreview && (
          <>
            <img
              src={currentImageUrl}
              alt="プレビュー"
              style={previewStyle}
            />
            <button
              onClick={handleRemoveImage}
              style={removeButtonStyle}
              title="画像を削除"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              }}
            >
              <X size={12} />
            </button>
          </>
        )}

        {/* アップロード領域 */}
        {!currentImageUrl && (
          <>
            <div style={{ marginBottom: '8px' }}>
              {isDragging ? (
                <Upload size={32} color="#3b82f6" />
              ) : (
                <ImageIcon size={32} color="#9ca3af" />
              )}
            </div>
            <p style={{ 
              fontSize: '14px', 
              color: isDragging ? '#3b82f6' : '#6b7280',
              marginBottom: '4px',
              fontWeight: isDragging ? 500 : 400
            }}>
              {placeholder}
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              JPEG、PNG、GIF、WebP（最大10MB）
            </p>
          </>
        )}

        {/* アップロード中のオーバーレイ */}
        {isUploading && (
          <div style={uploadingOverlayStyle}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 8px'
              }} />
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                アップロード中...
              </p>
            </div>
          </div>
        )}

        {/* 隠しファイル入力 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div style={errorStyle}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* スピンアニメーション */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ImageDropZone;