#!/usr/bin/env bun
/**
 * 三语完整性检查：扫描随笔与宣言的语言目录，报告缺译清单与结构性错误。
 *
 * - 缺译：只在 stderr 之外的报告里列出，退出码仍为 0（发布前可判断，不阻断构建）
 * - 结构性错误（未知语言目录、同一语言下重复的文章标识）：退出码 1
 *
 * 用法：bun run check:i18n
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES } from '../src/i18n/config.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ESSAYS_DIR = join(ROOT, 'src', 'content', 'essays');
const MANIFESTO_DIR = join(ROOT, 'src', 'manifesto');
const MANIFESTO_FILE = 'what-is-p-acc.md';

const SUPPORTED = new Set(LOCALES);
const structuralErrors = [];

/** 递归列出某目录下的 .md 文件，返回相对该目录的路径（去掉 .md 后缀，作为 slug）。 */
function listMarkdownSlugs(dir) {
  const slugs = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      slugs.push(...listMarkdownSlugs(fullPath).map((slug) => `${entry.name}/${slug}`));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      slugs.push(entry.name.replace(/\.md$/, ''));
    }
  }

  return slugs;
}

/** 读取随笔目录结构：语言 → slug → 文件列表。 */
function collectEssays() {
  const byLang = new Map(LOCALES.map((locale) => [locale, new Map()]));

  for (const entry of readdirSync(ESSAYS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      structuralErrors.push(
        `随笔目录下存在不属于任何语言的条目：src/content/essays/${entry.name}`,
      );
      continue;
    }

    if (!SUPPORTED.has(entry.name)) {
      structuralErrors.push(
        `未知语言目录：src/content/essays/${entry.name}（受支持语言：${LOCALES.join('、')}）`,
      );
      continue;
    }

    const dir = join(ESSAYS_DIR, entry.name);
    for (const slug of listMarkdownSlugs(dir)) {
      const files = byLang.get(entry.name).get(slug) ?? [];
      files.push(join(dir, `${slug}.md`));
      byLang.get(entry.name).set(slug, files);
    }
  }

  return byLang;
}

/** 读取宣言目录结构：语言 → 文件是否存在。 */
function collectManifestos() {
  const present = new Map();

  for (const entry of readdirSync(MANIFESTO_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      structuralErrors.push(`宣言目录下存在不属于任何语言的条目：src/manifesto/${entry.name}`);
      continue;
    }

    if (!SUPPORTED.has(entry.name)) {
      structuralErrors.push(
        `未知语言目录：src/manifesto/${entry.name}（受支持语言：${LOCALES.join('、')}）`,
      );
      continue;
    }

    const file = join(MANIFESTO_DIR, entry.name, MANIFESTO_FILE);
    let exists = false;
    try {
      exists = statSync(file).isFile();
    } catch {
      exists = false;
    }
    present.set(entry.name, exists && readFileSync(file, 'utf8').trim().length > 0);
  }

  return present;
}

const essays = collectEssays();
const manifestos = collectManifestos();

const allSlugs = [...new Set(LOCALES.flatMap((locale) => [...essays.get(locale).keys()]))].sort();
const missing = [];

for (const slug of allSlugs) {
  const absent = LOCALES.filter((locale) => !essays.get(locale).has(slug));
  if (absent.length === 0) continue;

  missing.push(`随笔 ${slug}：缺少 ${absent.join('、')}`);
}

for (const locale of LOCALES) {
  if (manifestos.get(locale) !== true) {
    missing.push(`宣言 what-is-p-acc：缺少 ${locale}`);
  }
}

for (const locale of LOCALES) {
  for (const [slug, files] of essays.get(locale)) {
    if (files.length > 1) {
      structuralErrors.push(
        `同一语言下出现重复的文章标识 ${locale}/${slug}：${files
          .map((file) => relative(ROOT, file))
          .join('、')}`,
      );
    }
  }
}

const essayCount = [...essays.values()].reduce((total, slugs) => total + slugs.size, 0);
const manifestoCount = [...manifestos.values()].filter(Boolean).length;

console.log(
  `检查范围：${allSlugs.length} 个文章标识、${essayCount} 份随笔译文、${manifestoCount}/${LOCALES.length} 份宣言译文`,
);

if (missing.length === 0) {
  console.log('三语覆盖完整：没有缺译。');
} else {
  console.log(`发现 ${missing.length} 处缺译：`);
  for (const item of missing) console.log(`- ${item}`);
}

if (structuralErrors.length > 0) {
  console.error(`发现 ${structuralErrors.length} 处结构性错误：`);
  for (const item of structuralErrors) console.error(`- ${item}`);
  process.exit(1);
}

if (missing.length > 0 && process.argv.includes('--strict')) {
  console.error('--strict 下缺译视为失败。');
  process.exit(1);
}

process.exit(0);
