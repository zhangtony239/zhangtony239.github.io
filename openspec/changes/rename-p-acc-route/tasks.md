# Tasks

## 1. 基线前置

- [x] 1.1 确认基线落位方式；验证：本机 `openspec` 没有 `sync` 命令，`openspec/specs/` 仍为空，因此这两个 MODIFIED delta 只能在 `add-personal-site-v1` 归档后才落位——归档顺序必须是先 `add-personal-site-v1`、后本 change（`openspec validate rename-p-acc-route --strict` 已通过，仅提示基线缺失）

## 2. 改名

- [x] 2.1 `src/manifesto/p-acc.md` 重命名为 `src/manifesto/what-is-p-acc.md`，frontmatter `title` 改为 `什么是p/acc`，正文一字不动；验证：`git status` 显示为纯重命名，diff 中只有 title 一行改动，正文 102 行无其他差异
- [x] 2.2 `src/pages/p/acc.astro` 重命名为 `src/pages/what-is-p-acc.astro`，两个 import 改指向新的同级路径（`../manifesto/what-is-p-acc.md`、`../layouts/ArticleLayout.astro`），删掉空掉的 `src/pages/p/` 目录；验证：`bun run build` 通过，`/what-is-p-acc` 页面只有一个 `h1` 且为「什么是p/acc」
- [x] 2.3 [`NavPill.astro`](src/components/NavPill.astro:6) 中该条目 `href` 改为 `/what-is-p-acc`、`isCurrent` 改为匹配 `/what-is-p-acc`，`label` 仍为 `p/acc`；验证：构建产物中 `/`、`/what-is-p-acc`、`/essays` 三页各自只有一个条目带 `aria-current="page"`，导航里已无 `/p/acc`

## 3. 验证

- [x] 3.1 跑 `bun run build`；验证：`dist/` 下没有 `p` 目录，`dist/what-is-p-acc/index.html` 存在，其 `<title>` 为 `什么是p/acc · Tony Zhang`
- [x] 3.2 全仓搜索 `p/acc`；验证：残留只出现在正文里作为概念写法的 `p/acc`、导航 `label: 'p/acc'` 与 `openspec/changes/` 下的历史文档，没有指向 `/p/acc` 的链接或 import
- [x] 3.3 检查 `/essays` 产物；验证：列表里没有「什么是p/acc」，点导航中间条目仍指向 `/what-is-p-acc`
