# AGENTS.md

## 项目概览
- **站点**：个人静态站点 `https://zhangtony239.github.io`（用户 Pages 根路径 `/` 发布，见 `astro.config.mjs`）。
- **技术栈**：Astro 7（零 integration、纯静态输出）+ Bun。
- **部署**：推送至 `main` 分支后由 `.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages。

## 常用命令
- `bun run dev` — 启动本地开发服务器
- `bun run build` — 构建静态站点到 `dist/`（同时会校验内容注册表）
- `bun run check:i18n` — 检查三语内容覆盖率（`--strict` 时缺译返回非零退出码）

## 核心约定与边界
1. **三语支持（`en` / `zh-cn` / `ja`）**：
   - 语言配置唯一来源为 `src/i18n/config.ts`，默认与回落语言为 `en`。
   - 界面文案字典位于 `src/i18n/ui.ts`，新增或修改 key 时必须同步补齐三语。
   - 随笔与宣言的目录结构、frontmatter（`date` / `draft` / `aigc` 跨语言一致性）及缺译回落规则，详见 `docs/content-translations.md`。
2. **架构与样式**：
   - 保持纯静态输出，无必要不引入额外 Astro integration 或客户端重框架。
   - 站点级语言无关配置（站点名、AIGC 说明路径、页脚链接）集中在 `src/consts.ts`。
   - 视觉 Token 与全局样式集中在 `src/styles/global.css`（Tailwind v4 `@theme`）。
3. **改动后验证**：
   - 修改页面、样式或配置后，至少执行 `bun run build` 确认构建通过。
   - 涉及多语言内容或文案改动时，额外执行 `bun run check:i18n`。
