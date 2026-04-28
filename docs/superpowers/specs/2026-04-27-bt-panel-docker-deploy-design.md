# 宝塔面板 Docker 部署设计说明

## 目标

- 为当前 Vite 前端项目补齐一套可直接用于宝塔 Linux 面板的 Docker 部署文件。
- 支持在服务器上通过 `docker compose up -d --build` 完成构建与启动。
- 支持宝塔网站反向代理到容器端口，并兼容单页应用路由刷新。

## 项目特征

- 当前项目是 React + TypeScript + Vite 的前端单页应用。
- 生产构建命令为 `npm run build`，构建产物目录为 `dist`。
- 项目当前没有现成的 Docker、Nginx 或 Compose 部署文件。

## 方案对比

### 方案 A：仅静态文件 + 宝塔 Nginx

- 在服务器上手动执行 `npm install` 和 `npm run build`，然后将 `dist` 作为静态站点发布。
- 优点是简单。
- 缺点是部署过程依赖服务器本机环境，不利于复用和迁移。

### 方案 B：Docker 单容器部署

- 使用多阶段构建生成静态资源，再由 Nginx 容器提供服务。
- 优点是环境一致、部署稳定。
- 缺点是手动启动参数较多，不如 Compose 便于维护。

### 方案 C：Docker Compose + Nginx + 宝塔反代

- 通过 `Dockerfile` 多阶段构建前端静态资源。
- 通过 `nginx.conf` 处理静态文件与 SPA 路由回退。
- 通过 `docker-compose.yml` 固化容器名、端口、重启策略。
- 再通过宝塔面板的网站反向代理和 HTTPS 功能对外暴露域名。
- 这是当前最适合的方案。

## 选定方案

- 采用方案 C。
- 部署文件保持最小集，不引入数据库、后端或多容器编排。

## 文件设计

### `Dockerfile`

- 第一阶段使用 `node:20-alpine` 安装依赖并执行 `npm run build`。
- 第二阶段使用 `nginx:1.27-alpine` 托管 `dist` 目录。
- 镜像对外暴露 `80` 端口。

### `nginx.conf`

- 根目录指向 `/usr/share/nginx/html`。
- 静态资源使用缓存头。
- 关键配置是 `try_files $uri $uri/ /index.html;`，用于支持 SPA 前端路由刷新。

### `docker-compose.yml`

- 提供单服务 `datc-pms-web`。
- 容器名固定，便于宝塔和命令行排查。
- 主机端口映射到 `8080`，便于后续由宝塔反向代理。
- 设置 `restart: always`，提升重启后的可用性。

### `.dockerignore`

- 忽略 `node_modules`、`dist`、`.git`、IDE 配置等无关文件，减少构建上下文。

### 部署说明文档

- 写一份面向宝塔面板的中文操作文档。
- 覆盖拉代码、安装 Docker 管理器、构建启动、站点反代、HTTPS 和更新流程。

## 验证标准

- 本地执行 `npm run build` 通过。
- `docker-compose.yml`、`Dockerfile` 和 `nginx.conf` 结构清晰，能满足宝塔部署。
- 文档能让用户按步骤在服务器上完成部署，而无需额外推测关键参数。
