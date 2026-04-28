# 宝塔 Linux 面板 Docker 部署说明

## 适用场景

- 当前项目为 Vite 前端单页应用。
- 目标环境为宝塔 Linux 面板。
- 部署方式为 Docker + Docker Compose + Nginx 容器。

## 项目中已提供的文件

- `Dockerfile`
- `nginx.conf`
- `docker-compose.yml`
- `.dockerignore`

## 服务器准备

### 1. 宝塔安装建议

- 安装 `Docker 管理器`
- 安装 `Nginx`
- 安装 `Git`

### 2. 端口建议

- `80`：HTTP
- `443`：HTTPS
- `8080`：容器内部服务对外映射，建议仅用于本机反代或调试

如果你通过宝塔反向代理对外提供服务，公网只需要开放 `80` 和 `443`。

## 拉取项目代码

```bash
cd /www/wwwroot
git clone https://github.com/Simon201503/DATC-MES-SourceCode.git
cd DATC-MES-SourceCode
```

如果目录已经存在：

```bash
cd /www/wwwroot/DATC-MES-SourceCode
git pull origin main
```

## 启动容器

在项目根目录执行：

```bash
docker compose up -d --build
```

查看容器状态：

```bash
docker compose ps
docker logs datc-pms-web
```

默认映射关系：

- 容器内部：`80`
- 服务器本机：`8080`

可以先用下面地址测试：

```text
http://服务器IP:8080
```

## 宝塔中配置网站反向代理

### 1. 添加站点

- 打开宝塔面板
- 进入 `网站`
- 添加一个站点
- 域名填写你的正式域名，例如：`pms.example.com`
- PHP 版本选择静态即可

### 2. 配置反向代理

- 打开对应站点设置
- 进入 `反向代理`
- 添加反向代理
- 目标地址填写：

```text
http://127.0.0.1:8080
```

保存后即可通过域名访问容器中的前端服务。

## HTTPS 配置

### 1. 域名解析

- 在域名服务商后台添加 `A` 记录
- 指向当前服务器公网 IP

### 2. 宝塔申请证书

- 打开站点设置
- 进入 `SSL`
- 选择 `Let's Encrypt`
- 申请证书
- 开启强制 HTTPS

## 路由刷新说明

当前 `nginx.conf` 已包含：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

这可以解决前端单页应用在刷新 `/process/list`、`/profile` 等子路由时返回 404 的问题。

## 后续更新流程

项目更新后，在服务器执行：

```bash
cd /www/wwwroot/DATC-MES-SourceCode
git pull origin main
docker compose up -d --build
```

## 常见排查

### 页面打不开

检查容器是否启动：

```bash
docker compose ps
```

### 容器构建失败

查看日志：

```bash
docker logs datc-pms-web
```

### 域名访问异常

检查：

- 域名是否解析到当前服务器
- 宝塔反向代理是否指向 `127.0.0.1:8080`
- 宝塔 Nginx 是否正常运行

### 刷新页面 404

确认 `nginx.conf` 中存在 SPA 路由回退配置，且已重新构建容器。
