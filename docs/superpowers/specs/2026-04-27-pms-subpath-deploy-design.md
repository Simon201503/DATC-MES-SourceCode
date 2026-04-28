# /pms 子路径部署设计说明

## 目标

- 将当前系统的访问入口从根路径部署调整为 `https://www.datc-pe.cn/pms/`。
- 根域名 `https://www.datc-pe.cn/` 保留一个简单占位页，不直接进入系统。
- 保证前端路由、静态资源路径、Docker 容器结构和 Nginx 路由规则在 `/pms` 下正常工作。

## 现状

- 当前项目使用 Vite 构建，默认按根路径 `/` 输出静态资源。
- 当前前端使用 `BrowserRouter`，没有设置 `basename`。
- 登录页 logo 使用绝对路径 `/datc-logo.svg`，在子路径部署下会失效。
- Docker 现有配置将 `dist` 直接复制到 Nginx 根目录。
- Nginx 现有配置只支持根路径 SPA 回退，不支持 `/pms/` 子路径。

## 方案对比

### 方案 A：使用独立子域名

- 例如 `https://pms.datc-pe.cn/`
- 实现简单，但不符合当前用户要使用 `/pms` 的需求。

### 方案 B：根路径直接跳转到 `/pms/`

- 实现相对简单，但根域名没有独立展示页。

### 方案 C：根路径占位页 + `/pms/` 正式系统

- 根路径显示轻量说明页，明确引导进入 `/pms/`
- 系统完整运行在 `/pms/`
- 这是当前选定方案。

## 选定方案

- 采用方案 C。
- 同时更新部署文档，确保服务器操作与代码配置一致。

## 代码调整

### `vite.config.ts`

- 增加 `base: '/pms/'`
- 作用：让构建产物中的资源路径自动带上 `/pms/`

### `src/App.tsx`

- 为 `BrowserRouter` 增加 `basename="/pms"`
- 作用：让 `Link`、`NavLink` 和 `navigate()` 在子路径环境下正常拼接路由

### `src/pages/Login.tsx`

- 将 logo 地址从绝对路径改为基于 `import.meta.env.BASE_URL`
- 作用：避免静态资源仍然从根路径加载

### `Dockerfile`

- 将构建产物复制到 `/usr/share/nginx/html/pms/`
- 额外复制一个根路径占位页到 `/usr/share/nginx/html/index.html`

### `nginx.conf`

- `/` 返回根路径占位页
- `/pms` 301 到 `/pms/`
- `/pms/` 执行 SPA 路由回退到 `/pms/index.html`

### 根路径占位页

- 新增一个简单静态 HTML
- 提供“进入 DATC-PMS 系统”的入口按钮

## 文档调整

- 更新 Docker 部署文档，访问地址改为 `/pms/`
- 更新图文版 HTML 文档，部署流程和验证地址改为 `/pms/`

## 验证标准

- `npm run build` 通过
- 构建产物资源路径带 `/pms/`
- 根路径显示占位页
- `/pms/` 正常进入系统
- `/pms/login`、`/pms/process/list` 刷新不 404
