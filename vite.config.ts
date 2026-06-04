import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const COMMON_IMG_DIR = 'public/program/st/promo/generator_common/img';
const COMMON_IMG_PUBLIC_PREFIX = '/program/st/promo/generator_common/img/';

const readJsonBody = (req: import('http').IncomingMessage): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });

const sanitizeThumbnailSlug = (uniqueId: string): string =>
  uniqueId
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'template';

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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'component-file-api',
      configureServer(server) {
        server.middlewares.use('/api/create-component', async (req, res, _next) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 410;
          res.end(
            JSON.stringify({
              success: false,
              error: 'DISABLED',
              message:
                '静的 .tsx 生成 API は廃止されました。新規コンポーネントは Supabase の dynamic-template のみです。',
            })
          );
        });
      },
    },
    {
      name: 'editor-file-api',
      configureServer(server) {
        server.middlewares.use('/api/create-editor', async (req, res, _next) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 410;
          res.end(
            JSON.stringify({
              success: false,
              error: 'DISABLED',
              message: 'エディターファイル自動生成 API は廃止されました。',
            })
          );
        });
      },
    },
    {
      name: 'common-images-api',
      configureServer(server) {
        server.middlewares.use('/api/common-images', async (req, res, _next) => {
          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          try {
            const projectBasePath = process.cwd();
            const imgDirPath = join(projectBasePath, 'public/program/st/promo/generator_common/img');

            if (!existsSync(imgDirPath)) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ images: [] }));
              return;
            }

            const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
            const files = readdirSync(imgDirPath).filter((file) => {
              const filePath = join(imgDirPath, file);
              const stats = statSync(filePath);
              if (!stats.isFile()) return false;
              const ext = file.toLowerCase().substring(file.lastIndexOf('.'));
              return imageExtensions.includes(ext);
            });

            const sortedFiles = files.sort();

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ images: sortedFiles }));
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to fetch common images';
            console.error('Error fetching common images:', error);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: message }));
          }
        });
      },
    },
    {
      name: 'upload-thumbnail-api',
      configureServer(server) {
        server.middlewares.use('/api/upload-thumbnail', async (req, res, _next) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          res.setHeader('Content-Type', 'application/json');

          try {
            const body = (await readJsonBody(req)) as {
              uniqueId?: string;
              dataUrl?: string;
              mimeType?: string;
            };

            const slug = sanitizeThumbnailSlug(String(body.uniqueId || ''));
            const dataUrl = String(body.dataUrl || '');
            const mimeType = String(body.mimeType || 'image/jpeg');

            if (!dataUrl.startsWith('data:image/')) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'INVALID_DATA_URL' }));
              return;
            }

            const match = dataUrl.match(/^data:image\/[a-z+]+;base64,(.+)$/i);
            if (!match) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'INVALID_DATA_URL' }));
              return;
            }

            const buffer = Buffer.from(match[1], 'base64');
            const maxSize = 10 * 1024 * 1024;
            if (buffer.length > maxSize) {
              res.statusCode = 400;
              res.end(
                JSON.stringify({
                  success: false,
                  error: 'FILE_TOO_LARGE',
                  message: '10MB以下の画像をアップロードしてください。',
                })
              );
              return;
            }

            const projectBasePath = process.cwd();
            const imgDirPath = join(projectBasePath, COMMON_IMG_DIR);
            if (!existsSync(imgDirPath)) {
              mkdirSync(imgDirPath, { recursive: true });
            }

            const ext = extFromMime(mimeType);
            const filename = `thumbnail_${slug}${ext}`;
            const filePath = join(imgDirPath, filename);

            if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'INVALID_FILENAME' }));
              return;
            }

            writeFileSync(filePath, buffer);

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                filename,
                path: `${COMMON_IMG_PUBLIC_PREFIX}${filename}`,
              })
            );
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Upload failed';
            console.error('upload-thumbnail error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: message }));
          }
        });
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
