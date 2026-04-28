# BT Panel Docker Deploy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为当前项目补齐宝塔 Linux 面板可直接使用的 Docker 部署文件与操作文档。

**Architecture:** 使用多阶段 `Dockerfile` 构建 Vite 项目，并通过 Nginx 容器提供静态资源服务。再用 `docker-compose.yml` 固化容器编排参数，用中文文档说明宝塔面板中的反向代理、HTTPS 与更新流程。

**Tech Stack:** Docker, Docker Compose, Nginx, Node.js, Vite

---

### Task 1: 创建容器构建与运行文件

**Files:**
- Create: `Dockerfile`
- Create: `nginx.conf`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

**Step 1: 编写多阶段 Dockerfile**

- 使用 `node:20-alpine` 构建项目。
- 使用 `nginx:1.27-alpine` 托管 `dist`。

**Step 2: 编写 Nginx 配置**

- 配置静态文件根目录。
- 添加 SPA 路由回退规则。
- 为资源目录添加基础缓存头。

**Step 3: 编写 Compose 配置**

- 固定服务名和容器名。
- 暴露 `8080:80` 端口。
- 设置自动重启。

**Step 4: 编写 .dockerignore**

- 排除 `node_modules`、`dist`、`.git` 与本地工具目录。

### Task 2: 编写宝塔部署文档

**Files:**
- Create: `docs/deployment/bt-panel-docker-deploy.md`

**Step 1: 写部署准备步骤**

- 说明宝塔安装 Docker 管理器、Nginx、Git 的要求。
- 说明开放 `80`、`443`、`8080` 端口的使用场景。

**Step 2: 写部署执行步骤**

- 说明如何拉取仓库。
- 说明如何执行 `docker compose up -d --build`。
- 说明如何在宝塔里配置网站反向代理。

**Step 3: 写更新与排障步骤**

- 说明如何更新代码与重建容器。
- 说明如何查看容器日志和处理 SPA 刷新 404。

### Task 3: 验证

**Files:**
- Check: `Dockerfile`
- Check: `nginx.conf`
- Check: `docker-compose.yml`
- Check: `.dockerignore`

**Step 1: 运行项目构建**

Run: `npm run build`  
Expected: 前端生产构建成功

**Step 2: 运行编辑器诊断**

Run: 对新增文档和配置文件进行基础检查  
Expected: 文件内容完整、无明显格式错误
