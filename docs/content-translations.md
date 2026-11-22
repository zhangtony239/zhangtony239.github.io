# 多语言内容维护

站点支持三种语言：`en`（默认与回落语言）、`zh-cn`、`ja`。语言由**目录**决定，不在 frontmatter 里重复声明。

## 目录结构

```
src/content/essays/<lang>/<slug>.md     随笔（一篇一语言）
src/manifesto/<lang>/what-is-p-acc.md   p/acc 宣言（一语言一份）
```

- `<lang>` 只能是 `en`、`zh-cn`、`ja`。
- `<slug>` 是**跨语言共享的文章身份**：同一篇文章的中、英、日三份译文用同一个文件名，页面路径因此只差语言前缀（`/zh-cn/essays/aigc-notice` 对 `/ja/essays/aigc-notice`）。
- 放在语言目录之外的文件、或语言目录名不受支持，都会被视为结构性错误（构建与检查都会报错）。

## 随笔的 frontmatter

```yaml
---
title: 含AIGC文稿统一解释说明
date: 2026-11-24
draft: false
aigc: false
---
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 该语言版本的标题，出现在归档与文档标题里 |
| `date` | 是 | 文章级属性，三语译文必须完全相同 |
| `draft` | 否 | 默认 `false`；为 `true` 时该文的所有语言版本都不出现、不生成页面 |
| `aigc` | 否 | 默认 `false`；为 `true` 时文末渲染 AIGC 披露标记 |

`date`、`draft`、`aigc` 是文章级属性：同一 slug 的不同语言版本必须一致，不一致会在构建时报错（`src/lib/essays.ts` 的注册表校验）。

## 新增一篇文章

1. 在 `src/content/essays/zh-cn/` 新建 `<slug>.md`（或任何一门语言的目录），写好 frontmatter 与正文。
2. 其余语言各写一份同名文件，`date` / `draft` / `aigc` 与第一份保持一致。
3. 跑 `bun run check:i18n` 确认没有缺译。
4. 跑 `bun run build` 生成页面。

## 缺译时会发生什么

- 归档只列出**当前语言存在译文**的文章，不会混入其它语言。
- 缺少某语言译文的文章不会生成该语言的页面（访问该地址得到 404）。
- 语言胶囊在该页面上的目标会对缺少译文的语言回落到该语言首页，避免把读者送进 404。
- `hreflang` 只声明真实存在的译文，`x-default` 指向英文版（英文缺失时指向第一个可用语言）。

## 检查三语覆盖

```bash
bun run check:i18n          # 只报告缺译，退出码 0
bun run check:i18n --strict # 缺译也视为失败，退出码 1
```

输出会列出检查范围（文章标识数、随笔译文数、宣言译文数）与每条缺译（`随笔 <slug>：缺少 zh-cn、ja` 形式）。

以下情况视为结构性错误并直接退出码 1：

- `src/content/essays/` 或 `src/manifesto/` 下出现不在 `en` / `zh-cn` / `ja` 中的语言目录；
- 随笔目录下出现不属于任何语言目录的文件；
- 同一语言下出现重复的文章标识。

## 界面文案

站点外壳文案（导航、页面标题、空状态、页脚、AIGC 披露文案、语言胶囊无障碍名称）在 `src/i18n/ui.ts` 的 `UI` 字典里，按 `en` / `zh-cn` / `ja` 各一份。新增 key 时三份都要补齐；缺键会回落到 `en` 并在控制台给出警告。
