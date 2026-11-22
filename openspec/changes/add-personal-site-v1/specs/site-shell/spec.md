# Spec Delta

## Purpose

定义全站共享的外壳：设计令牌、字体加载、导航与页脚，以及静态构建与发布的底线约束，使所有页面呈现同一套视觉语言且可零服务端发布。

## ADDED Requirements

### Requirement: 统一设计令牌

站点 MUST 通过单一来源定义设计令牌，并在所有页面中消费令牌而非字面色值：背景纯白 `#FFFFFF`、正文冷黑 `#121A26`、次要文字 `#55637A`、极弱文字 `#939FB1`、主光蓝 `#ADD0F5`、可点击蓝 `#2F6FE0`、细线 `rgba(18,26,38,0.08)`。

#### Scenario: 全站颜色来自令牌

- **WHEN** 任意页面被渲染
- **THEN** 该页面前景、背景与边框颜色均可追溯到上述令牌之一，页面样式中不出现未定义的色值

#### Scenario: 高饱和蓝只用于可读交互

- **WHEN** `#2F6FE0` 被应用到文字
- **THEN** 它只出现在链接、焦点环或悬停标题上，正文段落文字不使用该色

### Requirement: 西文使用 Google Sans Flex

站点 MUST 以可变字体方式加载 Google Sans Flex，并将其应用于全部西文；中文 MUST 回落系统黑体（PingFang SC / Microsoft YaHei / Hiragino Sans GB），且 MUST 开启 `font-optical-sizing`。

#### Scenario: 西文由 Google Sans Flex 渲染

- **WHEN** 页面渲染包含拉丁字形的文本
- **THEN** 这些字形使用 Google Sans Flex 呈现，光学尺寸自动适配

#### Scenario: 字体不可用时不破坏排版

- **WHEN** 字体样式表加载失败或被网络策略拦截
- **THEN** 拉丁文字仍以回退字体栈显示，正文阅读宽度与行高不发生变化

### Requirement: 居中毛玻璃胶囊导航

站点 MUST 只渲染一个固定定位的导航，形状为水平居中、四角全圆的胶囊，浮在视口顶边之下并带背景模糊；站点 MUST NOT 渲染横贯视口的顶栏，也 MUST NOT 渲染横贯视口的底部边线。

#### Scenario: 导航呈现为悬浮胶囊

- **WHEN** 任意页面被显示
- **THEN** 导航表现为居中的全圆角胶囊，与视口顶边留有间距，且视口中不存在横贯的顶栏或分隔线

#### Scenario: 条目固定为三项

- **WHEN** 导航被显示
- **THEN** 它按 `首页`、`p/acc`、`随笔` 的顺序包含且仅包含这三个条目

#### Scenario: 当前页在导航中被标记

- **WHEN** 用户位于三个条目之一对应的页面
- **THEN** 该条目以淡蓝填充胶囊标示为当前项，其余条目无填充

#### Scenario: 窄屏下三个条目仍在同一行

- **WHEN** 视口宽度不超过 560px
- **THEN** 胶囊保持居中，三个条目仍在一行内显示且不溢出、不换行

### Requirement: 毛玻璃页脚

每个页面 MUST 以页脚结束，页脚与正文之间 MUST 由 1px 令牌细线分隔，并 MUST 包含当前版权年份与站外链接。

#### Scenario: 页面底部存在页脚

- **WHEN** 用户滚动到任意页面底部
- **THEN** 页脚可见，显示 © 与年份，并提供站外链接，其上方为 1px 细线

### Requirement: 零服务端静态发布

构建 MUST 产出纯静态 HTML 与 CSS，导航、首页、归档与正文阅读 MUST NOT 依赖客户端 JavaScript 才能工作，且产物 MUST 可发布到 GitHub Pages 的站点根路径。

#### Scenario: 关闭脚本仍可完整浏览

- **WHEN** 浏览器禁用客户端 JavaScript
- **THEN** 导航、首页、随笔归档与正文阅读均正常工作，所有文字内容可见

#### Scenario: 根路径发布

- **WHEN** 站点被发布到 `zhangtony239.github.io` 的 GitHub Pages
- **THEN** 所有页面与站内链接在 `/` 下正确解析，不带额外路径前缀

### Requirement: 键盘焦点可见

站点 MUST 为每个可交互元素提供键盘焦点指示，样式为 2px 的 `#2F6FE0` 描边并带有可见偏移。

#### Scenario: Tab 聚焦可见

- **WHEN** 用户使用 Tab 在页面中移动焦点
- **THEN** 当前聚焦的链接或控件显示 2px 蓝色描边，且描边不覆盖文字
