import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** 随笔按语言分目录承载：`<lang>/<slug>.md`，语言由所在目录决定，不在 frontmatter 里重复声明。 */
const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    /** 写作过程中是否使用了 AIGC 处理，决定文末是否渲染披露标记。 */
    aigc: z.boolean().default(false),
  }),
});

export const collections = { essays };
