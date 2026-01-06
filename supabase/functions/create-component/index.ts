import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateComponentRequest {
  componentName: string;
  displayName: string;
  category: string;
  categoryRomanized: string;
  generatedCode: string;
  uniqueId: string;
  sectionId: string;
  cssContent?: string;
  cssFileName?: string;
  isExistingCategory?: boolean;
  isNewCategory?: boolean;
  defaultProps?: Record<string, any>;
  propSchema?: any[];
  cssFiles?: string[];
  jsFiles?: string[];
  description?: string;
  thumbnailUrl?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: CreateComponentRequest = await req.json();
    const { componentName, generatedCode, displayName, category, categoryRomanized, uniqueId, sectionId, cssContent, cssFileName, isExistingCategory, isNewCategory, defaultProps, propSchema, cssFiles, jsFiles, description, thumbnailUrl } = body;

    // コンポーネントファイル名を生成（PascalCase）
    const componentFileName = componentName
      .split(/[\s-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Component.tsx';

    // プロジェクトのベースパスを取得
    const projectBasePath = '/tmp/cc-agent/59019885/project';
    const componentsDirPath = `${projectBasePath}/src/components/Components`;
    const componentFilePath = `${componentsDirPath}/${componentFileName}`;

    // 1. Componentsディレクトリが存在しない場合は作成
    try {
      await Deno.stat(componentsDirPath);
    } catch {
      // ディレクトリが存在しない場合は作成
      await Deno.mkdir(componentsDirPath, { recursive: true });
      console.log(`Created directory: ${componentsDirPath}`);
    }

    // 2. コンポーネントファイルを作成
    await Deno.writeTextFile(componentFilePath, generatedCode);
    console.log(`Component file created: ${componentFilePath}`);

    // 3. componentTemplates.tsを更新して新しいコンポーネントを追加
    const templatesFilePath = `${projectBasePath}/src/data/componentTemplates.ts`;
    let templatesContent = await Deno.readTextFile(templatesFilePath);

    // 配列の最後の ]]; を見つけて、その前に新しいエントリを追加
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
    
    const defaultPropsStr = formatJSON(defaultProps || {});
    const propSchemaStr = formatJSON(propSchema || []);
    const cssFilesStr = formatJSON(cssFiles || []);
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
    await Deno.writeTextFile(templatesFilePath, templatesContent);
    console.log(`Updated componentTemplates.ts`);

    // 4. CSSファイルの処理（カスタムCSSがある場合）
    let cssFilePath: string | null = null;
    if (cssContent && cssFileName) {
      const cssDirPath = `${projectBasePath}/public/program/st/promo/generator_common/css`;
      cssFilePath = `${cssDirPath}/${cssFileName}`;
      
      // CSSディレクトリが存在しない場合は作成
      try {
        await Deno.stat(cssDirPath);
      } catch {
        await Deno.mkdir(cssDirPath, { recursive: true });
        console.log(`Created CSS directory: ${cssDirPath}`);
      }
      
      if (isExistingCategory) {
        // 既存カテゴリ：既存ファイルを読み込んで追加
        try {
          const existingContent = await Deno.readTextFile(cssFilePath);
          // 既存の内容の末尾に追加CSSを追記
          const updatedContent = `${existingContent}\n\n${cssContent}`;
          await Deno.writeTextFile(cssFilePath, updatedContent);
          console.log(`Updated existing CSS file: ${cssFilePath}`);
        } catch (error) {
          // 既存ファイルが存在しない場合は新規作成
          console.warn(`Existing CSS file not found, creating new: ${cssFilePath}`, error);
          await Deno.writeTextFile(cssFilePath, cssContent);
          console.log(`Created new CSS file: ${cssFilePath}`);
        }
      } else if (isNewCategory) {
        // 新規カテゴリ：新規ファイルを作成
        await Deno.writeTextFile(cssFilePath, cssContent);
        console.log(`Created new CSS file: ${cssFilePath}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `コンポーネント「${displayName}」が作成されました`,
        filePath: componentFilePath,
        fileName: componentFileName,
        cssFilePath: cssFilePath || null,
        cssFileName: cssFileName || null,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating component:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "コンポーネントの作成に失敗しました",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});