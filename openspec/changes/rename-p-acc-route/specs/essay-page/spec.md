# Spec Delta

## MODIFIED Requirements

### Requirement: 全站只有一个正文模板

所有随笔与宣言页（`/what-is-p-acc`）MUST 由同一个正文模板渲染，MUST NOT 为宣言页单独设计版式。阅读栏宽度 MUST 为单列约 62 个字符。

#### Scenario: 随笔与宣言页版式一致

- **WHEN** 用户分别打开任意随笔与 `/what-is-p-acc`
- **THEN** 两者使用相同的单列阅读宽度、字号层级与段落间距

### Requirement: p/acc 固定链接

宣言 MUST 固定发布在 `/what-is-p-acc`，其一级标题与文档标题 MUST 为「什么是p/acc」，导航中的对应条目 MUST 文案为 `p/acc`；站点 MUST NOT 为同一文档再暴露其他路径，也 MUST NOT 保留 `/p/acc` 的跳转或别名。

#### Scenario: 打开固定链接

- **WHEN** 用户访问 `/what-is-p-acc`
- **THEN** 宣言以共用的正文模板呈现，一级标题与标签页标题均为「什么是p/acc」

#### Scenario: 旧路径不再可达

- **WHEN** 用户访问 `/p/acc`
- **THEN** 该路径不返回宣言内容，也不重定向到 `/what-is-p-acc`

#### Scenario: 不存在别名路径

- **WHEN** 站内任意链接指向宣言
- **THEN** 该链接都指向 `/what-is-p-acc`，不存在第二个人类可用的路径

### Requirement: 宣言不进归档与聚合输出

宣言 MUST NOT 出现在 `/essays` 归档中，也 MUST NOT 进入任何聚合输出（含未来可能新增的订阅源）。

#### Scenario: 宣言只能从导航与固定链接进入

- **WHEN** 生成任一列表或聚合产物
- **THEN** 宣言都不在其中，唯一入口是导航条目与 `/what-is-p-acc` 本身
