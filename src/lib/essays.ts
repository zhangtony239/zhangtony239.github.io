import { getCollection, type CollectionEntry } from 'astro:content';
import { LOCALES, isLocale, localizedPath, type Locale } from '../i18n/config';

export type Essay = CollectionEntry<'essays'>;

export interface EssayYearGroup {
  year: string;
  essays: Essay[];
}

export interface EssayIdentity {
  lang: Locale;
  /** 跨语言共享的文章身份。 */
  slug: string;
}

export interface EssayAlternates {
  /** 真实存在译文的语言，按 LOCALES 顺序。 */
  locales: Locale[];
  /** `x-default` 指向的语言：英文优先，否则第一个存在的译文。 */
  xDefault: Locale | null;
}

/**
 * 把内容集合的 id（`<lang>/<slug>`）拆成语言与文章身份。
 * 任何不在语言目录下的文件都视为结构错误。
 */
export function parseEssayId(id: string): EssayIdentity {
  const [maybeLang, ...rest] = id.split('/');
  const slug = rest.join('/').replace(/\.mdx?$/, '');

  if (!isLocale(maybeLang)) {
    throw new Error(
      `[essays] 随笔必须放在语言目录下（src/content/essays/<lang>/<slug>.md），实际为 "${id}"。`,
    );
  }

  if (!slug) {
    throw new Error(`[essays] 缺少文章标识：${id}`);
  }

  return { lang: maybeLang, slug };
}

/** 文章级属性是否一致：日期、草稿、AIGC 标记必须跨语言相同。 */
function assertSharedAttributes(slug: string, versions: Partial<Record<Locale, Essay>>): void {
  const entries = Object.entries(versions) as [Locale, Essay][];
  const [firstLocale, first] = entries[0];

  for (const [locale, essay] of entries.slice(1)) {
    if (essay.data.date.valueOf() !== first.data.date.valueOf()) {
      throw new Error(
        `[essays] "${slug}" 的日期不一致：${firstLocale} 为 ${first.data.date.toISOString()}，${locale} 为 ${essay.data.date.toISOString()}。`,
      );
    }
    if (essay.data.draft !== first.data.draft) {
      throw new Error(`[essays] "${slug}" 的 draft 状态不一致：${firstLocale} 与 ${locale} 不同。`);
    }
    if (essay.data.aigc !== first.data.aigc) {
      throw new Error(`[essays] "${slug}" 的 aigc 标记不一致：${firstLocale} 与 ${locale} 不同。`);
    }
  }
}

/**
 * 全部随笔的注册表：slug → 各语言版本。
 * 构建时校验同一 slug 的文章级属性一致性，并拒绝同一语言下重复的 slug。
 */
export async function getEssayRegistry(): Promise<Map<string, Partial<Record<Locale, Essay>>>> {
  const essays = await getCollection('essays');
  const registry = new Map<string, Partial<Record<Locale, Essay>>>();

  for (const essay of essays) {
    const { lang, slug } = parseEssayId(essay.id);

    const versions = registry.get(slug) ?? {};
    if (versions[lang]) {
      throw new Error(`[essays] 同一语言下出现重复文章标识：${lang}/${slug}。`);
    }

    versions[lang] = essay;
    registry.set(slug, versions);
  }

  for (const [slug, versions] of registry) {
    assertSharedAttributes(slug, versions);
  }

  return registry;
}

/** 某语言下已发布的随笔：排除草稿，按日期倒序；同日期以标题稳定排序。 */
export async function getPublishedEssays(locale: Locale): Promise<Essay[]> {
  const essays = await getCollection(
    'essays',
    ({ id, data }) => data.draft !== true && parseEssayId(id).lang === locale,
  );

  return essays.slice().sort((a, b) => {
    const byDate = b.data.date.valueOf() - a.data.date.valueOf();
    if (byDate !== 0) return byDate;
    return a.data.title.localeCompare(b.data.title, locale);
  });
}

/** 按年份分组：年份倒序，年内保持日期倒序。 */
export async function groupByYear(locale: Locale): Promise<EssayYearGroup[]> {
  const groups = new Map<string, Essay[]>();

  for (const essay of await getPublishedEssays(locale)) {
    const year = String(essay.data.date.getFullYear());
    const bucket = groups.get(year);
    if (bucket) {
      bucket.push(essay);
    } else {
      groups.set(year, [essay]);
    }
  }

  return [...groups.entries()].map(([year, essays]) => ({ year, essays }));
}

/** 归档行使用的日期格式：2026.11.20（三语共用，保证列宽一致）。 */
export function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}

/**
 * 某篇文章真实存在的译文语言，以及 `x-default` 的落点。
 * 缺译时调用方应回落到该语言首页，并在此处被显式感知。
 */
export async function getEssayAlternates(slug: string): Promise<EssayAlternates> {
  const registry = await getEssayRegistry();
  const versions = registry.get(slug) ?? {};
  const locales = LOCALES.filter((locale) => versions[locale] !== undefined);

  return {
    locales,
    xDefault: locales.includes('en') ? 'en' : (locales[0] ?? null),
  };
}

/**
 * 语言胶囊用的路径表：存在的译文指向同 slug 的译文页，缺少译文时回落该语言首页。
 */
export async function getEssayLocalePaths(slug: string): Promise<Record<Locale, string>> {
  const registry = await getEssayRegistry();
  const versions = registry.get(slug) ?? {};

  return LOCALES.reduce(
    (paths, locale) => {
      paths[locale] =
        versions[locale] !== undefined
          ? localizedPath(locale, `/essays/${slug}`)
          : localizedPath(locale, '/');
      return paths;
    },
    {} as Record<Locale, string>,
  );
}
