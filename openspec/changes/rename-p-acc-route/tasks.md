# Tasks

## 1. 基线前置

- [ ] 1.1 让主 spec 基线落位：先归档 `add-personal-site-v1`，或对它跑 `openspec sync specs`；验证：`openspec/specs/essay-page/spec.md` 与 `openspec/specs/essay-archive/spec.md` 已存在，`openspec list --specs` 能看到这两个能力

## 2. 改名

- [ ] 2.1 `src/manifesto/p-acc.md` 重命名为 `src/manifesto/what-is-p-acc.md`，frontmatter `title` 改为 `什么是p/acc`，正文一字不动；验证：`git diff` 只显示 title 一行改动 + 文件重命名，正文 102 行无其他差异
- [ ] 2.2 `src/pages/p/acc.astro` 重命名为 `src/pages/what-is-p-acc.astro`，import 改指向新的 manifesto 文件，删掉空掉的 `src/pages/p/` 目录；验证：`/what-is-p-acc` 构建成功，页面只有一个 `h1` 且为「什么是p/acc」
- [ ] 2.3 [`NavPill.astro`](src/components/NavPill.astro:6) 中该条目 `href` 改为 `/what-is-p-acc`、`isCurrent` 改为匹配 `/what-is-p-acc`，`label` 仍为 `p/acc`；验证：`/`、`/what-is-p-acc`、`/essays` 三页下都只有一个条目带 `aria-current="page"`，且导航里已无 `/p/acc`

## 3. 验证

- [ ] 3.1 跑 `bun run build`；验证：`dist/p/acc/` 不存在，`dist/what-is-p-acc/index.html` 存在，其 `<title>` 为 `什么是p/acc · Tony Zhang`
- [ ] 3.2 全仓搜索 `p/acc`；验证：除 `p/acc` 这个概念的正文写法和 `openspec/changes/` 下的历史文档外，没有残留指向 `/p/acc` 的链接或 import
- [ ] 3.3 打开 `/essays`；验证：列表里没有「什么是p/acc」，点导航中间条目仍能进入该页
