# PMS Subpath Deploy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将系统从根路径部署调整为 `/pms/` 子路径部署，并保留根路径占位页。

**Architecture:** 前端通过 Vite `base` 和 React Router `basename` 适配 `/pms/`，静态资源使用 `BASE_URL` 引用。Docker 与 Nginx 改为“根路径占位页 + `/pms/` 系统目录”结构，并同步更新部署说明文档。

**Tech Stack:** Vite, React Router, Docker, Nginx, HTML

---

### Task 1: 修改前端子路径配置

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/App.tsx`
- Modify: `src/pages/Login.tsx`

**Step 1: 配置 Vite base**

- 添加 `base: '/pms/'`

**Step 2: 配置 Router basename**

- 为 `BrowserRouter` 添加 `basename="/pms"`

**Step 3: 修复绝对静态资源**

- 将 logo 路径改为基于 `import.meta.env.BASE_URL`

### Task 2: 修改 Docker 与 Nginx 结构

**Files:**
- Modify: `Dockerfile`
- Modify: `nginx.conf`
- Create: `root-index.html`

**Step 1: 调整容器内目录**

- 将系统构建产物放到 `/usr/share/nginx/html/pms/`

**Step 2: 增加根路径占位页**

- 根路径保留一个简单入口 HTML

**Step 3: 增加 `/pms/` 路由规则**

- `/pms` 跳转 `/pms/`
- `/pms/` 使用 SPA 回退

### Task 3: 更新部署文档

**Files:**
- Modify: `docs/deployment/bt-panel-docker-deploy.md`
- Modify: `docs/deployment/bt-panel-docker-deploy-visual.html`

**Step 1: 修改文档中的访问地址**

- 把访问路径统一改为 `/pms/`

**Step 2: 修改文档中的反向代理与验证说明**

- 明确根域名占位页与 `/pms/` 正式系统的关系

### Task 4: 验证

**Files:**
- Check: `vite.config.ts`
- Check: `src/App.tsx`
- Check: `src/pages/Login.tsx`
- Check: `Dockerfile`
- Check: `nginx.conf`

**Step 1: 运行项目构建**

Run: `npm run build`  
Expected: 构建成功且资源路径适配 `/pms/`

**Step 2: 运行编辑器诊断**

Run: 检查修改过的 TS / TSX 文件  
Expected: 无类型或 JSX 报错
