import React, { useState } from 'react';
// アイコンライブラリ インポート
import {
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  Undo,
  Redo,
  Download,
  RefreshCw,
  Settings,
  Globe,
  PanelLeft,
  PanelRight,
  PanelLeftClose,
  PanelRightClose,
  FolderOpen
} from 'lucide-react';
import { usePageStore } from '../../store/usePageStore';
import { prepareImagesForExport } from '../../utils/imageHandler';
import { generateGlobalStylesCSS } from '../../utils/globalStylesHelper';
import { generateComponentHTML, getRequiredCSSFiles, generateCSSLinks, getCategoryFromComponentType } from '../../utils/htmlGenerator';
import { generateCSSTemplate, generateSectionId, saveCSSMetadata, isCSSGenerated, collectCustomCSSByCategory, appendCustomCSSToFile } from '../../utils/cssTemplateGenerator';
import { wrapComponentHTML } from '../../utils/componentHtmlWrapper';
import { componentTemplates } from '../../data/componentTemplates';
import GlobalSettingsPanel from './GlobalSettingsPanel';
import ProjectManager from './ProjectManager';

const Toolbar: React.FC = () => {
  const {
    viewMode,
    previewMode,
    setViewMode,
    setPreviewMode,
    undo,
    redo,
    canUndo,
    canRedo,
    pageData,
    resetPage,
    showComponentLibrary,
    showPropertiesPanel,
    toggleComponentLibrary,
    togglePropertiesPanel,
    getCurrentProjectName
  } = usePageStore();

  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);

  const exportHTML = () => {
    // 新しいカテゴリのCSSテンプレートを生成
    generateAndDownloadMissingCSS();

    // Generate actual HTML for all components with unique ID wrappers
    const componentsHTML = pageData.components.map(component => {
      const html = generateComponentHTML(component, pageData.globalStyles);
      return wrapComponentHTML(html, component);
    }).join('\n\n');

    const { globalSettings } = pageData;

    // 画像ファイルの準備
    const exportImages = prepareImagesForExport();

    // 共通スタイルのCSS生成
    const globalStylesCSS = generateGlobalStylesCSS(pageData.globalStyles);

    // 必要なCSSファイルのリストを取得
    const requiredCSSFiles = getRequiredCSSFiles(pageData.components);
    const cssLinks = generateCSSLinks(requiredCSSFiles);

    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width">
    <meta name="format-detection" content="telephone=no">
    <meta name="viewport" content="width=device-width">
    <title>${globalSettings.title}</title>

    <!-- Google Tag Manager 2021/03-->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-K73Z39');</script>
    <!-- End Google Tag Manager 2021/03 -->

    <!-- User Insight PCDF Code Start : skyperfectv.co.jp -->
    <script type="text/javascript">
    var _uic = _uic ||{}; var _uih = _uih ||{};_uih['id'] = 50825;
    _uih['lg_id'] = '';
    _uih['fb_id'] = '';
    _uih['tw_id'] = '';
    _uih['uigr_1'] = ''; _uih['uigr_2'] = ''; _uih['uigr_3'] = ''; _uih['uigr_4'] = ''; _uih['uigr_5'] = '';
    _uih['uigr_6'] = ''; _uih['uigr_7'] = ''; _uih['uigr_8'] = ''; _uih['uigr_9'] = ''; _uih['uigr_10'] = '';
    _uic['security_type'] = 1;

    /* DO NOT ALTER BELOW THIS LINE */
    (function() {
    var bi = document.createElement('script');bi.type = 'text/javascript'; bi.async = true;
    bi.src = '//cs.nakanohito.jp/b3/bi.js';
    var s = document.getElementsByTagName('script')[0];s.parentNode.insertBefore(bi, s);
    })();
    </script>
    <!-- User Insight PCDF Code End : skyperfectv.co.jp -->

    <meta name="description" content="${globalSettings.description}">
    ${globalSettings.keywords ? `<meta name="keywords" content="${globalSettings.keywords}">` : ''}
    
    <!-- OGP Tags -->
    <meta property="og:title" content="${globalSettings.title}">
    <meta property="og:description" content="${globalSettings.description}">
    <meta property="og:type" content="website">
    ${globalSettings.ogImage ? `<meta property="og:image" content="${globalSettings.ogImage}">` : ''}
    <meta property="og:site_name" content="スカパー！: スポーツ＆音楽ライブ、アイドル、アニメ、ドラマ、映画など">
    <meta property="og:locale" content="ja_JP">
    
    <!-- ICON -->
    <link rel="shortcut icon" href="/global/assets/images/fav/favicon.ico" type="image/vnd.microsoft.icon">
    <link rel="apple-touch-icon" href="/global/assets/images/fav/apple-touch-icon.png">
    <link rel="stylesheet" href="/static_r1/common_r1/css/wrd_main.css" type="text/css" media="screen,print">
    <link rel="stylesheet" href="/static_r1/common_r1/css/import.css" type="text/css" media="(min-width:769px)">
    <link rel="stylesheet" href="/static_r1/common_r1/s/css/import.css" type="text/css" media="(max-width:768px)">
    <link href="/global/assets/css/global.css" rel="stylesheet">

    <!-- コンポーネント用CSS -->
${cssLinks}

    <!-- 共通スタイル -->
    <style>
      ${globalStylesCSS}
    </style>
</head>
<body class="fw">
  <!-- Google Tag Manager (noscript) 2021/3 -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K73Z39"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) 2021/3 -->

  <!-- .l-header include -->
  <div id="header">
  </div>
  <!-- /.l-header include -->

  <div class="l-container" id="j-container">
    <!-- .l-side include -->
    <div id="side">
    </div>
    <!-- /.l-side include -->

    <div class="l-container__main" id="j-container-main">
      <main>
        <div id="mainContents" class="mainContents baseColor">

          <!-- Main Content -->
          ${componentsHTML}

        </div>
      </main>
    </div>
  </div>

  <!-- Footer -->
  <footer id="footer">
      <!-- パンくず -->
      <div class="c-breadcrumb">
          <div class="c-breadcrumb__logo"><a href="/"><img src="/global/assets/images/logo/logo_white.svg" alt="スカパー！"></a>
          </div>
          <ul class="c-breadcrumb-list">
          <li><a href="/program/">番組を探す</a></li>
          <li><a href="/program/special">特集ページ</a></li>
          <li><span>シリーズ10年の歴史がついに完結！ジェームズ・スぺイダー主演「ブラックリスト ファイナル・シーズン」独占日本初放送！</span></li>
      </ul>
      </div>
      <!-- /パンくず -->
      <!-- .l-footer include -->
      <!-- /.l-footer include -->
  </footer>

  <script src="/global/assets/js/global.js"></script>
  <script src="/global/assets/js/jquery.min.js"></script>
  <script src="/program/st/promo/generator_common/js/common.js"></script>
</body>
</html>`;

    const { directory } = globalSettings;
    
    if (directory) {
      // ディレクトリが指定されている場合、画像ファイルも含めてZIPファイルを作成
      createZipWithDirectoryAndImages(htmlContent, directory, exportImages);
    } else {
      // ディレクトリが指定されていない場合、単純にindex.htmlをダウンロード
      downloadFile(htmlContent, 'index.html', 'text/html');
      
      // 画像がある場合は警告を表示
      if (Object.keys(exportImages).length > 0) {
        setTimeout(() => {
          alert(`注意: ${Object.keys(exportImages).length}個の画像ファイルが使用されていますが、ディレクトリが設定されていないため画像ファイルは出力されませんでした。\n\nページ設定でディレクトリを設定すると、画像ファイルも一緒に出力されます。`);
        }, 500);
      }
    }

    // エクスポート後に状態を復元（プレビューエリアをリセットしない）
    // 状態は変更されないため、特に復元処理は不要
    // ただし、念のため現在の状態を確認して必要に応じて復元
    setTimeout(() => {
      // 状態が変更されている場合のみ復元
      if (previewMode !== currentPreviewMode) {
        setPreviewMode(currentPreviewMode);
      }
      if (viewMode !== currentViewMode) {
        setViewMode(currentViewMode);
      }
      if (showComponentLibrary !== currentShowComponentLibrary) {
        toggleComponentLibrary();
      }
      if (showPropertiesPanel !== currentShowPropertiesPanel) {
        togglePropertiesPanel();
      }
    }, 100);
  };

  // ZIPファイルを作成してディレクトリ構造と画像を含める関数
  const createZipWithDirectoryAndImages = (htmlContent: string, directoryName: string, images: { [filename: string]: string }) => {
    // HTMLファイルは常にindex.html
    downloadFile(htmlContent, 'index.html', 'text/html');
    
    // 画像ファイルがある場合は個別にダウンロード
    if (Object.keys(images).length > 0) {
      // 少し遅延してから画像ファイルをダウンロード
      setTimeout(() => {
        Object.entries(images).forEach(([filename, base64Data], index) => {
          setTimeout(() => {
            // Base64データをBlobに変換
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            
            // ファイルをダウンロード
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, index * 200); // 200ms間隔でダウンロード
        });
      }, 500);
    }
    
    // ディレクトリ構造の説明を表示
    const instructions = `
HTMLファイルと${Object.keys(images).length}個の画像ファイルが出力されました。

【ディレクトリ構造の設定方法】
以下のフォルダ構造を作成してください：

${directoryName}/
  ├── index.html (ダウンロードしたHTMLファイル)
  └── img/ (画像ファイル用フォルダ)
      ${Object.keys(images).map(filename => `├── ${filename}`).join('\n        ')}

【設定手順】
1. プロジェクトのルートディレクトリに「assets」フォルダを作成
2. 「${directoryName}」フォルダを作成
3. ダウンロードした「index.html」ファイルを「${directoryName}」フォルダ内に配置
4. 「${directoryName}/img」フォルダを作成
5. ダウンロードした画像ファイルを「${directoryName}/img」フォルダ内に配置

この構造により、HTMLファイルから「../assets/」の相対パスでCSSとJavaScriptファイルに、「./img/」の相対パスで画像ファイルにアクセスできます。

【共通スタイル機能】
HTMLファイルには、ページ設定で設定した共通スタイル（mainColor、baseColor、base2Color、accentColor）が自動的に適用されます。
    `.trim();
    
    // 遅延してアラートを表示（ダウンロードが完了してから）
    setTimeout(() => {
      alert(instructions);
    }, 1000 + Object.keys(images).length * 200);
  };

  // ファイルをダウンロードする関数
  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 新しいカテゴリのCSSテンプレートを生成してダウンロード
  const generateAndDownloadMissingCSS = () => {
    const allCategories = new Set<string>();
    const predefinedCategories = new Set(['KV', '料金', '番組配信', 'FAQ', 'footer']);

    // 全てのカテゴリを収集
    pageData.components.forEach(component => {
      const category = getCategoryFromComponentType(component.type);
      if (category) {
        allCategories.add(category);
      }
    });

    // カスタムCSSをカテゴリごとに収集
    const customCSSByCategory = collectCustomCSSByCategory(pageData.components);

    // 新しいカテゴリをチェック
    const newCategories = Array.from(allCategories).filter(
      cat => !predefinedCategories.has(cat) && !isCSSGenerated(cat)
    );

    // カスタムCSSがあるカテゴリも含めて処理
    const categoriesToProcess = new Set([...newCategories, ...Array.from(allCategories)]);

    if (categoriesToProcess.size === 0 && customCSSByCategory.size === 0) {
      return; // 処理するカテゴリがない場合は何もしない
    }

    const processedCategories: string[] = [];

    // 各カテゴリのCSSファイルを生成
    categoriesToProcess.forEach(category => {
      const fileName = category
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '') + '.css';

      const sectionId = generateSectionId(category);
      
      // ベースCSSを生成（新しいカテゴリの場合のみ）
      let cssContent = '';
      if (newCategories.includes(category)) {
        cssContent = generateCSSTemplate(category, fileName);
      } else {
        // 既存のカテゴリの場合は、カスタムCSSのみを含むファイルを生成
        cssContent = `/* ${category}コンポーネント用CSS */\n\n`;
      }

      // カスタムCSSを追加
      const customCSS = customCSSByCategory.get(category);
      if (customCSS) {
        cssContent = appendCustomCSSToFile(cssContent, customCSS);
      }

      // カスタムCSSがある場合、または新しいカテゴリの場合はダウンロード
      if (customCSS || newCategories.includes(category)) {
        // CSSファイルをダウンロード
        downloadFile(cssContent, fileName, 'text/css');
        processedCategories.push(category);

        // メタデータを保存（新しいカテゴリの場合のみ）
        if (newCategories.includes(category)) {
          saveCSSMetadata({
            category,
            fileName,
            sectionId,
            generated: true
          });
        }
      }
    });

    // アラートで通知
    if (processedCategories.length > 0) {
      const newCategoryList = newCategories.map(cat => 
        `- ${cat} (${cat.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')}.css)`
      ).join('\n');
      
      const customCSSList = Array.from(customCSSByCategory.keys())
        .filter(cat => !newCategories.includes(cat))
        .map(cat => `- ${cat} (カスタムCSS追加済み)`)
        .join('\n');

      let message = 'CSSファイルを生成しました:\n\n';
      if (newCategoryList) {
        message += `【新しいカテゴリ】\n${newCategoryList}\n\n`;
      }
      if (customCSSList) {
        message += `【カスタムCSS追加】\n${customCSSList}\n\n`;
      }
      message += 'ダウンロードしたCSSファイルを /public/program/st/promo/generator_common/css/ に配置してください。\n\n';
      message += '※ 既存のCSSファイルがある場合は、カスタムCSS部分を手動で追加してください。';

      alert(message);
    }
  };

  const getViewModeIcon = (mode: string) => {
    switch (mode) {
      case 'tablet':
        return <Tablet size={16} />;
      case 'mobile':
        return <Smartphone size={16} />;
      default:
        return <Monitor size={16} />;
    }
  };

  const toolbarStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const logoSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const logoIconStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const logoTextStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
  };

  const projectNameStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    fontStyle: 'italic',
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '24px',
    backgroundColor: '#d1d5db',
  };

  const undoRedoSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const iconButtonStyle: React.CSSProperties = {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease-in-out',
  };

  const getIconButtonStyle = (enabled: boolean): React.CSSProperties => ({
    ...iconButtonStyle,
    color: enabled ? '#374151' : '#d1d5db',
    cursor: enabled ? 'pointer' : 'not-allowed',
  });

  const getPanelButtonStyle = (isActive: boolean): React.CSSProperties => ({
    ...iconButtonStyle,
    backgroundColor: isActive ? '#dbeafe' : 'transparent',
    color: isActive ? '#2563eb' : '#6b7280',
  });

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const viewModeSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '4px',
  };

  const viewModeButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    gap: '8px',
  };

  const getViewModeButtonStyle = (isActive: boolean): React.CSSProperties => ({
    ...viewModeButtonStyle,
    backgroundColor: isActive ? '#ffffff' : 'transparent',
    color: isActive ? '#111827' : '#4b5563',
    boxShadow: isActive ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
  });

  const actionButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease-in-out',
    gap: '8px',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: '#2563eb',
    color: '#ffffff',
  };

  const successButtonStyle: React.CSSProperties = {
    ...actionButtonStyle,
    backgroundColor: '#059669',
    color: '#ffffff',
  };

  const getPreviewButtonStyle = (): React.CSSProperties => ({
    ...actionButtonStyle,
    backgroundColor: previewMode ? '#2563eb' : '#f3f4f6',
    color: previewMode ? '#ffffff' : '#374151',
  });

  return (
    <>
      <div style={toolbarStyle}>
        <div style={leftSectionStyle}>
          <div style={logoSectionStyle}>
            <div style={logoIconStyle}>
              <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>LP</span>
            </div>
            <div>
              <h1 style={logoTextStyle}>ジェネレータ</h1>
              {getCurrentProjectName() && (
                <div style={projectNameStyle}>
                  {getCurrentProjectName()}
                </div>
              )}
            </div>
          </div>
          
          <div style={dividerStyle}></div>
          
          {/* パネル表示切り替えボタン */}
          <div style={undoRedoSectionStyle}>
            <button
              onClick={toggleComponentLibrary}
              style={getPanelButtonStyle(showComponentLibrary)}
              title={showComponentLibrary ? 'コンポーネントライブラリを非表示' : 'コンポーネントライブラリを表示'}
              onMouseEnter={(e) => {
                if (!showComponentLibrary) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!showComponentLibrary) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {showComponentLibrary ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
            </button>
            <button
              onClick={togglePropertiesPanel}
              style={getPanelButtonStyle(showPropertiesPanel)}
              title={showPropertiesPanel ? 'プロパティパネルを非表示' : 'プロパティパネルを表示'}
              onMouseEnter={(e) => {
                if (!showPropertiesPanel) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!showPropertiesPanel) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {showPropertiesPanel ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
            </button>
          </div>
          
          <div style={dividerStyle}></div>
          
          <div style={undoRedoSectionStyle}>
            <button
              onClick={undo}
              disabled={!canUndo()}
              style={getIconButtonStyle(canUndo())}
              title="元に戻す"
              onMouseEnter={(e) => {
                if (canUndo()) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Undo size={16} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              style={getIconButtonStyle(canRedo())}
              title="やり直し"
              onMouseEnter={(e) => {
                if (canRedo()) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Redo size={16} />
            </button>
          </div>
        </div>

        <div style={rightSectionStyle}>
          <div style={viewModeSectionStyle}>
            {['desktop', 'tablet', 'mobile'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                style={getViewModeButtonStyle(viewMode === mode)}
                title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} view`}
              >
                {getViewModeIcon(mode)}
                <span style={{ display: window.innerWidth >= 640 ? 'inline' : 'none' }}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </span>
              </button>
            ))}
          </div>

          <div style={dividerStyle}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowProjectManager(true)}
              style={secondaryButtonStyle}
              title="プロジェクト管理"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              <FolderOpen size={16} />
              プロジェクト
            </button>

            <button
              onClick={() => setShowGlobalSettings(true)}
              style={secondaryButtonStyle}
              title="ページ設定・共通スタイル"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              <Globe size={16} />
              ページ設定
            </button>

            <button
              onClick={() => setPreviewMode(!previewMode)}
              style={getPreviewButtonStyle()}
              onMouseEnter={(e) => {
                if (previewMode) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                } else {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (previewMode) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                } else {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
              {previewMode ? 'プレビュー終了' : 'プレビュー'}
            </button>

            <button
              onClick={resetPage}
              style={secondaryButtonStyle}
              title="ページをリセット"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              <RefreshCw size={16} />
              リセット
            </button>

            <button
              onClick={exportHTML}
              style={successButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#047857';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
            >
              <Download size={16} />
              HTML出力
            </button>
          </div>
        </div>
      </div>

      <GlobalSettingsPanel
        isOpen={showGlobalSettings}
        onClose={() => setShowGlobalSettings(false)}
      />

      <ProjectManager
        isOpen={showProjectManager}
        onClose={() => setShowProjectManager(false)}
      />
    </>
  );
};

export default Toolbar;