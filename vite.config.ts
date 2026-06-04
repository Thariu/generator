import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

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
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
