# 设计

## 上下文

见 `proposal.md` — 为什么。实现侧的现状约束：

- 随笔由 Astro content collection 提供，schema 在 [`src/content.config.ts`](src/content.config.ts:4) 定义，字段为 `title` / `date` / `draft`，`draft` 已有 `.default(false)` 的先例。
- 文章页 [`src/pages/essays/[...slug].astro`](src/pages/essays/[...slug].astro:23) 把 `essay.data.title`、`essay.data.date` 传给 [`ArticleLayout.astro`](src/layouts/ArticleLayout.astro:6)，布局只接收 `title` 与 `date`。
- 宣言页 [`src/pages/what-is-p-acc.astro`](src/pages/what-is-p-acc.astro:2) 直接 import `../manifesto/what-is-p-acc.md` 的 `Content` 与 `frontmatter`，再复用同一个 `ArticleLayout`。宣言正文末尾现在是一行手写 HTML 脚注（`src/manifesto/what-is-p-acc.md` 最后一行）。
- 站点常量集中在 [`src/consts.ts`](src/consts.ts:1)；`/essays/*` 不出现在任何聚合输出以外的地方，首页不列随笔。
- 主 spec 目录 `openspec/specs/` 为空：既有能力仍在 `add-personal-site-v1` 的 delta 里，尚未归档。因此本变更不写 MODIFIED delta。

## 目标与非目标

**目标：**

- 让「文末标记」成为模板的单一职责：只要元数据标了，标记就出现且可点击；没人能靠复制粘贴写错文案或漏掉链接。
- 说明文档自身的正文结构（条款编号）稳定，能被后续文章逐条引用（如「见第 2 条」）。
- 既有文章（`draft`、老 frontmatter）在新增字段后继续构建通过。

**非目标：**

- 不做自动 AIGC 检测、不做按段落粒度的披露、不在正文中间插入提示。
- 不改归档行样式、不加标签或阅读时长，也不给归档行加 AIGC 角标（决议：披露只在文章页最下方，保持归档「只有日期与标题」的既有约束）。
- 不改 `p/acc` 宣言的正文内容、路由与标题。

## 决策

### 1. 披露状态来自 frontmatter 布尔字段 `aigc`，默认 `false`

在 [`src/content.config.ts`](src/content.config.ts:6) 的 schema 中加 `aigc: z.boolean().default(false)`。理由：

- 与既有 `draft` 字段同构，作者只需在 frontmatter 写一行 `aigc: true`。
- 默认值为假，保证 `draft-sample`、`hello-world` 之类旧文章（以及未来忘记声明的文章）不会误报「含 AIGC」，符合「宁可不说，不可错说」的披露伦理。
- 备选方案：在正文手写链接（现状）→ 文案与链接会随复制粘贴漂移，且无法被 spec 场景验证；用一个目录级 `aigc/` 子目录区分 → 与「随笔按日期归档」的扁平结构冲突，且会让 URL 携带无关语义。均否决。

### 2. 标记由 `ArticleLayout` 渲染，路径取自站点常量

`ArticleLayout` 增加可选 prop `aigc?: boolean` 与可选 `aigcNoticeHref?: string`（默认取 [`src/consts.ts`](src/consts.ts:1) 导出的 `AIGC_NOTICE_PATH = '/essays/aigc-notice'`）。渲染位置在 `.prose` 容器之后、`</article>` 之前，作为独立一行 `<p class="aigc-note">`。

理由：

- 随笔页与宣言页共用该布局，一处实现即可覆盖两个入口，正对应 spec 中「声明文档之外的页面同样被覆盖」。
- 文案与目标 URL 由常量提供，`《含AIGC文稿统一解释说明》` 的标题变化只需改常量与文档，不必全文搜索。
- 备选方案：在每篇 Markdown 末尾手写 → 被否决（见决策 1）；在 Markdown 里用 Astro 组件插槽 → 内容集合的 `.md` 不支持组件，只能写 MDX，改动过大。

### 3. 说明文档通过 frontmatter `aigc: false` 规避自指

说明文档 `aigc-notice.md` 的 frontmatter **不** 声明 `aigc: true`（默认即为假），从而使「说明文档自身不自指」这条要求零特例实现：模板不需要判断「当前文章是不是说明文档」，也没有硬编码 id 比较。代价是文档自身的 AIGC 成分在机制层面未打标——由文档第一条条款在正文里声明，语义完整，且避免「点开链接发现是指向本页」的荒谬交互。

### 4. 标记文案与排版

精确文案：`*本文适用于《含AIGC文稿统一解释说明》`，其中书名号部分（实际上整句）作为链接。视觉上沿用宣言页现有脚注的观感：小字号、上升的 `<sup>` 星号、非强调色，与正文最后一段保持 `2.5em` 以上间距，不设分隔线。链接颜色使用 `--ink-3`，悬停改为 `--ink-2` 并加下划线，避免与正文链接的 `--accent-deep` 抢视觉——披露是注脚，不是主行动点。

### 5. 宣言页读取 frontmatter 传入布局

[`src/pages/what-is-p-acc.astro`](src/pages/what-is-p-acc.astro:5) 已拿到 `frontmatter`，增加 `const aigc = frontmatter.aigc === true;` 并传给 `<ArticleLayout aigc={aigc}>`；同时从 `src/manifesto/what-is-p-acc.md` 正文删除手写脚注行，改为在 frontmatter 中写 `aigc: true`。这样宣言页与随笔页的标记同源同形。

### 6. 说明文档的正文结构

一级标题由模板渲染（`.md` 内不写 `#`），正文用三个 `##` 条款，条款编号与用户给定的三点一一对应：

1. `## 一、关于本站的 AIGC 成分与披露方式` — 自然人的表达上限、可能含 AIGC、以文末标记做「不打扰阅读」的披露、标记的文案与点击去向。
2. `## 二、引用本说明不推出「全文由 AI 完成」` — 作者仍会二次核对与修改；明确否定「大面积/完全 AI 创作」的推断。
3. `## 三、审校限度、解释权与反馈渠道` — 个人随笔站无出版级三校三审、任何文章都可能词不达意、含 AIGC 的文章可能残留 AI 对本意的歪曲、作者保留最终解释权、邮箱 `zhangtony239@gmail.com` 与欢迎建议。

结尾一行给出一句「本说明的适用范围」，说明它适用于所有带标记的文章，方便未来引用。

### 7. 占位内容清除

删除 `src/content/essays/hello-world.md` 与 `src/content/essays/draft-sample.md`。草稿机制本身（schema 的 `draft` 字段与 [`src/lib/essays.ts`](src/lib/essays.ts:12) 的过滤）保留不动——它是能力，不是样例；后续需要验证时再临时加一篇 `draft: true` 的文章即可，不必长期占位。

## 风险与权衡

- [删除 `draft-sample.md` 后，草稿过滤失去常驻的人工样例] → 用一次构建验证：临时新增一篇 `draft: true` 的文章确认不生成页面与归档条目，验证完删除；`openspec/changes/add-personal-site-v1` 里的草稿要求本身不改。
- [`ArticleLayout` props 变更影响两个调用点] → 新 prop 全部可选且默认 `false`，宣言页与随笔页都显式传值；漏传的页面表现为「不显示标记」，不会构建失败。
- [作者忘记给含 AIGC 的文章打标] → 默认值为假会把漏标当成「未使用 AI」。这是刻意的取舍：披露系统无法自证，宁可如实沉默也不自动怀疑。缓解手段是说明文档第一条明确「凡使用了 AIGC 处理的文章都会标记」这一承诺。
- [标记 URL 写成常量后与文档实际路径脱钩] → 说明文档文件名固定为 `aigc-notice.md`，其 URL 由 collection id 决定；tasks 中要求改路径时同步常量，并在验证步骤中实际打开链接确认不是 404。
- [脚注被误认为正文内容的一部分，读起来像在自我辩护] → 排版上把它压在正文外、用次要色与 `<sup>` 星号明确其注脚身份，且全站只有一句。

## 迁移计划

1. 先加 schema 字段（默认值）与布局 prop，此时全站行为不变。
2. 新增说明文档并把 `p/acc` 的手写脚注迁到 frontmatter，标记开始出现。
3. 删除两篇占位内容，归档只剩说明文档。
4. 回滚策略：删除新增字段与 prop 调用即可回到手写脚注，说明文档作为普通随笔仍可访问。
