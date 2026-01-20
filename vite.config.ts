import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // カスタムAPIエンドポイントを追加
    {
      name: 'component-file-api',
      configureServer(server) {
        server.middlewares.use('/api/create-component', async (req, res, next) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          try {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                const data = JSON.parse(body);
                const {
                  componentName,
                  displayName,
                  category,
                  categoryRomanized,
                  generatedCode,
                  uniqueId,
                  sectionId,
                  cssContent,
                  cssFileName,
                  isExistingCategory,
                  isNewCategory,
                  defaultProps,
                  propSchema,
                  cssFiles,
                  jsFiles,
                  description,
                  thumbnailUrl,
                } = data;

                // プロジェクトのベースパス（現在のディレクトリ）
                const projectBasePath = process.cwd();
                const componentsDirPath = join(projectBasePath, 'src/components/Components');
                
                // uniqueIdを使用してファイル名を生成（例: test2_btn -> Test2BtnComponent.tsx）
                // これにより、カテゴリとコンポーネント名の組み合わせで一意のファイル名になる
                const componentFileName = uniqueId
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join('') + 'Component.tsx';
                const componentFilePath = join(componentsDirPath, componentFileName);

                // 1. Componentsディレクトリが存在しない場合は作成
                if (!existsSync(componentsDirPath)) {
                  mkdirSync(componentsDirPath, { recursive: true });
                  console.log(`Created directory: ${componentsDirPath}`);
                }

                // 2. ファイルの重複チェック
                if (existsSync(componentFilePath)) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 409; // Conflict
                  res.end(JSON.stringify({
                    success: false,
                    error: 'FILE_EXISTS',
                    message: `ファイル「${componentFileName}」は既に存在します。`,
                    fileName: componentFileName,
                    filePath: componentFilePath,
                  }));
                  return;
                }

                // 3. コンポーネントファイルを作成
                // 生成されたコード内のコンポーネント名とエクスポート名を修正
                let processedGeneratedCode = generatedCode;
                
                // コンポーネント名を取得（componentFileNameから.tsxを削除）
                const actualComponentName = componentFileName.replace('.tsx', '');
                
                // 生成されたコード内で、コンポーネント名が正しく設定されているか確認
                // もし 'const btn' や 'export default btn' のようなパターンがあれば修正
                // パターン1: const btn: React.FC<btnProps> を const ${actualComponentName}: React.FC<${actualComponentName}Props> に修正
                const btnPattern = /const\s+btn\s*:\s*React\.FC<btnProps>/g;
                if (btnPattern.test(processedGeneratedCode)) {
                  processedGeneratedCode = processedGeneratedCode.replace(
                    /const\s+btn\s*:\s*React\.FC<btnProps>/g,
                    `const ${actualComponentName}: React.FC<${actualComponentName}Props>`
                  );
                  processedGeneratedCode = processedGeneratedCode.replace(
                    /interface\s+btnProps/g,
                    `interface ${actualComponentName}Props`
                  );
                  processedGeneratedCode = processedGeneratedCode.replace(
                    /export\s+default\s+btn\s*;/g,
                    `export default ${actualComponentName};`
                  );
                }
                
                writeFileSync(componentFilePath, processedGeneratedCode, 'utf-8');
                console.log(`Component file created: ${componentFilePath}`);

                // 3. componentTemplates.tsを更新
                const templatesFilePath = join(projectBasePath, 'src/data/componentTemplates.ts');
                let templatesContent = readFileSync(templatesFilePath, 'utf-8');

                // 文字列のエスケープ処理
                const escapeString = (str: string): string => {
                  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
                };

                const safeDescription = escapeString(description || `${displayName}コンポーネント`);
                const safeThumbnail = escapeString(thumbnailUrl || 'https://placehold.jp/400x267.png');
                const safeDisplayName = escapeString(displayName);
                const safeComponentName = escapeString(componentName);

                // JSONオブジェクトを文字列化（インデント付き）
                const formatJSON = (obj: any): string => {
                  return JSON.stringify(obj, null, 4).replace(/\n/g, '\n    ');
                };

                // CSSファイルが作成された場合、cssFiles配列に追加
                let finalCssFiles = cssFiles || [];
                if (cssFileName && !finalCssFiles.includes(cssFileName)) {
                  finalCssFiles = [...finalCssFiles, cssFileName];
                }

                const defaultPropsStr = formatJSON(defaultProps || {});
                const propSchemaStr = formatJSON(propSchema || []);
                const cssFilesStr = formatJSON(finalCssFiles);
                const jsFilesStr = formatJSON(jsFiles || []);

                const newEntry = `  // ${displayName}
  {
    id: '${uniqueId}',
    type: '${categoryRomanized}',
    name: '${safeDisplayName}',
    nameRomanized: '${safeComponentName}',
    description: '${safeDescription}',
    thumbnail: '${safeThumbnail}',
    category: '${category}',
    categoryRomanized: '${categoryRomanized}',
    uniqueId: '${uniqueId}',
    sectionId: '${sectionId}',
    defaultProps: ${defaultPropsStr},
    propSchema: ${propSchemaStr},
    cssFiles: ${cssFilesStr},
    jsFiles: ${jsFilesStr},
  },
`;

                // ];の前に新しいエントリを挿入
                templatesContent = templatesContent.replace(/\n\];$/, `\n${newEntry}];`);
                writeFileSync(templatesFilePath, templatesContent, 'utf-8');
                console.log(`Updated componentTemplates.ts`);

                // 4. componentRegistry.tsへの自動追加（一元管理）
                const registryFilePath = join(projectBasePath, 'src/utils/componentRegistry.ts');
                let registryContent = readFileSync(registryFilePath, 'utf-8');
                
                // コンポーネント名を生成（uniqueIdから）
                const componentNameForRegistry = componentFileName.replace('.tsx', '');
                
                // COMPONENT_TYPE_MAPに既に存在するかチェック
                const typeExistsInRegistry = registryContent.includes(`'${categoryRomanized}':`);
                if (!typeExistsInRegistry) {
                  // COMPONENT_TYPE_MAPに新しいエントリを追加
                  // 最後の 'tel': 'tel', の前に追加
                  const telPattern = /(\s+'tel': 'tel',\s*)/;
                  if (telPattern.test(registryContent)) {
                    registryContent = registryContent.replace(
                      telPattern,
                      `  '${categoryRomanized}': '${componentNameForRegistry}',\n$1`
                    );
                    writeFileSync(registryFilePath, registryContent, 'utf-8');
                    console.log(`Added '${categoryRomanized}': '${componentNameForRegistry}' to componentRegistry.ts`);
                  } else {
                    // パターンが見つからない場合、最後のエントリの前に追加を試みる
                    const lastEntryPattern = /(\s+'tel': 'tel',)/;
                    if (lastEntryPattern.test(registryContent)) {
                      registryContent = registryContent.replace(
                        lastEntryPattern,
                        `  '${categoryRomanized}': '${componentNameForRegistry}',\n$1`
                      );
                      writeFileSync(registryFilePath, registryContent, 'utf-8');
                      console.log(`Added '${categoryRomanized}': '${componentNameForRegistry}' to componentRegistry.ts (fallback)`);
                    }
                  }
                } else {
                  console.log(`Component type '${categoryRomanized}' already exists in componentRegistry.ts`);
                }

                // 6. CSSファイルの処理
                let cssFilePath: string | null = null;
                if (cssContent && cssFileName) {
                  const cssDirPath = join(projectBasePath, 'public/program/st/promo/generator_common/css');
                  cssFilePath = join(cssDirPath, cssFileName);

                  // CSSディレクトリが存在しない場合は作成
                  if (!existsSync(cssDirPath)) {
                    mkdirSync(cssDirPath, { recursive: true });
                    console.log(`Created CSS directory: ${cssDirPath}`);
                  }

                  if (isExistingCategory) {
                    // 既存カテゴリ：既存ファイルを読み込んで追加
                    try {
                      const existingContent = readFileSync(cssFilePath, 'utf-8');
                      const updatedContent = `${existingContent}\n\n${cssContent}`;
                      writeFileSync(cssFilePath, updatedContent, 'utf-8');
                      console.log(`Updated existing CSS file: ${cssFilePath}`);
                    } catch (error) {
                      // 既存ファイルが存在しない場合は新規作成
                      console.warn(`Existing CSS file not found, creating new: ${cssFilePath}`, error);
                      writeFileSync(cssFilePath, cssContent, 'utf-8');
                      console.log(`Created new CSS file: ${cssFilePath}`);
                    }
                  } else if (isNewCategory) {
                    // 新規カテゴリ：新規ファイルを作成
                    writeFileSync(cssFilePath, cssContent, 'utf-8');
                    console.log(`Created new CSS file: ${cssFilePath}`);
                  }
                }

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  message: `コンポーネント「${displayName}」が作成されました`,
                  filePath: componentFilePath,
                  fileName: componentFileName,
                  cssFilePath: cssFilePath || null,
                  cssFileName: cssFileName || null,
                }));
              } catch (error: any) {
                console.error('Error creating component:', error);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  error: error.message || 'コンポーネントの作成に失敗しました',
                }));
              }
            });
          } catch (error: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: error.message || 'リクエストの処理に失敗しました',
            }));
          }
        });
      },
    },
    // エディターファイル作成APIエンドポイント
    {
      name: 'editor-file-api',
      configureServer(server) {
        server.middlewares.use('/api/create-editor', async (req, res, next) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          try {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                const data = JSON.parse(body);
                const {
                  componentType,
                  fileName,
                  fileContent,
                } = data;

                // プロジェクトのベースパス（現在のディレクトリ）
                const projectBasePath = process.cwd();
                const editorsDirPath = join(projectBasePath, 'src/components/Editors/ComponentEditors');
                const editorFilePath = join(editorsDirPath, fileName);

                // 1. ComponentEditorsディレクトリが存在しない場合は作成
                if (!existsSync(editorsDirPath)) {
                  mkdirSync(editorsDirPath, { recursive: true });
                  console.log(`Created directory: ${editorsDirPath}`);
                }

                // 2. ファイルの重複チェック
                if (existsSync(editorFilePath)) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 409; // Conflict
                  res.end(JSON.stringify({
                    success: false,
                    error: 'FILE_EXISTS',
                    message: `エディターファイル「${fileName}」は既に存在します。`,
                    fileName: fileName,
                    filePath: editorFilePath,
                  }));
                  return;
                }

                // 3. エディターファイルを作成
                writeFileSync(editorFilePath, fileContent, 'utf-8');
                console.log(`Editor file created: ${editorFilePath}`);

                // 4. エディタレジストリ（index.ts）を更新
                const registryIndexPath = join(editorsDirPath, 'index.ts');
                let registryContent = '';
                
                if (existsSync(registryIndexPath)) {
                  registryContent = readFileSync(registryIndexPath, 'utf-8');
                } else {
                  // 新規作成
                  registryContent = `// コンポーネントエディタのレジストリ

import { ComponentType } from '../../../types';
import { BaseEditorProps } from './BaseEditor';
import React from 'react';

export type ComponentEditor = React.FC<BaseEditorProps>;

/**
 * コンポーネントタイプごとのエディタマッピング
 * 新しいコンポーネントエディタを追加する場合は、ここに登録する
 */
export const componentEditors: Partial<Record<ComponentType, ComponentEditor>> = {};

/**
 * コンポーネントタイプに対応するエディタを取得
 * コンポーネントビルダーで作成されたコンポーネントなど、未登録のタイプの場合はnullを返す
 */
export const getComponentEditor = (type: ComponentType): ComponentEditor | null => {
  return componentEditors[type] || null;
};
`;
                }

                // エディタ名を生成（ファイル名から.tsxを削除）
                const editorName = fileName.replace('.tsx', '');
                const pascalCaseEditorName = editorName;

                // インポート文を追加（既に存在する場合はスキップ）
                const importPattern = new RegExp(`import.*${pascalCaseEditorName}.*from`, 'g');
                if (!importPattern.test(registryContent)) {
                  // すべてのインポート文を検索して、最後のインポートの後に追加
                  const allImports = registryContent.match(/import\s+.*?from\s+['"].*?['"];?\s*/g);
                  if (allImports && allImports.length > 0) {
                    // 最後のインポート文の後に追加
                    const lastImport = allImports[allImports.length - 1];
                    const lastImportIndex = registryContent.lastIndexOf(lastImport);
                    const insertIndex = lastImportIndex + lastImport.length;
                    registryContent = registryContent.slice(0, insertIndex) + 
                      `\nimport { ${pascalCaseEditorName} } from './${editorName}';` + 
                      registryContent.slice(insertIndex);
                  } else {
                    // インポートが見つからない場合は、BaseEditorのインポートの後に追加
                    const baseEditorImportMatch = registryContent.match(/import.*BaseEditor.*from.*['"];?\s*/);
                    if (baseEditorImportMatch) {
                      const insertIndex = baseEditorImportMatch.index! + baseEditorImportMatch[0].length;
                      registryContent = registryContent.slice(0, insertIndex) + 
                        `import { ${pascalCaseEditorName} } from './${editorName}';\n` + 
                        registryContent.slice(insertIndex);
                    } else {
                      // それでも見つからない場合は、ファイルの先頭付近に追加
                      const reactImportMatch = registryContent.match(/import\s+React.*from.*['"];?\s*/);
                      if (reactImportMatch) {
                        const insertIndex = reactImportMatch.index! + reactImportMatch[0].length;
                        registryContent = registryContent.slice(0, insertIndex) + 
                          `\nimport { ${pascalCaseEditorName} } from './${editorName}';` + 
                          registryContent.slice(insertIndex);
                      }
                    }
                  }
                }

                // componentEditorsオブジェクトに追加（既に存在する場合はスキップ）
                const editorEntryPattern = new RegExp(`['"]${componentType}['"]:\\s*${pascalCaseEditorName}`, 'g');
                if (!editorEntryPattern.test(registryContent)) {
                  // componentEditorsオブジェクト内に追加（最後のエントリの後に）
                  const editorsObjectMatch = registryContent.match(/export const componentEditors[^=]*=\s*\{([^}]*)\}/s);
                  if (editorsObjectMatch) {
                    const editorsObjectContent = editorsObjectMatch[1];
                    const newEntry = `  '${componentType}': ${pascalCaseEditorName},\n`;
                    
                    // 既存のエントリがある場合、最後のエントリの後に追加
                    if (editorsObjectContent.trim()) {
                      // 最後のエントリを動的に検出（カンマで終わる最後の行）
                      const lines = editorsObjectContent.split('\n');
                      let lastEntryLineIndex = -1;
                      for (let i = lines.length - 1; i >= 0; i--) {
                        const line = lines[i].trim();
                        // カンマで終わる行、または空でない行を探す
                        if (line && (line.endsWith(',') || line.match(/^\s*['"][^'"]+['"]:\s*\w+,?\s*$/))) {
                          lastEntryLineIndex = i;
                          break;
                        }
                      }
                      
                      if (lastEntryLineIndex >= 0) {
                        // 最後のエントリの後に追加
                        const lastEntryLine = lines[lastEntryLineIndex];
                        const indent = lastEntryLine.match(/^(\s*)/)?.[1] || '  ';
                        lines.splice(lastEntryLineIndex + 1, 0, `${indent}'${componentType}': ${pascalCaseEditorName},`);
                        const updatedContent = lines.join('\n');
                        registryContent = registryContent.replace(
                          /export const componentEditors[^=]*=\s*\{([^}]*)\}/s,
                          `export const componentEditors: Partial<Record<ComponentType, ComponentEditor>> = {${updatedContent}}`
                        );
                      } else {
                        // フォールバック: オブジェクトの閉じ括弧の直前に追加
                        registryContent = registryContent.replace(
                          /(\}\s*;)/,
                          `  '${componentType}': ${pascalCaseEditorName},\n$1`
                        );
                      }
                    } else {
                      // 空のオブジェクトの場合
                      registryContent = registryContent.replace(
                        /export const componentEditors[^=]*=\s*\{\s*\}/,
                        `export const componentEditors: Partial<Record<ComponentType, ComponentEditor>> = {${newEntry}}`
                      );
                    }
                  } else {
                    // パターンが見つからない場合は、オブジェクトの閉じ括弧の直前に追加
                    const closingBraceMatch = registryContent.match(/(\s*\}\s*;)/);
                    if (closingBraceMatch) {
                      registryContent = registryContent.replace(
                        closingBraceMatch[0],
                        `  '${componentType}': ${pascalCaseEditorName},\n${closingBraceMatch[0]}`
                      );
                    }
                  }
                }

                writeFileSync(registryIndexPath, registryContent, 'utf-8');
                console.log(`Updated editor registry: ${registryIndexPath}`);

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  message: `エディターファイル「${fileName}」が作成されました`,
                  filePath: editorFilePath,
                  fileName: fileName,
                }));
              } catch (error: any) {
                console.error('Error creating editor file:', error);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({
                  success: false,
                  error: error.message || 'エディターファイルの作成に失敗しました',
                }));
              }
            });
          } catch (error: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({
              success: false,
              error: error.message || 'リクエストの処理に失敗しました',
            }));
          }
        });
      },
    },
    // 共通画像一覧取得APIエンドポイント
    {
      name: 'common-images-api',
      configureServer(server) {
        server.middlewares.use('/api/common-images', async (req, res, next) => {
          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          try {
            const projectBasePath = process.cwd();
            const imgDirPath = join(projectBasePath, 'public/program/st/promo/generator_common/img');

            // ディレクトリが存在しない場合は空配列を返す
            if (!existsSync(imgDirPath)) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ images: [] }));
              return;
            }

            // 画像ファイルのみをフィルタリング
            const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
            const files = readdirSync(imgDirPath).filter(file => {
              const filePath = join(imgDirPath, file);
              const stats = statSync(filePath);
              if (!stats.isFile()) return false;
              const ext = file.toLowerCase().substring(file.lastIndexOf('.'));
              return imageExtensions.includes(ext);
            });

            // ファイル名をソート
            const sortedFiles = files.sort();

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ images: sortedFiles }));
          } catch (error: any) {
            console.error('Error fetching common images:', error);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message || 'Failed to fetch common images' }));
          }
        });
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
