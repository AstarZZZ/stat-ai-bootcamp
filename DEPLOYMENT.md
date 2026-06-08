# Ubuntu / 腾讯云轻量服务器 Docker 部署指南

本指南默认使用 Docker Compose 部署。部署后只有 `web` 容器映射一个宿主机端口，`api` 和 `mysql` 都只在 Docker 内部网络通信，不直接暴露公网端口，方便避开已有 `frps` 转接服务冲突。

## 1. 端口规划

建议：

- Docker Web：宿主机 `33011`，用于外网访问 `http://49.235.185.176:33011`
- Docker API：仅 Docker 内网 `api:3100`
- Docker MySQL：仅 Docker 内网 `mysql:3306`
- 现有 `frps`：保持原端口，不改动

部署前查看端口占用：

```bash
sudo ss -lntup
sudo systemctl status frps --no-pager
```

如果 `33011` 已被占用，把 `.env` 里的 `WEB_PORT=33011` 改成其他端口。

## 2. 安装 Docker

### 方案 A：官方 Docker 源

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

如果执行 `curl https://download.docker.com/...` 时出现 `Recv failure: Connection reset by peer`，通常是服务器访问 Docker 官方源被重置。腾讯云国内服务器可以改用下面的镜像方案。

### 方案 B：使用国内 Docker CE 镜像源

```bash
sudo apt update
sudo apt install -y ca-certificates curl git gnupg
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 方案 C：Ubuntu 仓库备用安装

如果 Docker CE 镜像源也不可用，可以先用 Ubuntu 自带仓库安装，足够运行本项目：

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
sudo systemctl enable --now docker
```

如果 `docker-compose-v2` 包不存在，改用：

```bash
sudo apt install -y docker.io docker-compose git
sudo systemctl enable --now docker
```

允许当前用户运行 Docker：

```bash
sudo usermod -aG docker $USER
newgrp docker
docker version
docker compose version
```

## 3. 拉取项目

推荐部署目录：

```bash
sudo mkdir -p /var/www/stat-ai-bootcamp
sudo chown -R $USER:$USER /var/www/stat-ai-bootcamp
cd /var/www
git clone https://github.com/AstarZZZ/stat-ai-bootcamp.git stat-ai-bootcamp
cd /var/www/stat-ai-bootcamp
```

## 4. 配置环境变量

```bash
cp .env.docker.example .env
nano .env
```

生产建议配置：

```env
WEB_PORT=33011
PUBLIC_BASE_URL=http://49.235.185.176:33011
FRONTEND_ORIGIN=http://49.235.185.176:33011

MYSQL_ROOT_PASSWORD=请改成强密码
MYSQL_DATABASE=stat_ai_bootcamp
MYSQL_USER=stat_ai_user
MYSQL_PASSWORD=请改成强密码

JWT_SECRET=请改成至少32位随机字符串
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=请改成管理员强密码
```

如果必须先使用默认管理员密码，也可以保留 `ADMIN_PASSWORD=Admin`，但公网部署后建议立刻改强密码并重新执行管理员种子命令。

## 5. 启动服务

```bash
docker compose up -d --build
docker compose ps
```

首次启动 MySQL 会自动执行 `backend/schema.sql` 创建数据库表。

## 6. 创建管理员账号

```bash
docker compose exec api npm run seed:admin
```

管理员账号由 `.env` 控制，不会显示在网页上。默认用户名是 `Admin`。

## 7. 访问系统

如果 `WEB_PORT=33011`：

```text
http://49.235.185.176:33011
```

如果你用域名、Nginx 或 frp 做转发，则访问你的域名或转发入口。

## 8. 腾讯云安全组

只放行实际对外开放的端口：

- 直接访问 Docker Web：放行 TCP `33011`
- 如果由 Nginx / frps 统一转发：只放行你的转发入口端口，例如 `80`、`443` 或 frps 使用的端口

不要放行 `3100` 或 `3306`。它们没有映射到宿主机，只在 Docker 内部网络里使用。

## 9. 与 frps 共存

### 方案 A：Docker Web 使用 33011，frps 不动

```bash
WEB_PORT=33011
docker compose up -d
```

腾讯云安全组放行 TCP `33011`，然后访问 `http://49.235.185.176:33011`。

### 方案 B：frps 或其他服务占用 33011，项目换端口

修改 `.env`：

```env
WEB_PORT=8090
```

然后：

```bash
docker compose up -d
```

访问：

```text
http://服务器公网IP:8090
```

### 方案 C：只允许 frp 转发，不直接暴露 Docker Web

把 `docker-compose.yml` 的 `web.ports` 改成：

```yaml
ports:
  - "127.0.0.1:${WEB_PORT:-33011}:80"
```

然后让 frp 客户端或本机 Nginx 转发到 `127.0.0.1:33011`。

## 10. 数据与上传文件

Docker 使用两个持久化 volume：

- `stat_ai_mysql_data`：MySQL 数据
- `stat_ai_uploads`：题目图片和学生提交图片

查看 volume：

```bash
docker volume ls | grep stat_ai
```

备份数据库：

```bash
docker compose exec mysql mysqldump -uroot -p stat_ai_bootcamp > backup.sql
```

## 11. 更新部署

```bash
cd /var/www/stat-ai-bootcamp
git pull
docker compose up -d --build
docker compose exec api npm run seed:admin
```

## 12. 日志与排查

查看服务状态：

```bash
docker compose ps
```

查看 API 日志：

```bash
docker compose logs -f api
```

查看 Web 日志：

```bash
docker compose logs -f web
```

查看 MySQL 日志：

```bash
docker compose logs -f mysql
```

健康检查：

```bash
curl http://127.0.0.1:33011/api/health
```

如果你修改了 `WEB_PORT`，把 `33011` 换成新端口。

## 13. 停止和删除

停止容器，不删除数据：

```bash
docker compose down
```

停止并删除数据库与上传文件 volume，谨慎使用：

```bash
docker compose down -v
```

## 14. 常用命令

```bash
docker compose up -d --build
docker compose restart api
docker compose logs -f
docker compose exec api npm run seed:admin
docker compose exec mysql mysql -uroot -p
```
