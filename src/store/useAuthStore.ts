import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  sessionExpiry: number | null;
  passwordHash: string | null; // パスワード変更検知用のハッシュ値
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  checkSession: () => boolean;
}

// 環境変数からIDとパスワードを取得（デフォルト値は開発用）
const AUTH_USER_ID = import.meta.env.VITE_AUTH_USER_ID || 'admin';
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD || 'admin2130';
// セッション有効期限（24時間 = 86400000ミリ秒）
const SESSION_DURATION = 24 * 60 * 60 * 1000;

// パスワードのハッシュ値を生成（簡易版）
const generatePasswordHash = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

// 現在のパスワードのハッシュ値を取得
const getCurrentPasswordHash = (): string => {
  return generatePasswordHash(AUTH_PASSWORD);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      sessionExpiry: null,
      passwordHash: null,

      login: (userId: string, password: string): boolean => {
        // IDとパスワードの両方をチェック
        if (userId === AUTH_USER_ID && password === AUTH_PASSWORD) {
          const expiry = Date.now() + SESSION_DURATION;
          const currentHash = getCurrentPasswordHash();
          set({
            isAuthenticated: true,
            sessionExpiry: expiry,
            passwordHash: currentHash, // 現在のパスワードのハッシュ値を保存
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          sessionExpiry: null,
          passwordHash: null,
        });
      },

      checkSession: (): boolean => {
        const { sessionExpiry, isAuthenticated, passwordHash } = get();
        
        // 認証されていない場合はfalse
        if (!isAuthenticated || !sessionExpiry) {
          return false;
        }

        // パスワードが変更されているかチェック
        const currentHash = getCurrentPasswordHash();
        if (passwordHash !== currentHash) {
          // パスワードが変更されている場合はセッションを無効化
          set({
            isAuthenticated: false,
            sessionExpiry: null,
            passwordHash: null,
          });
          return false;
        }

        // セッションが有効期限内かチェック
        if (Date.now() < sessionExpiry) {
          return true;
        }

        // セッションが期限切れの場合はログアウト
        set({
          isAuthenticated: false,
          sessionExpiry: null,
          passwordHash: null,
        });
        return false;
      },
    }),
    {
      name: 'auth-storage', // localStorageのキー名
    }
  )
);
