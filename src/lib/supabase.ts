import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// URLの有効性を検証する関数
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

// Supabase環境変数が設定されていて、かつ有効なURLの場合のみクライアントを作成
export const supabase: SupabaseClient | null = 
  (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl))
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
