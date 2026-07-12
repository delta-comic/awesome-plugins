# 项目规范

## Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at <https://viteplus.dev/guide/>.

### Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

### Notice

When working in a local development environment, use `vp` instead of `pnpm exec vp`.

In cloud environments, use `pnpm exec vp`.

---

## 检查清单

- [ ] Run `bun install` after pulling remote changes and before getting started.
- [ ] Run `bun run check` and `bun test` to format, lint, type check and test changes.

## 开发思想

### 思想

- 使用文件系统分割模块来保证结构工整；对于按步骤流程运行不同模块的，或许可以使用glob引入执行实现由文件驱动模块
- 优先使用`oop`(面向对象)思想编写代码，但要避免过度封装，继承链最好不要超过5层(非强制)
- 使用`依赖注入`思想优化耦合，但也要避免过度封装。
- 使用类似`条件反转`等技巧减少代码嵌套，但不要过度的不加分辨的使用

### 格式

- 组件样式必须使用PascalCase，例如: `<NButton></NButton>`、`<DcList></DcList>`
- 格式化请使用`bun run fmt`和`bun run lint --fix`，最好不要手动修复格式问题
- 最好遵守`dry`(不要重复自己)规则

## 项目概览

本项目为[Delta Comic](https://github.com/delta-comic/delta-comic)服务，提供类似插件市场的功能。使用bun作为底层运行时

## 项目特色

- 基于github的issue实现的可交互的注册及修改系统
- 管理严密的权限模型
