# Spec Delta

## Purpose

首页负责用尽可能少的元素确立调性：只给出一条水平细线与一句 slogan，让留白与一句话本身承担全部视觉表达，不承担自我介绍或内容导航的职责。

## ADDED Requirements

### Requirement: 首页只有一句 slogan

首屏内 MUST 只呈现两个内容元素：一条短的水平细线与一句 slogan。首页 MUST NOT 呈现姓名、副标题、定位语、社交图标行、头像、多段自我介绍或随笔列表。

#### Scenario: 首屏只有细线与 slogan

- **WHEN** 用户打开首页
- **THEN** 除导航之外，首屏只出现一条水平细线与一句 slogan

#### Scenario: 不出现姓名等被排除元素

- **WHEN** 首页渲染完成
- **THEN** 页面任何位置都不存在姓名文字、副标题、社交图标行、头像图片、自我介绍区块或文章列表

### Requirement: slogan 可作为内容编辑

slogan MUST 作为站点内容可被编辑，替换时 MUST NOT 需要改动页面标记结构，也 MUST NOT 引起布局结构变化。

#### Scenario: 替换 slogan

- **WHEN** 站点所有者修改配置中的 slogan 并重新构建
- **THEN** 首页显示新的 slogan，水平细线与居中布局位置保持不变

### Requirement: slogan 的排版层级

slogan MUST 作为唯一的主视觉文字呈现：居中单列、紧凑字距、字号随视口在约 2.6rem 至 6.4rem 之间连续缩放，且 MUST 在任何宽度下不溢出视口。字重 MUST NOT 超过 400；在字体提供更细字重时 SHOULD 使用 200。

#### Scenario: 大屏与窄屏都成比例

- **WHEN** 视口宽度从移动端变化到桌面端
- **THEN** slogan 按视口连续缩放并保持同一字距比例，不出现溢出、截断或可见的字重突变

#### Scenario: 字体缺少细字重时不加重

- **WHEN** slogan 使用中文，而当前字体只提供 400 与 700
- **THEN** slogan 以 400 呈现，不出现被加粗到 700 的情况，居中布局与字距保持不变

#### Scenario: 长句可以换行

- **WHEN** slogan 文字长度超过单行可容纳范围
- **THEN** 它在同一居中列内换行，行高紧凑且不破坏垂直居中

### Requirement: 首页背景为纯白

首页背景 MUST 为纯白令牌，MUST NOT 叠加渐变、纹理或背景图像层。

#### Scenario: 背景无装饰层

- **WHEN** 首页渲染
- **THEN** 绘制的背景为 `#FFFFFF`，文字之后不存在渐变、噪点或图片层
