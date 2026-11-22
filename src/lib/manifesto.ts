import { LOCALES, localizedPath, type Locale } from '../i18n/config';

/** 宣言正文按语言分文件：`src/manifesto/<lang>/what-is-p-acc.md`。 */
interface ManifestoModule {
  Content: (props: Record<string, unknown>) => unknown;
  frontmatter: Record<string, unknown>;
}

export interface Manifesto {
  locale: Locale;
  title: string;
  date: Date;
  aigc: boolean;
  Content: ManifestoModule['Content'];
}

const modules = import.meta.glob<ManifestoModule>('../manifesto/*/what-is-p-acc.md', {
  eager: true,
});

function keyOf(locale: Locale): string {
  return `../manifesto/${locale}/what-is-p-acc.md`;
}

/** 真实存在宣言译文语言。 */
export function getManifestoLocales(): Locale[] {
  return LOCALES.filter((locale) => modules[keyOf(locale)] !== undefined);
}

/** 取某语言的宣言；缺译时返回 null，由调用方决定是否生成页面。 */
export function getManifesto(locale: Locale): Manifesto | null {
  const manifesto = modules[keyOf(locale)];
  if (!manifesto) return null;

  return {
    locale,
    title: String(manifesto.frontmatter.title),
    date: new Date(String(manifesto.frontmatter.date)),
    aigc: manifesto.frontmatter.aigc === true,
    Content: manifesto.Content,
  };
}

/** 语言胶囊用的路径表：存在译文指向该语言宣言页，缺译回落该语言首页。 */
export function getManifestoLocalePaths(): Record<Locale, string> {
  const available = getManifestoLocales();

  return LOCALES.reduce(
    (paths, locale) => {
      paths[locale] = available.includes(locale)
        ? localizedPath(locale, '/what-is-p-acc')
        : localizedPath(locale, '/');
      return paths;
    },
    {} as Record<Locale, string>,
  );
}
