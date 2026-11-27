import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// 静态输出、零 integration、用户 Pages 根路径发布。
export default defineConfig({
  site: 'https://zhangtony239.github.io',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
  },
});
