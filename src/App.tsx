import React, { useEffect, useState } from 'react';
import { usePageStore } from './store/usePageStore';
import { useAuthStore } from './store/useAuthStore';
import ComponentLibrary from './components/PageBuilder/ComponentLibrary';
import Canvas from './components/PageBuilder/Canvas';
import PropertiesPanel from './components/PageBuilder/PropertiesPanel';
import Toolbar from './components/PageBuilder/Toolbar';
import AuthScreen from './components/Auth/AuthScreen';

function App() {
  const { previewMode, showComponentLibrary, showPropertiesPanel, syncProjectsFromServer } = usePageStore();
  const { checkSession, isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // アプリ起動時にセッションをチェック
  useEffect(() => {
    // セッションをチェックして状態を更新
    checkSession();
    // 少し遅延を入れて、persistミドルウェアが状態を読み込む時間を確保
    setTimeout(() => {
      setIsChecking(false);
    }, 100);
  }, [checkSession]);

  // アプリ起動時にプロジェクトをサーバーから同期（認証済みの場合のみ）
  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      syncProjectsFromServer();
    }
  }, [syncProjectsFromServer, isAuthenticated, isChecking]);

  // 認証チェック中は何も表示しない（またはローディング表示）
  if (isChecking) {
    return null;
  }

  // 未認証の場合は認証画面を表示
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const appStyle: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f3f4f6',
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  };

  if (previewMode) {
    return (
      <div style={appStyle}>
        <Toolbar />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Canvas />
        </div>
      </div>
    );
  }

  return (
    <div style={appStyle}>
      <Toolbar />
      <div style={mainStyle}>
        {showComponentLibrary && <ComponentLibrary />}
        <Canvas />
        {showPropertiesPanel && <PropertiesPanel />}
      </div>
    </div>
  );
}

export default App;