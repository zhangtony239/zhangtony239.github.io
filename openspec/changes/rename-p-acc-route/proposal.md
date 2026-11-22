# Proposal

## Why

宣言页的路径 `/p/acc` 和标题 `p/acc` 都没说明这一页是什么。作者要求路径改为 `/what-is-p-acc`，标题改为「什么是p/acc」。

## What Changes

- **BREAKING** 宣言页路径 `/p/acc` → `/what-is-p-acc`，不保留旧路径的跳转或别名（旧链接直接 404）。
- 页面一级标题与文档标题（`<title>`）由 `p/acc` 改为「什么是p/acc」。
- 导航条目文案仍为 `p/acc`，只改指向地址；条目数量与顺序不变。
- 文件同步改名：`src/pages/p/acc.astro` → `src/pages/what-is-p-acc.astro`（删掉空的 `src/pages/p/`），`src/manifesto/p-acc.md` → `src/manifesto/what-is-p-acc.md`，其 frontmatter `title` 改为「什么是p/acc」；正文不动。
- 宣言仍不进 `/essays` 归档与任何聚合输出，仍复用全站唯一正文模板。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `essay-page`: 固定链接的路径与标题、无别名规则，以及正文模板/归档那两条里对旧路径的引用。
- `essay-archive`: 被排除的固定页面改按新页面描述，排除行为本身不变。

`site-shell` 不立 delta：导航文案仍是 `p/acc`，该 spec 也从未固定条目 href。

## Impact

- 代码：`src/pages/p/acc.astro`、`src/components/NavPill.astro`、`src/manifesto/p-acc.md`。
- 构建产物：`dist/p/acc/` 消失，新增 `dist/what-is-p-acc/`。
- 前置：主 spec 基线还是空的（`add-personal-site-v1` 未归档），MODIFIED delta 需先把基线落位。
