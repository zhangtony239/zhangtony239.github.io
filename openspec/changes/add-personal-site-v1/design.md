# Design

## Context

仓库当前除 `demo.html` 与 `openspec/` 外为空，属于从零搭建。

- `demo.html` 是单文件零依赖原型，已验证视觉语言：纯白底、冷调科技蓝色带、居中毛玻璃胶囊导航、极简首屏、毛玻璃 footer。它是本设计的**视觉基准**，不是要上线的实现。
- 目标站点是用户 Pages：`https://zhangtony239.github.io/`，内容位于根路径，`base` 必须为 `/`。
- 本地构建与包管理器为 bun。
- spec 要求关闭客户端 JavaScript 后导航、首页、归档与正文仍完整可用。

需要解决的核心矛盾：三个页面 + 一个正文模板，要长期可写（Markdown）、视觉高度统一（令牌化）、且为零依赖的静态产物。

## Goals / Non-Goals

**Goals:**

- 用 Astro 静态输出承载 `/`、`/essays`、`/essays/<slug>`、`/p/acc` 四个路由与一个共用正文模板。
- 设计令牌集中在单一样式源，页面样式只消费变量。
- 新增随笔只需新增一个 Markdown 文件，不改任何代码。
- 构建与发布全自动，推 `main` 即上线。

**Non-Goals:**

- 不实现弥散光背景（canvas / WebGL）、RSS、标签、搜索、分页、深色模式、评论、图片灯箱。
- 不做视觉回归截图测试，也不引入 E2E 测试框架；验证以「构建通过 + 人工过一遍 demo 对照」为准。
- 不做多作者、多语言、草稿预览环境。

## Decisions

### D1：Astro 静态输出 + bun，不引入任何 UI 框架集成

`astro.config.mjs` 使用默认静态输出，不装 React/Vue/Svelte 集成，组件只用 `.astro`。

理由：本方案只需要内容集合、Markdown 渲染与零 JS 输出，这三件事 Astro 原生就给全了。备选方案（手写 HTML/CSS：放弃集合与 Markdown 管道，写作成本会转移到我身上；Next.js SSG：为三个页面引入 React 运行时与更多配置面）。

### D2：目录结构

```
.
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .github/workflows/deploy.yml
├── demo.html                  # 视觉基准，不参与构建
├── openspec/
└── src/
    ├── content.config.ts      # essays 集合 schema
    ├── content/essays/*.md    # 随笔
    ├── manifesto/p-acc.md     # 宣言，独立于集合
    ├── lib/essays.ts          # 发布过滤 / 排序 / 年份分组
    ├── styles/tokens.css
    ├── styles/global.css
    ├── layouts/BaseLayout.astro
    ├── layouts/ArticleLayout.astro
    ├── components/NavPill.astro
    ├── components/SiteFooter.astro
    └── pages/
        ├── index.astro
        ├── essays/index.astro
        ├── essays/[...slug].astro
        └── p/acc.astro
```

### D3：随笔进内容集合，宣言不进集合

随笔放在 `src/content/essays/`，用 glob 集合，schema 为 `title: string`、`date: date`、`draft: boolean (默认 false)`。

`p/acc` 放在 `src/manifesto/p-acc.md`，由 `src/pages/p/acc.astro` 直接 `import` Markdown 的 `Content` 与 `frontmatter`，套同一个 `ArticleLayout`。

理由有两层：
1. URL 必须固定为 `/p/acc`。集合条目的 id 由文件路径推导，意味着「重命名文件 = 改 URL」，这与固定链接的要求直接冲突。
2. 若把宣言放进集合并加 `kind: 'fixed'` 字段，那么「排除宣言」这件事就得在每个列表/聚合查询里重复一次，早晚漏掉一处。

备选方案是在 `src/pages/` 放一个 `.md` 页面并用 `layout` frontmatter 指定布局，路由同样固定；放弃它是因为 Markdown 页面 + `layout` 属于较旧的机制，而显式的 `.astro` 包装层对「以后要加一点页面级逻辑」更稳。

### D4：全站只有一个正文模板

`ArticleLayout.astro` 接收 `title`、`date` 与默认 slot（渲染后的正文 HTML），固定单列阅读栏 `max-width: 62ch`，正文用 `#55637A`、`line-height: 1.85`。随笔页与 `/p/acc` 都走它，因此「两者版式一致」是结构性保证而非纪律要求。

### D5：令牌与样式的组织

- `tokens.css`：`:root` 里的全部设计令牌（颜色、字体栈、间距、`--pad-x`、`--nav-h`）。
- `global.css`：reset、`body` 基础排版、`font-optical-sizing`、`::focus-visible`。
- 组件样式写在各自的 `.astro` scoped `<style>` 内，只引用变量，不写新色值。

理由：三个页面 + 两个布局 + 两个组件的规模，CSS-in-JS 或 utility 框架都是负担；scoped 样式同时给出隔离与零构建成本。

### D6：字体用 Google Sans Flex，通过 Google Fonts `<link>` 引入

`BaseLayout` 的 `<head>` 中放 `preconnect`（fonts.googleapis.com / fonts.gstatic.com）与单条 `css2` 样式表链接，`display=swap`；`--sans` 首位为 `"Google Sans Flex"`，其后是系统回退栈（`Inter` → `-apple-system` → `Segoe UI` → `PingFang SC` → `Microsoft YaHei`）；`body` 上设 `font-optical-sizing: auto`。

**关键的 CJK 字重问题**：Microsoft YaHei 只有 400 与 700。对中文文字声明 `font-weight: 200` 会被浏览器就近取整为 400，不会真的变细，也不会变成 700。因此 slogan 的字重设计为「优先 200，上限 400」，并在 Windows 上接受呈现为 400 的结果——这是不引入约 1MB 中文 webfont 的代价，已写入 spec 的场景。

备选方案是自托管 woff2 子集：能消除第三方依赖并获得真正的中文细字重，但需要构建期下载、子集化与字体许可核对，v1 不值得。

### D7：导航当前项由路径推导

`NavPill.astro` 读 `Astro.url.pathname` 判断当前条目：`/` → 首页；`/p/acc` → p/acc；`/essays` 及其子路径 → 随笔。命中项加 `aria-current="page"` 与淡蓝填充，非命中项只有悬停底色。

理由：三个条目、层级只有一层，路径前缀匹配足够；不为此引入路由元数据机制。

### D8：过滤、排序、分组集中在一个模块

`src/lib/essays.ts` 导出 `getPublishedEssays()`（排除 `draft`、按 `date` 倒序）与 `groupByYear()`（年份倒序、同年内保持倒序）。归档页与 `getStaticPaths` 共用同一实现。

理由：草稿排除必须同时作用于「列表显示」与「URL 可达」两处，两处各写一遍是最容易出的漏。

### D9：发布走 GitHub Actions

`.github/workflows/deploy.yml`：`oven-sh/setup-bun` → `bun install --frozen-lockfile` → `bun run build` → `actions/upload-pages-artifact`（`dist/`）→ `actions/deploy-pages`；`permissions` 只开 `contents: read`、`pages: write`、`id-token: write`。

### D10：demo.html 不进构建，但要与新 spec 对齐

`demo.html` 留在仓库根目录——既不在 `src/pages/`（不会被路由），也不在 `public/`（不会被复制进 `dist/`）。它作为视觉对照保留，但其首屏仍是「姓名 + 定位语」，需要按新 spec 改成「一句 slogan」，否则参考稿会误导实现。

## Risks / Trade-offs

- [中文无双极细字重，slogan 在 Windows 呈 400 而非 200] → 字重上限固定 400 并靠字号、字距与留白维持气质；不引入中文 webfont。
- [Google Fonts 在部分网络环境不可达] → `display=swap` + 完整系统回退栈，失败时版式不塌；正文本来就用系统字体渲染占多数，风险面只在拉丁字形。
- [`ch` 单位对中文不等价] → `62ch` 基于西文字符宽度，中文每行实际字数更少。以 `62ch` 为目标并用 `max-width` 兜底，若实际观感过窄再调，属实现期微调。
- [毛玻璃在纯白底上几乎无效] → 胶囊背后没有可模糊的内容，视觉上主要靠 1px 边框与极轻投影支撑。保留 `backdrop-filter` 是为了后续弥散背景接入后自动生效，而不是当前效果的主要来源。
- [内容集合 id 与 URL 的耦合] → 已通过让宣言脱离集合（D3）规避；随笔 URL 仍由文件名决定，这是可接受的既有约定，已在 tasks 中要求确定性 slug 处理。
- [无自动化视觉验证] → 视觉一致性靠「令牌集中 + scoped 样式 + demo 对照」保证；若后续视觉漂移成为问题，再考虑 Playwright 截图对比。

## Migration Plan

这是空仓库的首次搭建，没有需要迁移的既有数据或路由。

- 上线前置条件：仓库 Settings → Pages → Source 选择 GitHub Actions。
- 回滚方式：删除本变更引入的文件（`src/`、`astro.config.mjs`、`package.json`、`tsconfig.json`、`.github/workflows/deploy.yml`）即可回到当前状态；`demo.html` 与 `openspec/` 不受影响。
- 内容迁移：现有 Markdown 随笔按 schema 补 `title` / `date`，放入 `src/content/essays/`。

## Open Questions

- slogan 的具体文案（属内容决定，不影响结构）。
- footer 最终保留哪几个站外链接（当前按 GitHub / 邮箱 / RSS 占位）。
- 随笔正文是否需要代码高亮；若需要，再补一个与令牌同色系的 Shiki 主题，不改变现有结构。
