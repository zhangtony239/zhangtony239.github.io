# Spec Delta

## MODIFIED Requirements

### Requirement: 归档排除固定页面

归档 MUST 排除宣言页（`/what-is-p-acc`，标题「什么是p/acc」）以及其他被标记为固定页面的文档；这些文档 MUST 仍可通过导航或固定链接直接访问。

#### Scenario: 宣言页不出现在归档

- **WHEN** 归档渲染完成
- **THEN** 「什么是p/acc」不在列表中出现，而导航中的 `p/acc` 条目仍可打开该页面
