# Tasks

## 1. 语言配置与文案字典

- [x] 1.1 新建 `src/i18n/config.ts`：`LOCALES`（`en` / `zh-cn` / `ja`）、`DEFAULT_LOCALE`、`LOCALE_LABELS`、`HTML_LANG`，以及 `localizedPath(locale, path)`、`localeFromPath(pathname)`、`switchLocalePath(pathname, targetLocale)` 三个助手；用 `bun -e "import {localizedPath, switchLocalePath} from './src/i18n/config.ts'; console.log(localizedPath('ja','/essays'), switchLocalePath('/zh-cn/essays/aigc-notice','en'))"` 验证输出为 `/ja/essays` 与 `/en/essays/aigc-notice`
- [x] 1.2 新建 `src/i18n/ui.ts`：`UiDict` 接口 + `UI: Record<Locale, UiDict>`，把 `src/consts.ts` 与 `NavPill.astro`、`SiteFooter.astro`、`essays/index.astro`、`ArticleLayout.astro` 中的中文外壳文案迁为 `zh-cn` 条目，`useUi(locale)` 在缺失键时回落 `DEFAULT_LOCALE` 并 `console.warn`；验证 `bun run build` 成功，且 `dist/zh-cn/` 页面可见文案与改动前逐字一致（对照改动前的构建产物或页面截图）
- [ ] 1.3 为 `en`、`ja` 补全 `UiDict` 全部键的译文（导航三项、页面标题、归档标题、空状态、页脚 `aria-label`、AIGC 披露文案、语言胶囊无障碍名称）；验证 `bun run build` 无 TypeScript 接口缺键报错，且三语页面各自显示对应语言文案

## 2. 内容模型三语化

- [ ] 2.1 把现有随笔迁入 `src/content/essays/zh-cn/`，语言由所在目录决定（frontmatter 不声明 `lang`），非语言目录下的文件由 `parseEssayId` 报结构错误；验证 `bun run build` 成功，`/zh-cn/essays` 仍列出迁移前相同的文章与日期
- [ ] 2.2 改造 `src/lib/essays.ts`：新增 `parseEssayId`、按语言参数化的 `getPublishedEssays(locale)`、`getEssayRegistry()`（slug → 语言版本）、`getEssayAlternates(slug)`，并在注册表构建时校验同一 slug 的 `date`/`draft`/`aigc` 三语一致（不一致抛错）；用 `bun -e` 断言 `getEssayRegistry()` 中 `aigc-notice` 只含 `zh-cn` 键、且 `getEssayAlternates('aigc-notice')` 只返回存在语言加 `x-default`
- [ ] 2.3 宣言改为 `src/manifesto/<lang>/what-is-p-acc.md`，`src/pages/[lang]/what-is-p-acc.astro` 用 `import.meta.glob('../manifesto/*/what-is-p-acc.md', { eager: true })` 按当前语言取 `Content`/`frontmatter`；验证三语构建产物均含完整正文且无 `undefined` 标题
- [ ] 2.4 补齐 `aigc-notice` 与 `what-is-p-acc` 的 `en`、`ja` 译文（保持与原稿同一 slug、同一 `date`、同一 `aigc` 标记）；验证 `bun run scripts/check-i18n.mjs` 输出无缺译清单
- [ ] 2.5 编写 `docs/content-translations.md`：说明新增一篇随笔/一篇译文的目录结构与必要字段、`check:i18n` 的用法；验证按文档步骤新增一个占位译文后 `bun run check:i18n` 能识别并报告它

## 3. 路由与布局

- [ ] 3.1 将页面迁移到 `src/pages/[lang]/`：`index.astro`、`what-is-p-acc.astro`、`essays/index.astro`、`essays/[...slug].astro`，每个 `getStaticPaths` 枚举 `LOCALES`（文章页按语言返回该语言文章）；验证 `bun run build` 后 `dist/` 含 `/en/`、`/zh-cn/`、`/ja/` 三套页面，且不存在 `dist/essays/`、`dist/what-is-p-acc/` 等无前缀路径
- [ ] 3.2 `BaseLayout.astro` 增加必填 `locale` 与可选 `alternates`，输出 `<html lang>`（`en`/`zh-CN`/`ja`）、三语 `hreflang` alternate 与指向 `/en/` 的 `x-default`，并为 `ja` 补日文字体回退；`ArticleLayout.astro` 透传并本地化 AIGC 文案与日期；验证抽查 `dist/zh-cn/index.html` 与 `dist/ja/essays/aigc-notice/index.html` 的 `lang` 与 `link[rel=alternate]` 数量、`href` 与语言一致
- [ ] 3.3 `NavPill.astro` 接收 `locale`，用字典渲染三个条目、链接保持当前语言前缀，当前项判定先剥离语言前缀；验证三语页面导航文字随语言变化、`aria-current` 只落在当前条目上，条目数仍为三项

## 4. 语言胶囊

- [ ] 4.1 新建 `src/components/LanguagePill.astro`：`>560px` 常显三条目，`≤560px` 收起为 `<details><summary>` 显示当前语言短码（`EN`/`中`/`日`）并在展开后列出三项，短码带 `aria-label` 与视觉隐藏全称，样式复用 `--glass`/`--line`/`--accent-current` 令牌；验证在 1440px 与 320px 视口截图下胶囊固定右上角、与主导航胶囊无重叠，`summary` 可 Tab 聚焦并显示 2px 焦点描边
- [ ] 4.2 在各页面接入 `LanguagePill`：传入 `locale` 与 `paths: Record<Locale, string>`（文章页用 `getEssayAlternates`，缺译目标回落该语言首页）；验证从 `/zh-cn/essays/aigc-notice` 切到 English 落在 `/en/essays/aigc-notice`，而在仅中文存在的文章上切 日本語 落在 `/ja/`
- [ ] 4.3 语言选择持久化：条目上挂 `is:inline` 脚本把 `locale` 写入 `localStorage`（`try/catch` 包裹），并在禁用本地存储时静默失败；验证切换后 `localStorage.getItem('locale')` 为对应值，且隐私模式下切换仍能正常跳转、控制台无未捕获错误

## 5. 根路径语言入口

- [ ] 5.1 重写 `src/pages/index.astro` 为入口页：内联脚本按 `localStorage` → `navigator.languages` → `en` 决定目标并 `location.replace`，body 内渲染三个可见语言链接，`<head>` 内 `<noscript>` 提供 `<meta http-equiv="refresh" content="0;url=/en/">`；验证语言设为 `ja-JP` 的浏览器首次访问 `/` 落在 `/ja/`，`zh-CN` 落在 `/zh-cn/`，`de-DE` 落在 `/en/`，多语言偏好 `['de','ja','en']` 落在 `/ja/`
- [ ] 5.2 验证偏好优先与脚本禁用路径：手动切到 `ja` 后访问 `/` 落在 `/ja/`；禁用 JavaScript 访问 `/` 以静态方式进入 `/en/` 且页面上三个语言链接可点击

## 6. 三语完整性检查

- [ ] 6.1 新增 `scripts/check-i18n.mjs` 并在 `package.json` 增加 `"check:i18n"`：扫描 `src/content/essays/*/` 与 `src/manifesto/*/`，输出缺译清单（退出码 0），对同一语言下重复 slug 视为结构错误并退出码 1；验证临时添加一篇只有 `en` 的随笔后脚本列出缺失的 `zh-cn`/`ja`、删除重复文件后恢复通过
- [ ] 6.2 集成检查：`bun run build` 无报错；320px / 375px / 1440px 三档视口下主导航与语言胶囊不重叠、正文不被遮挡；禁用 JavaScript 时三语页面的导航、归档、正文与语言切换均可用；按 3.2 抽查结果确认每页 `hreflang` 只声明真实存在的译文
- [ ] 6.3 回归检查旧行为：首页 slogan、随笔按年分组与日期格式 `YYYY.MM.DD`、AIGC 文末标记、页脚版权与站外链接、键盘焦点样式在三语下均保持既有视觉规格（对比改动前的截图）
