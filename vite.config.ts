import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    const openaiApiKey = env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || '';
    const apiKey = geminiApiKey || openaiApiKey; // Prefer Gemini, fallback to OpenAI
    
    // Log for debugging (only in dev mode, won't expose in production)
    if (mode === 'development') {
      console.log('🔑 Loading API key from environment...');
      if (geminiApiKey) {
        console.log('✅ Gemini API key loaded successfully');
      } else if (openaiApiKey) {
        console.log('✅ OpenAI API key loaded (fallback)');
      } else {
        console.warn('⚠️  VITE_GEMINI_API_KEY not found in .env.local');
        console.warn('   Please create .env.local with: VITE_GEMINI_API_KEY=your_key_here');
      }
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/openai': {
            target: 'https://api.openai.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/openai/, ''),
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req, res) => {
                // Add API key to headers - use the apiKey from the closure
                if (apiKey) {
                  proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
                  console.log('🔐 Added API key to proxy request');
                } else {
                  console.warn('⚠️  No API key available for proxy');
                }
              });
              proxy.on('error', (err, req, res) => {
                console.error('Proxy error:', err);
              });
            },
          },
        },
      },
      plugins: [
        react(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiApiKey),
        'process.env.OPENAI_API_KEY': JSON.stringify(openaiApiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      base: './', // Important for Electron and Capacitor - use relative paths
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        rollupOptions: {
          output: {
            manualChunks: undefined
          }
        }
      }
    };
});
