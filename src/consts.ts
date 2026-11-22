/** 站点级可编辑内容：只放文案与链接，不放布局。 */

export const SITE_NAME = 'Tony Zhang';

/** 首页唯一的主视觉文字。修改此常量即可换 slogan，无需改动页面结构。 */
export const SLOGAN = 'For our foundational loves.';

/** AIGC 披露说明文档的固定链接，站内标记与正文引用都指向它。 */
export const AIGC_NOTICE_PATH = '/essays/aigc-notice';

/** 说明文档的标题，同时用于文末标记的书名号内容。 */
export const AIGC_NOTICE_TITLE = '含AIGC文稿统一解释说明';

/** 文章最下方 AIGC 标记的完整文案（前导星号由模板渲染）。 */
export const AIGC_NOTICE_LABEL = `本文适用于《${AIGC_NOTICE_TITLE}》`;

export const FOOTER_LINKS = [
  { label: 'GitHub', href: 'https://github.com/zhangtony239' },
  { label: 'Email', href: 'mailto:zhangtony239@gmail.com' },
  { label: 'RSS', href: '/rss.xml' },
];
