# Spec Delta

## Purpose

把站点的 AIGC 披露做成一件可长期引用、可逐字核对的事：一篇固定链接的说明文档，声明 AIGC 成分的存在、引用边界与免责范围，以及一个由模板统一渲染、可点击回到该文档的文末标记。

## ADDED Requirements

### Requirement: 说明文档的固定链接与标题

站点 MUST 发布一篇标题为《含AIGC文稿统一解释说明》的随笔，MUST 固定链接在 `/essays/aigc-notice`，且 MUST 只有这一个人类可访问的路径。该随笔 MUST 以全站唯一的正文模板呈现。

#### Scenario: 打开固定链接

- **WHEN** 读者访问 `/essays/aigc-notice`
- **THEN** 页面以共用正文模板呈现《含AIGC文稿统一解释说明》，一级标题与标签页标题均含该标题

#### Scenario: 不存在别名路径

- **WHEN** 站内任意位置引用该说明文档
- **THEN** 引用都指向 `/essays/aigc-notice`，不存在第二条路径

### Requirement: 声明的第一条——AIGC 成分与披露方式

说明文档 MUST 声明：作者作为自然人其表达能力存在上限，本站随笔与其他内容可能包含 AIGC 成分；为了在不打扰阅读的前提下完成负责任的披露告知，凡写作过程中使用了 AIGC 处理的文章，其最下方 MUST 出现标记「本文适用于《含AIGC文稿统一解释说明》」，点击该标记 MUST 打开本说明文档。

#### Scenario: 读者从标记回溯条款

- **WHEN** 读者在某篇带标记的文章最下方点击该标记文本
- **THEN** 浏览器打开 `/essays/aigc-notice`，即本篇说明文档

#### Scenario: 不打扰阅读的披露位置

- **WHEN** 一篇带标记的文章被打开
- **THEN** 标记出现在正文最下方，正文之前与正文内部不出现任何 AIGC 提示

### Requirement: 声明的第二条——引用不等于全文由 AI 生成

说明文档 MUST 声明：即使使用 AI 辅助，作者仍会尽可能二次核对与修改；因此对本说明的引用 MUST NOT 被解释为该文章必然大面积或完全由 AI 创作。

#### Scenario: 条款明确否定过度推断

- **WHEN** 读者阅读该说明文档的对应条款
- **THEN** 文档同时说明「使用 AI 辅助」与「作者二次核对修改」，并明确排除「大面积/完全 AI 创作」的推论

### Requirement: 声明的第三条——无出版级审校与作者保留解释权

说明文档 MUST 声明：无论是否使用 AI 辅助，本站属于个人随笔性记录网站，缺乏出版级的三校三审，任何文章都可能出现词不达意或表达不够恰当之处；含 AIGC 成分的文章还 MAY 残留 AI 对作者本意的歪曲解释。文档 MUST 声明作者保留最终解释权，MUST 提供可用的邮箱联系方式并欢迎读者提出建议。

#### Scenario: 免责与反馈渠道同时出现

- **WHEN** 读者阅读该说明文档的免责条款
- **THEN** 文档说明个人站点缺乏三校三审、含 AIGC 的文章可能残留 AI 歪曲，并给出可点击的作者邮箱

### Requirement: 文末标记只有一个来源

文章的 AIGC 标记 MUST 由随笔的结构化元数据（frontmatter 中的布尔标记）决定，MUST NOT 由作者在正文里手写 HTML 或文本实现。标记为真时，正文最下方 MUST 渲染出指向 `/essays/aigc-notice` 的链接；标记为假或未声明时，页面 MUST NOT 出现任何 AIGC 标记。

#### Scenario: 标记为真的文章

- **WHEN** 一篇元数据声明含 AIGC 成分的文章被渲染
- **THEN** 正文末尾出现一处指向 `/essays/aigc-notice` 的链接，且全页只有这一处

#### Scenario: 标记为假或缺省的文章

- **WHEN** 一篇未声明 AIGC 成分的文章被渲染
- **THEN** 页面中不存在任何指向该说明文档的链接，也不存在空占位

#### Scenario: 正文与模板不重复渲染

- **WHEN** 一篇元数据声明含 AIGC 成分的文章正文本身不含相关文字
- **THEN** 页面仍只由模板渲染出这一处标记，不出现重复的两行标记

### Requirement: 说明文档自身不自指

说明文档本身 MUST NOT 在文末显示指向自己的标记。

#### Scenario: 打开说明文档

- **WHEN** 读者打开 `/essays/aigc-notice`
- **THEN** 正文最下方没有指向本页的 AIGC 标记

### Requirement: 声明文档之外的页面同样被覆盖

`/what-is-p-acc` 宣言等非随笔正文页，若其内容含 AIGC 成分，MUST 使用与随笔相同的标记来源与文案，MUST NOT 再手写脚注文本。

#### Scenario: 宣言页标记可点击

- **WHEN** 读者打开 `/what-is-p-acc` 并滚到正文末尾
- **THEN** 出现与随笔一致的标记文本，点击后打开 `/essays/aigc-notice`

### Requirement: 归档中不再有占位内容

占位随笔与示例草稿 MUST 从内容目录移除，`/essays` 归档 MUST NOT 出现占位或示例文章；归档中除说明文档外的条目都 MUST 是真实写作。

#### Scenario: 归档没有占位条目

- **WHEN** 读者打开 `/essays`
- **THEN** 列表中不存在「这里以后会写些什么」这类占位标题，也不存在示例草稿条目
