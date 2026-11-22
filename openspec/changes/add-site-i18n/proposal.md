# Proposal

## Why

站点目前是单语中文：导航、页面标题、首页 slogan、AIGC 说明与随笔正文全部硬编码中文，无任何语言切换入口。面向英文与日文读者时，站点既无法切换界面语言，也无法浏览对应语言的正文内容；`/` 根路径对非中文浏览器用户也没有任何适配。

## What Changes

- **BREAKING**：站点所有页面由根路径 `/`、`/what-is-p-acc`、`/essays`、`/essays/<slug>` 迁移为带语言前缀的路径 `/en/`、`/zh-cn/`、`/ja/` 及其子路径；旧的单语路径不再提供。
- `/` 根路径改为语言入口页：按浏览器语言（Accept-Language / `navigator.languages`）跳转到最匹配的受支持语言，无法匹配时 fallback 到 `/en/`；在禁用 JavaScript 时仍以静态方式落到 `/en/`，并提供三语手选链接。
- 新增右上角语言胶囊（language pill）：固定定位在视口右上角，与左侧居中的主导航胶囊互不干扰，包含 English / 简体中文 / 日本語 三个条目，标示当前语言，点击跳转到**同一页面**在目标语言下的对应路径（无对应译文时回落到该语言首页）。
- 用户手动选择的语言被持久化；再次访问 `/` 时优先使用已存偏好，其次浏览器语言，最后 `en`。
- 抽出 UI 文案字典：导航名、页面标题、空状态、页脚、AIGC 披露文案等全部站点外壳文案按 `en` / `zh-cn` / `ja` 三份字典提供，页面不再内联硬编码中文。
- 随笔与宣言正文按语言提供翻译版本：同一篇文章在三语下共享同一身份与同一 slug，归档列表按当前语言展示该语言的标题、日期格式化与"暂无文章"文案。
- 每个页面输出 `<html lang>`、指向三语版本及 `x-default` 的 `hreflang` alternate 链接，`x-default` 指向 `/en/`。

## Capabilities

### New Capabilities

- `site-i18n`: 语言集合与路径方案、根路径语言跳转、右上角语言胶囊切换、hreflang 与 `lang` 声明、UI 文案字典。
- `essay-translations`: 随笔与宣言正文的三语翻译模型——跨语言共享文章身份、按语言归档、缺译时的行为。

### Modified Capabilities

（无。现有能力只存在于尚未归档的 `add-personal-site-v1` 变更的 delta 中，`openspec/specs/` 目前为空；本变更与其重叠之处见 Impact。）

## Impact

- **路由与构建**：新增 `src/pages/[lang]/` 下的首页、`what-is-p-acc`、`essays/index`、`essays/[...slug]` 动态路由；根 `src/pages/index.astro` 重写为语言入口页。站点保持纯静态输出、零 integration、GitHub Pages 根路径发布。
- **内容模型**：`src/content.config.ts` 的 essays schema 增加语言与翻译关联字段；`src/lib/essays.ts` 的查询、排序、分组、日期格式化按语言参数化。
- **待命中的相邻变更**：`add-personal-site-v1`（`site-shell` 要求导航恰为三项中文条目、`essay-archive` / `essay-page` 定义归档与正文行为）与 `rename-p-acc-route`（`p/acc` 路由改名）尚未归档。本变更沿用其视觉与结构约束，在导航胶囊之外独立新增语言胶囊（不改变主导航条目数量）；若 `rename-p-acc-route` 先落地，本变更的语言前缀路径需跟随其最终路由名。
- **共享组件**：`NavPill.astro`、`SiteFooter.astro`、`BaseLayout.astro`、`ArticleLayout.astro` 需接受语言上下文并消费文案字典；`src/consts.ts` 中的中文常量改为字典条目。
- **内容资产**：`aigc-notice` 随笔与 `what-is-p-acc` 宣言需补齐 `en`、`ja` 译文，否则三语站会出现缺页。
- **已知取舍**：根路径跳转必须依赖少量客户端脚本（静态托管无服务端重写），因此该入口页在脚本禁用时以 `<meta http-equiv="refresh">` 与可见的三语链接兜底；其余页面仍保持零 JavaScript 可读。
