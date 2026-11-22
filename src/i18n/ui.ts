/** 站点外壳文案字典：三语同构，页面与组件只按 key 取文案。 */

import { DEFAULT_LOCALE, type Locale } from './config';

export interface UiDict {
  nav: {
    /** 主导航的无障碍名称。 */
    label: string;
    home: string;
    pacc: string;
    essays: string;
  };
  home: {
    /** 首页唯一的主视觉文字；三语共用同一句品牌标语。 */
    slogan: string;
  };
  essays: {
    /** 归档页标题，同时用于文档标题前缀。 */
    title: string;
  };
  archive: {
    /** 归档为空时的提示。 */
    empty: string;
  };
  aigc: {
    /** 文章底部 AIGC 披露标记的完整文案（前导星号由模板渲染）。 */
    noticeLabel: string;
  };
  footer: {
    /** 页脚站外链接列表的无障碍名称。 */
    externalLinks: string;
  };
  language: {
    /** 语言胶囊的无障碍名称。 */
    switchLabel: string;
    /** 当前语言标记的读屏文案。 */
    currentLabel: string;
    /** 窄屏收起时展开按钮的读屏文案。 */
    menuLabel: string;
  };
}

export const UI: Record<Locale, UiDict> = {
  en: {
    nav: {
      label: 'Main navigation',
      home: 'Home',
      pacc: 'p/acc',
      essays: 'Essays',
    },
    home: {
      slogan: 'For our foundational loves.',
    },
    essays: {
      title: 'Essays',
    },
    archive: {
      empty: 'No essays yet.',
    },
    aigc: {
      noticeLabel: 'This article is covered by the AIGC Disclosure Notice',
    },
    footer: {
      externalLinks: 'External links',
    },
    language: {
      switchLabel: 'Switch language',
      currentLabel: 'Current language',
      menuLabel: 'Choose a language',
    },
  },
  'zh-cn': {
    nav: {
      label: '主导航',
      home: '首页',
      pacc: 'p/acc',
      essays: '随笔',
    },
    home: {
      slogan: 'For our foundational loves.',
    },
    essays: {
      title: '随笔',
    },
    archive: {
      empty: '还没有随笔。',
    },
    aigc: {
      noticeLabel: '本文适用于《含AIGC文稿统一解释说明》',
    },
    footer: {
      externalLinks: '站外链接',
    },
    language: {
      switchLabel: '切换语言',
      currentLabel: '当前语言',
      menuLabel: '选择语言',
    },
  },
  ja: {
    nav: {
      label: 'メインナビゲーション',
      home: 'ホーム',
      pacc: 'p/acc',
      essays: 'エッセイ',
    },
    home: {
      slogan: 'For our foundational loves.',
    },
    essays: {
      title: 'エッセイ',
    },
    archive: {
      empty: 'まだエッセイがありません。',
    },
    aigc: {
      noticeLabel: '本記事は「AIGC 開示についての統一説明」の対象です',
    },
    footer: {
      externalLinks: '外部リンク',
    },
    language: {
      switchLabel: '言語を切り替える',
      currentLabel: '現在の言語',
      menuLabel: '言語を選択',
    },
  },
};

function warnMissing(locale: Locale, keys: string[]): void {
  if (keys.length === 0 || locale === DEFAULT_LOCALE) return;
  console.warn(
    `[i18n] ${locale} 缺少外壳文案：${keys.join(', ')}；已回落 ${DEFAULT_LOCALE}。`,
  );
}

function collectMissing(
  candidate: Record<string, unknown>,
  reference: Record<string, unknown>,
  prefix = '',
): string[] {
  const missing: string[] = [];

  for (const [key, referenceValue] of Object.entries(reference)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const candidateValue = candidate[key];

    if (candidateValue === undefined || candidateValue === null) {
      missing.push(path);
      continue;
    }

    if (
      typeof referenceValue === 'object' &&
      referenceValue !== null &&
      typeof candidateValue === 'object' &&
      candidateValue !== null
    ) {
      missing.push(
        ...collectMissing(
          candidateValue as Record<string, unknown>,
          referenceValue as Record<string, unknown>,
          path,
        ),
      );
    }
  }

  return missing;
}

function mergeDeep<T extends Record<string, unknown>>(base: T, overrides: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;

    const baseValue = result[key];
    result[key] =
      typeof value === 'object' && value !== null && typeof baseValue === 'object' && baseValue !== null
        ? mergeDeep(baseValue as Record<string, unknown>, value as Record<string, unknown>)
        : value;
  }

  return result as T;
}

/** 取某语言的文案字典：缺失的键逐层回落到默认语言，并给出一次警告。 */
export function useUi(locale: Locale): UiDict {
  const dict = UI[locale] ?? UI[DEFAULT_LOCALE];
  if (dict === UI[DEFAULT_LOCALE]) return UI[DEFAULT_LOCALE];

  const missing = collectMissing(dict as unknown as Record<string, unknown>, UI[DEFAULT_LOCALE] as unknown as Record<string, unknown>);
  warnMissing(locale, missing);

  return mergeDeep(
    UI[DEFAULT_LOCALE] as unknown as Record<string, unknown>,
    dict as unknown as Record<string, unknown>,
  ) as unknown as UiDict;
}

export type { Locale };
