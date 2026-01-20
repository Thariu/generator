// 共通画像のパス管理
export const COMMON_IMAGE_BASE_PATH = '/program/st/promo/generator_common/img/';

// 共通画像のファイル名の型定義（後方互換性のため）
export type CommonImageKey = string;

// 共通画像のフルパスを取得する関数
export const getCommonImagePath = (filename: string): string => {
  return `${COMMON_IMAGE_BASE_PATH}${filename}`;
};

// 共通画像の存在チェック
export const isCommonImage = (imagePath: string): boolean => {
  return imagePath.startsWith(COMMON_IMAGE_BASE_PATH);
};

// 共通画像の一覧を取得（APIから動的に取得）
export interface CommonImageInfo {
  name: string;
  path: string;
  key: string;
}

let cachedImages: CommonImageInfo[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

export const getCommonImagesList = async (): Promise<CommonImageInfo[]> => {
  // キャッシュが有効な場合はキャッシュを返す
  const now = Date.now();
  if (cachedImages && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedImages;
  }

  try {
    const response = await fetch('/api/common-images');
    if (!response.ok) {
      throw new Error(`Failed to fetch common images: ${response.statusText}`);
    }

    const data = await response.json();
    const images: CommonImageInfo[] = (data.images || []).map((filename: string) => ({
      name: filename,
      path: getCommonImagePath(filename),
      key: filename, // ファイル名をキーとして使用
    }));

    // キャッシュを更新
    cachedImages = images;
    cacheTimestamp = now;

    return images;
  } catch (error) {
    console.error('Error fetching common images:', error);
    // エラー時は空配列を返す（またはキャッシュがあればキャッシュを返す）
    return cachedImages || [];
  }
};

// 同期版（後方互換性のため、空配列を返す）
// 非同期版を使用することを推奨
export const getCommonImagesListSync = (): CommonImageInfo[] => {
  return cachedImages || [];
};