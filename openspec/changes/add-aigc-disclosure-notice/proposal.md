# 提案

## 为什么

站点目前没有任何关于 AIGC 成分的公开说明：`src/manifesto/what-is-p-acc.md` 末尾已经手写了一行「*本文适用于《含AIGC文稿统一解释说明》」，但这篇被引用的说明并不存在，读者点不进去，也没有任何地方解释这句话的适用范围与力度。同时 `src/content/essays/` 里仍是两篇占位内容（`hello-world.md`、`draft-sample.md`），归档里没有任何真实写作。

需要一篇可长期引用、可被逐字引用的规范文档，把「哪些文章含 AIGC 成分」「引用本说明不等于全文由 AI 完成」「个人站点无三校三审、作者保留最终解释权」这三点以条款格式固定下来，并让文末标记成为可点击的真实链接。

## 变更内容

- 删除占位随笔 `src/content/essays/hello-world.md` 与示例草稿 `src/content/essays/draft-sample.md`，`/essays` 归档不再包含占位内容。
- 新增第一篇随笔 `src/content/essays/aigc-notice.md`，标题《含AIGC文稿统一解释说明》，以条款格式声明三条内容：AIGC 成分的存在与披露方式、AI 辅助不等于大面积/完全 AI 创作、个人随笔站缺乏出版级三校三审并保留最终解释权与邮箱反馈渠道。该随笔固定发布在 `/essays/aigc-notice`。
- 为随笔 frontmatter 增加 AIGC 标记字段（布尔），正文模板 `ArticleLayout` 在标记为真时于正文最下方渲染「*本文适用于《含AIGC文稿统一解释说明》」，该文本是**指向 `/essays/aigc-notice` 的可点击链接**。
- 把 `src/manifesto/what-is-p-acc.md` 里现有的一行手写标记迁移到该 frontmatter 字段，删除正文内手写的 HTML 脚注，使全站标记只有一个来源。
- 说明文档自身不显示指向自己的脚注（避免自指）。

## 能力

### 新增能力

- `aigc-disclosure`: 定义《含AIGC文稿统一解释说明》这篇规范文档的存在、固定链接 `/essays/aigc-notice`、其必须声明的条款内容，以及「文章最下方标记 → 说明文档」这一披露机制：标记何时出现、出现时的文案与可点击性、标记的唯一来源。主 spec 目录 `openspec/specs/` 当前为空（既有能力仍停留在 `add-personal-site-v1` 的 delta 中、尚未归档），因此本变更不修改任何已归档能力，模板渲染规则作为该新能力的一部分定义。

### 修改能力

（无）

## 影响

- 内容：`src/content/essays/`（删除 2 篇、新增 1 篇）、`src/manifesto/what-is-p-acc.md`（移除手写脚注）。
- 内容模型：`src/content.config.ts` 增加 frontmatter 字段（默认值保证既有文章不受影响）。
- 模板：`src/layouts/ArticleLayout.astro` 新增脚注渲染与其样式；`src/pages/essays/[...slug].astro` 需要把标记传入模板。
- 输出：`/essays` 归档与 `/essays/aigc-notice` 文章页；`/what-is-p-acc` 页面的文末标记从静态文本变为链接。
- 无新增依赖，不改动 `p/acc` 宣言的正文内容与路由。
