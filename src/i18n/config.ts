/** 语言配置与路径助手：全站唯一的语言来源。 */

export const LOCALES = ['en', 'zh-cn', 'ja'] as const;

export type Locale = (typeof LOCALES)[number];

/** 默认语言与最终回落语言。 */
export const DEFAULT_LOCALE: Locale = 'en';

/** 语言胶囊与语言入口页展示的自称。 */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  'zh-cn': '简体中文',
  ja: '日本語',
};

/** 窄屏收起时展示的短码。 */
export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: 'EN',
  'zh-cn': '中',
  ja: '日',
};

/** 写入 <html lang> 的 BCP 47 取值。 */
export const HTML_LANG: Record<Locale, string> = {
  en: 'en',
  'zh-cn': 'zh-CN',
  ja: 'ja',
};

/** 一条 hreflang alternate 链接。 */
export interface Alternate {
  locale: Locale;
  href: string;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * 把站内页面路径包上语言前缀。
 * `localizedPath('ja', '/')` → `/ja/`；`localizedPath('en', '/essays')` → `/en/essays`
 */
export function localizedPath(locale: Locale, path = '/'): string {
  const suffix = path === '/' || path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  return suffix === '/' ? `/${locale}/` : `/${locale}${suffix}`;
}

/** 从任意路径读出语言；没有语言前缀时返回 null。 */
export function localeFromPath(pathname: string): Locale | null {
  const [first] = pathname.split('/').filter(Boolean);
  return first && isLocale(first) ? first : null;
}

/** 去掉语言前缀后的页面路径，用于导航当前项判定与语言切换。 */
export function stripLocale(pathname: string): string {
  const locale = localeFromPath(pathname);
  if (!locale) return pathname.startsWith('/') ? pathname : `/${pathname}`;
  const rest = pathname.slice(locale.length + 1);
  return rest === '' || rest === '/' ? '/' : rest.startsWith('/') ? rest : `/${rest}`;
}

/** 同一页面在目标语言下的路径；无语言前缀的路径按默认语言处理。 */
export function switchLocalePath(pathname: string, targetLocale: Locale): string {
  const pagePath = stripLocale(pathname);
  return localizedPath(targetLocale, pagePath);
}

/** 浏览器语言标签（如 `zh-Hans-CN`、`ja`）到受支持语言的映射。 */
export function matchLocale(languageTag: string): Locale | null {
  const tag = languageTag.toLowerCase();
  if (tag === 'zh' || tag.startsWith('zh-')) return 'zh-cn';
  if (tag === 'ja' || tag.startsWith('ja-')) return 'ja';
  if (tag === 'en' || tag.startsWith('en-')) return 'en';
  return null;
}

/** 按浏览器偏好顺序取第一个受支持语言；无匹配时回落默认语言。 */
export function preferredLocale(languages: readonly string[] = []): Locale {
  for (const tag of languages) {
    const matched = matchLocale(tag);
    if (matched) return matched;
  }
  return DEFAULT_LOCALE;
}
