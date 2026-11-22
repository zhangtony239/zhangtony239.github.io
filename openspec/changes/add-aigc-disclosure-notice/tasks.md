# 任务

## 1. 披露机制的基础设施

- [x] 1.1 在 [`src/content.config.ts`](src/content.config.ts) 的 essays schema 中加入 `aigc: z.boolean().default(false)`，运行 `bun run build`（或 `npm run build`）确认既有文章在未声明该字段时仍构建成功
- [x] 1.2 在 [`src/consts.ts`](src/consts.ts) 导出 `AIGC_NOTICE_PATH = '/essays/aigc-notice'` 与标记文案常量 `AIGC_NOTICE_LABEL = '本文适用于《含AIGC文稿统一解释说明》'`，确认两处常量被引用而非硬编码字符串
- [x] 1.3 给 [`src/layouts/ArticleLayout.astro`](src/layouts/ArticleLayout.astro) 增加可选 props `aigc?: boolean` 与 `aigcNoticeHref?: string`（默认取 `AIGC_NOTICE_PATH`），仅当 `aigc` 为真时在 `.prose` 之后、`</article>` 之前渲染一行 `<p class="aigc-note">`，其中整句文案是 `<a>` 链接；验证方式：临时把某篇文章设为 `aigc: true` 后构建，页面末尾出现链接，改回后链接消失且无空占位
- [x] 1.4 为 `.aigc-note` 添加样式：小字号、`--ink-3` 色、悬停下划线并转 `--ink-2`、与正文末段至少 `2.5em` 间距、不设分隔线；验证方式：在浏览器中把说明文档以外的带标记文章滚到底部，确认其视觉弱于正文链接且占据独立一行
- [x] 1.5 在 [`src/pages/essays/[...slug].astro`](src/pages/essays/[...slug].astro) 把 `essay.data.aigc` 传给 `ArticleLayout` 的 `aigc` prop，验证方式：一篇 `aigc: true` 的随笔渲染出标记，一篇未声明该字段的随笔不渲染标记

## 2. 说明文档

- [x] 2.1 新建 [`src/content/essays/aigc-notice.md`](src/content/essays/aigc-notice.md)，frontmatter 为 `title: 含AIGC文稿统一解释说明`、`date` 取发布日、不声明 `aigc`（默认即假，避免自指）；验证方式：构建后 `/essays/aigc-notice` 可访问，标签页标题含该标题
- [x] 2.2 写入第一条条款「一、关于本站的 AIGC 成分与披露方式」：作者作为自然人的表达上限、本站随笔与其他内容可能包含 AIGC 成分、为在不打扰阅读的前提下做负责任披露、凡使用 AIGC 处理的文章最下方会标记「本文适用于《含AIGC文稿统一解释说明》」且点击可跳转本文；使用 `##` 标题与有序列表，不使用 `#`；验证方式：渲染后页面只有一个 `h1`（模板标题），条款以 `h2` 呈现
- [x] 2.3 写入第二条条款「二、引用本说明不推出『全文由 AI 完成』」：即使使用 AI 辅助，作者仍会尽可能二次核对与修改，因此引用本说明不可推出文章必然大面积或完全由 AI 创作；验证方式：该条款文字在页面中可读，且同时出现「二次核对」与「大面积/完全由 AI 创作」的否定表述
- [x] 2.4 写入第三条条款「三、审校限度、解释权与反馈渠道」：无论是否使用 AI 辅助，本站属于个人随笔性记录网站、缺乏出版级三校三审、任何文章都可能词不达意或表达不够恰当，含 AIGC 成分的文章还可能残留 AI 对作者本意的歪曲；作者保留最终解释权，并给出可点击的邮箱 `mailto:zhangtony239@gmail.com` 欢迎读者提出建议；验证方式：页面末尾的邮箱渲染为可点击 `mailto` 链接
- [x] 2.5 在文末补一句适用范围（说明它约束所有带标记的文章），确认正文不再手写任何指向本文的 AIGC 脚注；验证方式：页面最下方没有指向本页的链接

## 3. 迁移宣言页

- [x] 3.1 在 [`src/manifesto/what-is-p-acc.md`](src/manifesto/what-is-p-acc.md) 的 frontmatter 增加 `aigc: true`，并删除正文最后一行的手写脚注 `*<br /><sup>\*本文适用于《含AIGC文稿统一解释说明》</sup>*`；验证方式：构建后 `/what-is-p-acc` 末尾仍出现标记，但源码中已无该手写行
- [x] 3.2 在 [`src/pages/what-is-p-acc.astro`](src/pages/what-is-p-acc.astro) 读取 `frontmatter.aigc` 并传给 `ArticleLayout`，验证方式：临时把 `aigc` 改为 `false` 时标记消失，改回 `true` 时恢复
- [x] 3.3 对比 `/what-is-p-acc` 与任一随笔的标记，确认文案、位置与样式完全一致；验证方式：两页标记文本逐字相同，点击后都落在 `/essays/aigc-notice`

## 4. 清除占位内容

- [x] 4.1 删除 [`src/content/essays/hello-world.md`](src/content/essays/hello-world.md) 与 [`src/content/essays/draft-sample.md`](src/content/essays/draft-sample.md)，验证方式：构建后 `/essays` 归档只剩《含AIGC文稿统一解释说明》，不再出现「这里以后会写些什么」或草稿示例条目
- [x] 4.2 验证草稿机制未被破坏：临时新增一篇 `draft: true` 的文章，构建后确认它既不在 `/essays` 列表、其 URL 也返回 404，随后删除该临时文件
- [x] 4.3 确认 [`src/lib/essays.ts`](src/lib/essays.ts) 的草稿过滤逻辑与归档排序未因删文而改动，验证方式：`/essays` 年份分组与日期倒序仍正确

## 5. 集成验证

- [x] 5.1 跑一次完整构建与本地预览，逐项核对：`/essays/aigc-notice` 可访问、`/what-is-p-acc` 标记可点击回到说明文档、任意未标记文章无标记、说明文档自身无自指标记
- [x] 5.2 检查 `AIGC_NOTICE_PATH` 常量与说明文档实际 URL 一致（打开链接不出现 404），确认全站只有一处标记渲染实现、无残留手写脚注
