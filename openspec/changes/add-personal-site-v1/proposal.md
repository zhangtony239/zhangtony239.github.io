# Proposal

## Why

`zhangtony239.github.io` 目前只有 `.git`，没有任何站点代码。作者需要一个能长期承载「随笔」与「p/acc 价值观宣言」的个人主页，视觉上要求冷静、精确、大留白，而不是通用博客模板的堆砌感；同时它必须是零服务端、可直接发布到 GitHub Pages 的静态站。

现有 `demo.html` 已经把视觉语言验证过一轮（纯白底、冷调蓝、毛玻璃胶囊导航、极简首屏），本次变更把这个视觉基准固化为可长期维护的工程结构。

## What Changes

- 引入 Astro 静态站骨架，用 bun 作为包管理器，构建产物为纯静态 HTML/CSS，默认不输出客户端 JS。
- 固化全站设计令牌：纯白底 `#FFFFFF`、正文冷黑 `#121A26`、冷调科技蓝色带（`--accent: #ADD0F5` / `--accent-deep: #2F6FE0`）、1px `rgba(18,26,38,0.08)` 细线。
- 西文统一使用 Google Sans Flex 可变字体（`wght 1–1000`、`opsz 1–144`），中文回落系统黑体，并开启 `font-optical-sizing`。
- 导航改为**居中毛玻璃胶囊**：无整条顶栏、无 `border-bottom`，三个条目为 `首页 / p/acc / 随笔`，当前项以淡蓝胶囊标示。
- 首页只保留「一条细线 + 一句 slogan」，不出现姓名，不放置社交图标墙、不放置文章列表、不放置滚动提示以外的装饰。
- 新增 `/essays` 极简时间流：`日期 + 标题` 两列，按年份分组倒序，无摘要、无标签分类、无分页、无封面图。
- 新增统一的随笔正文模板（单栏约 62ch 阅读宽度）；`/p/acc` 复用同一模板，作为固定链接的价值观宣言长文，不出现在 `/essays` 列表中。
- 新增毛玻璃 footer：版权年份 + 少量站外链接。
- 新增 GitHub Actions 发布流程：bun 安装与构建，产物部署到 GitHub Pages。

**明确不在本次范围**：弥散光背景（canvas / WebGL）、RSS、标签与搜索、分页、深色模式、评论、图片灯箱、多语言。`demo.html` 中的弥散背景 shader 实现保留不动，作为后续独立变更的起点。

## Capabilities

### New Capabilities

- `site-shell`: 全站外壳——设计令牌、字体加载策略、居中毛玻璃胶囊导航、页脚，以及静态构建与发布约束。
- `home-page`: 首页的内容结构与极简呈现规则。
- `essay-archive`: `/essays` 随笔归档的呈现形式、分组与排序规则。
- `essay-page`: 随笔正文页模板，含 `/p/acc` 固定链接宣言页的复用与列表可见性规则。

### Modified Capabilities

无——仓库当前没有任何已存在的 spec。

## Impact

- 新增代码结构：`package.json`、`astro.config.mjs`、`tsconfig.json`、`src/layouts/`、`src/pages/`、`src/content/`、`src/styles/`、`public/`。
- 新增发布配置：`.github/workflows/deploy.yml`（bun + `actions/deploy-pages`）。
- 新增依赖：`astro`。不引入 React/Vue 等框架集成，组件只用 `.astro`。
- 内容来源：`src/content/` 下的 Markdown 文件；`p/acc` 与随笔共用一个内容集合，通过固定 slug 路由。
- 现有文件影响：`demo.html` 保留为视觉基准对照，不参与构建、不被 Astro 路由收录。
- 外部依赖：Google Fonts（`Google Sans Flex`）通过 `<link>` 引入，是本方案唯一的第三方运行时资源；需接受其可用性与首屏字体加载成本。
- 部署站点：`https://zhangtony239.github.io/`，用户 Pages 根路径，`base` 保持 `/`。
