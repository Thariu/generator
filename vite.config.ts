import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
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

                // 4. ComponentTypeへの自動追加（src/types/index.ts）
                const typesFilePath = join(projectBasePath, 'src/types/index.ts');
                let typesContent = readFileSync(typesFilePath, 'utf-8');
                
                // ComponentTypeに既に存在するかチェック
                const typeExists = typesContent.includes(`'${categoryRomanized}'`);
                if (!typeExists) {
                  // ComponentTypeの定義を見つけて、新しいタイプを追加
                  // 最後の 'tel'; の前に追加
                  const typePattern = /(\s+\| 'tel';\s*)/;
                  if (typePattern.test(typesContent)) {
                    typesContent = typesContent.replace(
                      typePattern,
                      `  | '${categoryRomanized}'\n$1`
                    );
                    writeFileSync(typesFilePath, typesContent, 'utf-8');
                    console.log(`Added '${categoryRomanized}' to ComponentType`);
                  } else {
                    // パターンが見つからない場合、'tel'の前に追加を試みる
                    const fallbackPattern = /(\| 'tel';\s*)/;
                    if (fallbackPattern.test(typesContent)) {
                      typesContent = typesContent.replace(
                        fallbackPattern,
                        `| '${categoryRomanized}'\n  $1`
                      );
                      writeFileSync(typesFilePath, typesContent, 'utf-8');
                      console.log(`Added '${categoryRomanized}' to ComponentType (fallback)`);
                    }
                  }
                } else {
                  console.log(`ComponentType '${categoryRomanized}' already exists`);
                }

                // 5. ComponentRenderer.tsxへの自動追加
                const rendererFilePath = join(projectBasePath, 'src/components/PageBuilder/ComponentRenderer.tsx');
                let rendererContent = readFileSync(rendererFilePath, 'utf-8');
                
                // コンポーネント名を生成（uniqueIdから）
                const componentNameForImport = componentFileName.replace('.tsx', '');
                
                // インポート文が既に存在するかチェック
                const importExists = rendererContent.includes(`import ${componentNameForImport}`);
                if (!importExists) {
                  // 最後のインポート文の後に追加
                  // BtnComponentのインポートの後に追加する
                  const lastImportPattern = /(import BtnComponent from '\.\.\/Components\/BtnComponent';)/;
                  if (lastImportPattern.test(rendererContent)) {
                    rendererContent = rendererContent.replace(
                      lastImportPattern,
                      // 修正: componentFileNameから.tsxを削除
                      `$1\nimport ${componentNameForImport} from '../Components/${componentNameForImport}';`
                    );
                    writeFileSync(rendererFilePath, rendererContent, 'utf-8');
                    console.log(`Added import for ${componentNameForImport}`);
                  } else {
                    // BtnComponentが見つからない場合、最後のインポートの後に追加
                    const anyImportPattern = /(import \w+Component from '\.\.\/Components\/[\w\/]+';\s*)/;
                    const matches = rendererContent.match(new RegExp(anyImportPattern.source, 'g'));
                    if (matches && matches.length > 0) {
                      const lastImport = matches[matches.length - 1];
                      rendererContent = rendererContent.replace(
                        lastImport,
                        // 修正: componentFileNameから.tsxを削除
                        `${lastImport}import ${componentNameForImport} from '../Components/${componentNameForImport}';\n`
                      );
                      writeFileSync(rendererFilePath, rendererContent, 'utf-8');
                      console.log(`Added import for ${componentNameForImport} (fallback)`);
                    }
                  }
                } else {
                  console.log(`Import for ${componentNameForImport} already exists`);
                }
                
                // 既存のインポート文から.tsx拡張子を削除（修正）
                // すべてのコンポーネントインポート文から.tsx拡張子を削除
                const allImportWithExtensionPattern = /import\s+(\w+Component)\s+from\s+['"]\.\.\/Components\/(\w+Component)\.tsx['"];/g;
                if (allImportWithExtensionPattern.test(rendererContent)) {
                  rendererContent = rendererContent.replace(
                    allImportWithExtensionPattern,
                    "import $1 from '../Components/$2';"
                  );
                  writeFileSync(rendererFilePath, rendererContent, 'utf-8');
                  console.log(`Removed .tsx extension from all component imports`);
                }
                
                // case文が既に存在するかチェック
                const caseExists = rendererContent.includes(`case '${categoryRomanized}':`);
                if (!caseExists) {
                  // switch文内のdefaultの前に追加（より柔軟な方法）
                  const defaultPattern = /(\s+)(default:)/;
                  if (defaultPattern.test(rendererContent)) {
                    // defaultの前に新しいcaseを追加
                    rendererContent = rendererContent.replace(
                      defaultPattern,
                      `$1case '${categoryRomanized}':\n        return <${componentNameForImport} {...commonProps} />;\n      $1$2`
                    );
                    writeFileSync(rendererFilePath, rendererContent, 'utf-8');
                    console.log(`Added case '${categoryRomanized}' to ComponentRenderer`);
                  } else {
                    console.warn(`Could not find 'default:' pattern in ComponentRenderer.tsx`);
                  }
                } else {
                  console.log(`Case '${categoryRomanized}' already exists in ComponentRenderer`);
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
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
