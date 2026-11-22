# Design

## Context

动机见 [`proposal.md`](proposal.md)。影响本设计的现状约束：

- Astro 7 纯静态站点，`astro.config.mjs` 只有一个 `site` 与 `base: '/'`，无 integration、无 UI 框架、无客户端脚本现状（除零散内联样式）。
- 现有页面：`src/pages/index.astro`（slogan 主视觉）、`src/pages/what-is-p-acc.astro`（直接 `import` `src/manifesto/what-is-p-acc.md` 的 `Content`/`frontmatter`）、`src/pages/essays/index.astro`（按年分组归档）、`src/pages/essays/[...slug].astro`（`getStaticPaths` 遍历 `getPublishedEssays()`）。
- 内容与文案现状：essays 用 `glob({ base: './src/content/essays' })` 加载，`id` 即文件名；站点外壳文案散落在 `src/consts.ts`、`NavPill.astro`（`首页`/`p/acc`/`随笔`）、`SiteFooter.astro`（`aria-label="站外链接"`）、`essays/index.astro`（`随笔`、`还没有随笔。`）、`ArticleLayout.astro`（AIGC 披露文案）。
- 视觉约束：主导航是 `position: fixed; top: 18px`、水平居中、`border-radius: 999px` 的毛玻璃胶囊，令牌含 `--nav-h: 64px`、`--glass`、`--pad-x`、`--mono`；全站要求键盘焦点 2px 蓝描边、除入口页外不依赖客户端脚本。

## Goals / Non-Goals

**Goals:**

- 三语（`en` / `zh-cn` / `ja`）路径镜像、文案字典、内容翻译全部落到现有静态构建里，不引入服务端或运行时框架。
- 语言胶囊与主导航胶囊在 320px 视口下仍互不重叠，且不改变主导航条目集合与视觉语言。
- 语言偏好持久化、`hreflang` 与 `lang` 正确，缺译时不混排语言。

**Non-Goals:**

- 不做 URL 中的本地化 slug（三语共用同一 slug），不做按语言区分的站点域名或子域。
- 不做运行时自动翻译、不做语言检测的 Accept-Language 服务端重写（静态托管无服务端）。
- 不改动已有视觉规格（字体、色板、行宽、归档行样式）与主导航的三条目结构。
- 不为入口页之外的页面引入客户端脚本（语言切换是普通链接）。

## Decisions

### D1. 手写语言配置与 `[lang]` 动态路由，而非 Astro 内置 i18n routing

新增 `src/i18n/config.ts`：

- `LOCALES = ['en', 'zh-cn', 'ja'] as const`，`DEFAULT_LOCALE = 'en'`，`LOCALE_LABELS = { en: 'English', 'zh-cn': '简体中文', ja: '日本語' }`，`HTML_LANG = { en: 'en', 'zh-cn': 'zh-CN', ja: 'ja' }`。
- 路径助手：`localizedPath(locale, path)`（拼接 `/` + locale + path，处理首页尾斜杠）、`localeFromPath(pathname)`、`switchLocalePath(pathname, targetLocale)`（替换首段）。

页面改为 `src/pages/[lang]/index.astro`、`[lang]/what-is-p-acc.astro`、`[lang]/essays/index.astro`、`[lang]/essays/[...slug].astro`，每个 `getStaticPaths` 返回 `LOCALES` 组合。

**为什么不用 Astro `i18n` 配置：** Astro 内置 i18n routing 在静态模式下只提供 `getRelativeLocaleUrl` 等助手，不会自动为 `locales` 生成带前缀页面；同时它的 `defaultLocale` 重定向语义与我们要的"按浏览器语言跳转"不一致，接进来会形成两套语言解析逻辑。手写 ~40 行配置换来完全可控的路由与可复用助手。

### D2. 内容按语言分目录，slug 即文章身份

essays 文件布局改为 `src/content/essays/<lang>/<slug>.md`（loader 仍为 `glob({ pattern: '**/*.md', base: './src/content/essays' })`，`id` 变成 `zh-cn/aigc-notice` 形态）。`src/lib/essays.ts` 拆出：

- `parseEssayId(id)` → `{ lang, slug }`；
- `getPublishedEssays(locale)` → 该语言已发布文章，日期倒序、同日期以 `title.localeCompare` 按语言排序；
- `getEssayRegistry()` → `Map<slug, Partial<Record<Locale, Essay>>>`，供语言切换与 `hreflang` 使用；
- `formatDate(date, locale)` 保持 `YYYY.MM.DD`（三语同一视觉规格）；
- `getEssayAlternates(slug)` → 仅含真实存在的译文 + `x-default` 指向英文版（英文缺失时 `x-default` 指向第一个可用语言，并在校验脚本中报告缺英文）。

语言完全由目录决定，不在 frontmatter 里重复声明 `lang` 字段——路径已经区分了语言，多写一份只会产生两边不一致的可能。`date`、`draft`、`aigc` 是文章级属性，注册表在构建时校验同一 slug 的三语版本三者一致，不一致则抛错。

**备选：** 扁平目录 + 文件名后缀（`aigc-notice.ja.md`）——解析更脆、目录不可视化语言覆盖；frontmatter `translationOf` 字段——多一层冗余、容易与目录不同步。目录法使"某语言有哪些文章"一眼可见，也让缺译检查只是目录扫描。

### D3. 宣言按语言分文件，`import.meta.glob` eager 选取

`src/manifesto/<lang>/what-is-p-acc.md`，页面用 `import.meta.glob('../manifesto/*/what-is-p-acc.md', { eager: true })` 建 `lang → module` 映射，取当前语言的 `Content`/`frontmatter`。这样新增语言无需改页面代码，且保留现有"直接 import markdown"的渲染方式（不引入 collections）。

### D4. 类型化 UI 字典 + 默认语言逐键回落

`src/i18n/ui.ts` 定义 `interface UiDict`（导航三项、页面标题、归档标题、空状态、页脚 `aria-label`、AIGC 披露文案、语言胶囊无障碍名称等），`const UI: Record<Locale, UiDict>`。`useUi(locale)` 返回代理：先用当前语言值，缺失时回落 `DEFAULT_LOCALE` 的同键值并 `console.warn`。页面与组件只通过 key 取文案，`src/consts.ts` 中的中文常量迁移进字典（`SITE_NAME`、`FOOTER_LINKS` 这类语言无关项保留在 `consts.ts`）。

**备选：** 每语言一个 JSON 文件——无编译期键完整性校验，缺键只能运行时暴露；接口 + `Record<Locale, UiDict>` 让 `astro check` 直接报出漏译的键。

### D5. 根入口页用内联脚本跳转 + `noscript` 兜底

`src/pages/index.astro` 变为纯入口页：内联脚本读 `localStorage['locale']`（`try/catch` 包裹），否则按 `navigator.languages` 顺序取第一个受支持语言（`zh*`→`zh-cn`、`ja*`→`ja`、`en*`→`en`），再否则 `en`，最后 `location.replace(localizedPath(target, '/'))`。页面 body 内始终渲染三个真实语言链接（脚本失败时直接可点）；`<head>` 内 `<noscript>` 放 `<meta http-equiv="refresh" content="0;url=/en/">`，满足"脚本禁用时静态落到 `/en/`"。

**权衡：** `noscript` 中的 `meta refresh` 在 HTML 校验器里会被标记为非规范用法，但它是静态托管下唯一不需要脚本的重定向手段；页面除此之外不含内容，因此校验告警可接受。不做"`/` 直接渲染英文首页"的方案，因为那会让同一英文内容出现两个 URL、与"内容页面只经语言前缀提供"的规范冲突。

### D6. 语言胶囊：独立组件、视觉沿用主导航令牌

新增 `src/components/LanguagePill.astro`，接收 `locale` 与 `paths: Record<Locale, string>`（由页面通过助手算好传入，组件不做路由推断）：

- 桌面（>560px）：`position: fixed; top: 18px; right: max(16px, calc(var(--pad-x) / 2)); z-index: 100`，复用 `--glass` / `--line` / `--glass-hi` 与 `border-radius: 999px`，条目样式与 `NavPill` 一致（13.5px、`--ink-2`、悬停 `--hover-fill`、当前项 `--accent-current` + `aria-current`），但高度对齐 `--nav-h` 内的胶囊内边距，使两枚胶囊顶部与高度视觉齐平。
- 窄屏（≤560px）：胶囊收起为显示当前语言短码（`EN` / `中` / `日`）的单个 `<details><summary>` 入口，展开为下方浮层列出三项；纯 CSS + 原生 `details`，无脚本。短码始终带 `aria-label` 与 `<span class="sr-only">` 全称，屏幕阅读器读到的是 `English` / `简体中文` / `日本語`。
- 每个条目是普通 `<a>`，目标由 `switchLocalePath` 或 `getEssayAlternates` 决定；点击时由一段 `is:inline` 的小脚本把 `locale` 写入 `localStorage`（写入包在 `try/catch` 中，失败静默），然后正常导航——无脚本时链接仍然可用，只是偏好不持久。
- 键盘可达性沿用全站焦点样式；`details` 的 `summary` 显式加 `:focus-visible` 描边。

**备选：** 语言胶囊与主导航合并成一枚胶囊——违反"独立于主导航"、也破坏居中轴对称的视觉；三条目常在窄屏下不收起——320px 计算下来与居中导航重叠约 20px，无法满足不遮挡。

### D7. `BaseLayout` / `ArticleLayout` 接收语言上下文

`BaseLayout` 新增必填 `locale` 与可选 `alternates`，负责 `<html lang>`、`<link rel="alternate" hreflang>`、`x-default`；`ArticleLayout` 透传并本地化 AIGC 披露文案与日期。`NavPill` 接收 `locale` 并用字典渲染三个条目、链接保持当前语言前缀，当前项判定先剥掉语言前缀。

**字体不按语言分栈：** Google Sans Flex 本来就只提供西文字形，中日文一直由 `--sans` 里已经排好的系统字体回落，日文页面的西文仍应使用同一款西文字体。因此不引入 `--sans-ja` 或按语言切换的字体栈，三语共用 `--sans`。

### D8. 三语完整性用独立 Node 脚本检查

新增 `scripts/check-i18n.mjs`（读目录、输出缺译清单、缺译时退出码 0 但打印报告，结构性错误如重复 slug 退出码 1），在 `package.json` 增加 `"check:i18n": "node scripts/check-i18n.mjs"`。**不**做成 Astro integration——`astro.config.mjs` 保持零 integration，检查作为独立命令在发布前手动或 CI 步骤运行。

## Risks / Trade-offs

- [入口页依赖脚本，首屏可能闪现空白] → 入口页只含跳转脚本与三条链接，不做视觉内容；`location.replace` 不产生历史记录条目，返回键不会卡在入口页。
- [三语内容维护成本高，容易漏译] → D8 的 `check:i18n` 报告缺口；归档只展示已翻译文章，缺译不会产出半成品页面。
- [GitHub Pages 对不存在路径返回 404，缺译文章切语言会先跳首页] → 语言胶囊对缺译文章直接给首页链接，不产生 404 往返。
- [`localStorage` 在隐私模式/配额满时抛错] → 所有读写包 `try/catch`，失败时语言切换与跳转仍正常工作，仅偏好不记忆。
- [与未归档的 `add-personal-site-v1` 规范存在表面冲突：其 `site-shell` 要求导航恰为三项中文条目、`essay-archive` 定义全站唯一归档] → 主导航仍为三项（文字随语言变化，数量与顺序不变）；归档按语言分区是对该能力的扩充而非替换，归档时应在主 spec 中合并为"每语言一份归档"。`rename-p-acc-route` 若先落地，D1 的路径助手与 D3 的宣言目录需跟随其最终路由名（`/what-is-p-acc` → 新名）。
- [日文排版：汉字字形可能落到中文字体（如 PingFang SC / Microsoft YaHei）而非日文字体] → 已在基线存在的字体回落行为，本变更不调整字体栈；仅在回归检查中核对日文页面的西文仍为 Google Sans Flex、正文行高与中文页一致。
- [`hreflang` 声明不存在的译文会误导搜索引擎] → `getEssayAlternates` 只输出真实存在的语言，`x-default` 指向英文版。

## Migration Plan

1. 先落 D1 + D2 + D3 的结构改造（旧单语路径在改动合并前仍发布，合并后旧路径消失——本次为 **BREAKING** 路径变更，无重定向映射，接受旧链接失效；如需保留可在入口页外增补一次性重定向脚本，本设计不做）。
2. 迁移文案到 D4 字典，把现有中文常量与内联文案变成 `zh-cn` 条目，确保中文视觉与文案零变化（回归基线）。
3. 补齐 `en`、`ja` 的正文与字典译文（含 `aigc-notice` 与 `what-is-p-acc`），跑 `check:i18n` 至无缺口。
4. 上线语言胶囊（D6）与入口页（D5），最后核对 `hreflang`、`lang`、窄屏布局与禁用脚本浏览。
5. 回滚策略：本次改动集中在 `src/pages`、`src/i18n`、`src/lib`、`src/content`、`src/manifesto`，回滚为整体 revert 单次合并提交即可恢复单语站点。

## Open Questions

- 英文/日文是否需要各自的 RSS/站点地图与 `x-default` 之外的 `alternate` 变体（当前站点无 RSS 实际产物，`FOOTER_LINKS` 指的 `/rss.xml` 本就不存在）——可在后续独立变更中处理，不影响本变更的 spec 与任务拆分。
