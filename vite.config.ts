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
