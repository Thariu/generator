import { fileToBase64, validateImageFile, type ImageUploadResult } from './imageHandler';
import { getCommonImagePath } from './commonImages';

const UPLOAD_API = '/api/upload-thumbnail';

const extFromMime = (mime: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
  };
  return map[mime] || '.jpg';
};

export const sanitizeThumbnailUniqueId = (uniqueId: string): string =>
  uniqueId
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'template';

/**
 * テンプレートサムネイルを public 配下に保存し、公開 URL を返す（開発サーバー API）
 */
export const uploadTemplateThumbnail = async (
  file: File,
  uniqueId: string
): Promise<ImageUploadResult> => {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const slug = sanitizeThumbnailUniqueId(uniqueId);
  if (!slug) {
    throw new Error('unique_id が未確定です。コンポーネント名とカテゴリを入力してください。');
  }

  const dataUrl = await fileToBase64(file);
  const ext = extFromMime(file.type);
  const filename = `thumbnail_${slug}${ext}`;

  const response = await fetch(UPLOAD_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uniqueId: slug, dataUrl, mimeType: file.type }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    path?: string;
    filename?: string;
    error?: string;
    message?: string;
  };

  if (!response.ok || !payload.success || !payload.path) {
    throw new Error(
      payload.message || payload.error || 'サムネイルの保存に失敗しました。開発サーバーで実行しているか確認してください。'
    );
  }

  return {
    url: payload.path,
    filename: payload.filename || filename,
    originalName: file.name,
    size: file.size,
    type: file.type,
  };
};

export const isDataUrlThumbnail = (url: string): boolean => url.startsWith('data:');

export const resolveThumbnailPreviewUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) return url;
  return getCommonImagePath(url.replace(/^\//, ''));
};
