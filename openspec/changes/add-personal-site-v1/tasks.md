# Tasks

## 1. 项目骨架与构建

- [x] 1.1 创建 `package.json`（`type: module`、`dev/build/preview` 脚本）并用 bun 添加 `astro` 依赖；验证：`bun install` 成功，`bunx astro --version` 输出版本号
- [x] 1.2 创建 `astro.config.mjs`，设置 `site: 'https://zhangtony239.github.io'`、`base: '/'`，不加任何 integration；验证：配合一个占位 `src/pages/index.astro`，`bun run build` 成功产出 `dist/index.html`
- [x] 1.3 创建 `tsconfig.json` 继承 `astro/tsconfigs/strict`；验证：编辑器对 `Astro` 全局类型不再报错，`bun run build` 仍通过
- [x] 1.4 创建 `.gitignore`（`node_modules/`、`dist/`、`.astro/`、`.env`）；验证：`git status` 中不出现这些目录
- [x] 1.5 验证：`bun run dev` 启动后访问 `http://localhost:4321/` 返回 200

## 2. 设计令牌与全局样式

- [x] 2.1 创建 `src/styles/tokens.css`，在 `:root` 定义全部令牌：`--bg: #FFFFFF`、`--ink: #121A26`、`--ink-2: #55637A`、`--ink-3: #939FB1`、`--accent: #ADD0F5`、`--accent-deep: #2F6FE0`、`--line: rgba(18,26,38,0.08)`、`--sans`、`--mono`、`--pad-x`、`--nav-h`；验证：令牌名与值逐一比对 proposal 与 design，无遗漏
- [x] 2.2 创建 `src/styles/global.css`：reset、`body` 使用 `--sans` 并设 `font-optical-sizing: auto`、`a` 无下划线、`:focus-visible` 为 2px `--accent-deep` 描边带偏移；验证：键盘 Tab 到导航条目时可见蓝色描边
- [x] 2.3 复核 `src/` 下除 `tokens.css` 外不出现十六进制色值，组件样式只引用变量；验证：对 `src/**/*.css`、`src/**/*.astro` 搜索 `#` 与 `rgba(` 后人工确认仅剩 `tokens.css`

## 3. 基础布局外壳

- [x] 3.1 创建 `src/layouts/BaseLayout.astro`：`<head>` 含 charset、viewport、可传入的 title、两个 `preconnect` 与一条 Google Sans Flex 的 `css2` 链接（`display=swap`）、引入 `tokens.css` 与 `global.css`，`<body>` 内渲染 `NavPill`、slot、`SiteFooter`；验证：构建后任一页面源码含 `fonts.googleapis.com` 与两张样式表引用
- [x] 3.2 创建 `src/components/NavPill.astro`：三个条目 `首页` → `/`、`p/acc` → `/p/acc`、`随笔` → `/essays`，按 `Astro.url.pathname` 匹配并给命中项加 `aria-current="page"` 与淡蓝填充；验证：分别在 `/`、`/p/acc`、`/essays` 下检查仅一个条目处于当前态
- [x] 3.3 实现胶囊视觉：固定定位、`left: 50%` + `translateX(-50%)`、`top: 18px`、`border-radius: 999px`、`backdrop-filter: blur(20px) saturate(1.7)`、1px `--line` 边框、无整宽 border-bottom；验证：视口中不存在横贯顶部的色条或分隔线
- [x] 3.4 创建 `src/components/SiteFooter.astro`：1px `--line` 上边线 + 版权年份 + 三个站外链接；验证：滚动到底部可见，年份等于构建年份
- [x] 3.5 响应式：`@media (max-width: 560px)` 下胶囊仍居中、三个条目单行且不溢出；验证：DevTools 以 375px 宽度检查无横向滚动条、条目未换行

## 4. 内容集合与查询模块

- [x] 4.1 创建 `src/content.config.ts`：`essays` 使用 glob loader，schema 为 `title: z.string()`、`date: z.coerce.date()`、`draft: z.boolean().default(false)`；验证：写一篇缺 `title` 的 md 后 `bun run build` 报 schema 校验错误，删掉后恢复通过
- [x] 4.2 添加两篇示例随笔到 `src/content/essays/`，其中一篇标 `draft: true`；验证：构建后 `dist` 中不存在草稿对应的页面文件
- [x] 4.3 创建 `src/lib/essays.ts`，导出 `getPublishedEssays()`（过滤 draft、按 date 倒序）与 `groupByYear()`（年份倒序、年内倒序、同日期以 title 稳定排序）；验证：归档渲染的条目数与已发布 md 数一致且顺序正确

## 5. 首页

- [x] 5.1 创建 `src/pages/index.astro`：只渲染一条 44px 水平细线与一句 slogan，居中、`min-height: 100svh`；验证：首屏除导航外只有这两个元素，页面中搜索不到任何姓名文本
- [x] 5.2 把 slogan 抽为可编辑内容（`src/consts.ts` 导出 `SLOGAN`）；验证：修改该常量后重新构建，输出页面对应文案随之变化而结构不变
- [x] 5.3 实现 slogan 排版：`clamp(2.6rem, 8.6vw, 6.4rem)`、字重 `200`（在字体缺该字重时由浏览器取整为 400，不得出现 700）、`letter-spacing: -0.035em`、居中单列；验证：375px 与 1440px 下均不溢出、不截断
- [x] 5.4 确认首页无背景装饰层：`body`/`main` 无 `background-image`、无 `gradient`；验证：构建后流水线中搜索 `linear-gradient`/`radial-gradient` 在首页样式中零命中
- [x] 5.5 确认首页文档标题可用；验证：浏览器标签页标题非空且与 slogan 或站点名相关

## 6. 随笔归档与正文

- [x] 6.1 创建 `src/pages/essays/index.astro`：按年份分组标题 + 每行「日期 + 标题」两列、整行是一个 `<a>`、无摘要/封面/标签/分页；验证：每行 DOM 内只有日期与标题两个文本节点
- [x] 6.2 实现行悬停态：淡蓝 `rgba(173,208,245,0.2)` 底色 + 标题转 `--accent-deep`、日期加深；验证：鼠标悬停任意行观察到两项变化，点击行内空白处仍跳转
- [x] 6.3 创建 `src/pages/essays/[...slug].astro`，用 `getStaticPaths` 复用 `getPublishedEssays()`；验证：每篇已发布随笔有可访问 URL，草稿 URL 返回 404
- [x] 6.4 创建 `src/layouts/ArticleLayout.astro`：`max-width: 62ch` 单列、正文 `--ink-2`、`line-height: 1.85`、段落间距可见、正文之上只有标题与日期；验证：打开一篇长文，量得行宽约 62ch 且顶部无标签/作者/翻页元素
- [x] 6.5 建立文章页文档标题与标题一致性；验证：浏览器标签页标题包含该文标题
- [x] 6.6 实现 Markdown 结构元素样式：`h2`/`h3` 层级（正文从 h2 起、不自动加序号）、引用块（左侧 1px `--line` 线 + 略大字号 + `--ink`）、有序/无序列表（弱色标记）、行内代码（等宽 + 浅底）、`strong`/`em`；验证：用一段同时含这六类元素的测试正文对照，无浏览器默认蓝、无默认表格边框、无双编号
- [x] 6.7 实现表格样式与破栏：表格可宽至 `min(92ch, 100vw - 48px)`，外层容器 `overflow-x: auto`，单元格内边距与表头弱色；验证：在 1440px 与 375px 下页面均无横向滚动条，窄屏时表格自身可横向滚动

## 7. p/acc 宣言页

- [x] 7.1 从 `C:\Users\Tony\Downloads\p-acc-manifesto.md` 导入正文到 `src/manifesto/p-acc.md`：保留正文原样、删除开头那一行 `# p/acc — Paired Accelerationism Manifesto`（`h1` 由模板独占）、补 `title: p/acc` 与 `date` frontmatter；验证：`/p/acc` 页面上只有一个 `h1`，且 Downloads 中的源文件未被修改
- [x] 7.2 创建 `src/pages/p/acc.astro`，导入 Markdown 的 `Content`、`frontmatter` 并套 `ArticleLayout`；验证：访问 `/p/acc` 渲染成功，版式与任意随笔完全一致
- [x] 7.3 逐项核对宣言的全部结构元素在页面上完整呈现、无内容丢失（按当前正文）：5 个二级标题、6 个三级标题、四列对照表格、一个 2 项无序列表、一个 4 项有序列表、1 处行内代码；验证：与 `src/manifesto/p-acc.md` 逐段对比，构建产物实测计数一致
- [x] 7.4 确认宣言不在归档与聚合输出中、且不存在别名路径；验证：`/essays` 列表中无该条，构建产物中指向宣言的链接只有 `/p/acc`
- [x] 7.5 确认导航 `p/acc` 条目文案为 `p/acc` 且指向 `/p/acc`；验证：从任意页面点击该条目进入宣言页

## 8. 发布到 GitHub Pages

- [x] 8.1 创建 `.github/workflows/deploy.yml`：`oven-sh/setup-bun` → `bun install --frozen-lockfile` → `bun run build` → `actions/upload-pages-artifact`（`path: dist`）→ `actions/deploy-pages`，`permissions` 仅 `contents: read`、`pages: write`、`id-token: write`；验证：本地 `cat`/审阅确认无多余权限与密钥引用
- [ ] 8.2 提交并推送后确认 Action 成功；验证：Actions 运行日志中 build 与 deploy 两步均为成功，`github-pages` 环境产出部署 URL
- [ ] 8.3 在仓库 Settings → Pages 将 Source 设为 GitHub Actions（人工步骤）；验证：`https://zhangtony239.github.io/` 返回首页而非 404
- [ ] 8.4 验证根路径发布：所有站内链接不带路径前缀；验证：线上依次点击 首页 → 随笔 → 任一文章 → p/acc，四个页面均正常打开且样式加载完整

## 9. 集成校验

- [ ] 9.1 在浏览器禁用 JavaScript 后完整走一遍四个页面；验证：导航、首页 slogan、归档列表、正文全部可见可点，无空白区
- [x] 9.2 ~~将 `demo.html` 首屏从「姓名 + 定位语」改为「一句 slogan」并重开对照~~ 按作者决定直接删除 `demo.html`（不再保留视觉基准对照）；验证：`dist` 中不存在 `demo.html`
- [x] 9.3 边界情况：`src/content/essays/` 为空时构建归档页；验证：归档页正常渲染不报错（可显示空分组），索引页与 p/acc 不受影响
- [x] 9.4 边界情况：放入一个 120 字符的超长标题与一个极长无空格 slug；验证：归档行不换行溢出容器，正文页 URL 可用
