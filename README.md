# Stat AI Bootcamp Platform

统计学专业大一学生通用人工智能 2 个月学习平台。项目已从纯静态页升级为轻量级前后端分离应用，支持账号注册登录、管理员管理、学习进度看板、题目上传、学生提交、图片上传、人工批改和评分。

## 技术栈

- 前端：Vue 3 + Vite，纯 CSS，无 Tailwind / Bootstrap
- 后端：Node.js + Express
- 数据库：MySQL 8
- 上传：本地磁盘 `backend/uploads`
- 鉴权：JWT

## 文件结构

```text
.
├── backend
│   ├── schema.sql
│   ├── .env.example
│   ├── scripts/seedAdmin.js
│   └── src
│       ├── server.js
│       ├── db.js
│       ├── middleware
│       └── routes
├── frontend
│   ├── index.html
│   └── src
│       ├── main.js
│       └── styles.css
├── DEPLOYMENT.md
├── QUESTION_IMPORT_README.md
└── package.json
```

## 本地开发

### Docker 一键运行

推荐使用 Docker，避免手动配置 Node、MySQL 和 Nginx：

```bash
cp .env.docker.example .env
docker compose up -d --build
docker compose exec api npm run seed:admin
```

默认访问：

```text
http://localhost:33011
```

云服务器外网访问地址按当前配置为：

```text
http://49.235.185.176:33011
```

如果 `33011` 与本机其他服务冲突，修改 `.env` 中的 `WEB_PORT`。

### 手动开发

1. 安装依赖：

```bash
npm run install:all
```

2. 创建 MySQL 数据库和表：

```bash
mysql -uroot -p < backend/schema.sql
```

3. 配置后端环境变量：

```bash
cp backend/.env.example backend/.env
```

按需修改 `backend/.env` 里的数据库账号、`JWT_SECRET` 和管理员密码。

4. 创建或更新管理员账号：

```bash
npm run seed:admin
```

5. 启动后端：

```bash
npm run dev:backend
```

6. 启动前端：

```bash
cp frontend/.env.example frontend/.env
npm run dev:frontend
```

访问 `http://localhost:5173`。

## 管理员账号

管理员账号由后端种子脚本创建，不会显示在网页上。默认值按你的要求写在后端环境变量示例中：`ADMIN_USERNAME=Admin`、`ADMIN_PASSWORD=Admin`。正式部署后建议立刻改成强密码，然后重新运行：

```bash
npm run seed:admin
```

## 主要功能

- 学生注册、登录、退出
- 管理员登录、用户启用/禁用、角色管理
- 学习进度看板
- 8 周默认学习计划、32 个任务点逐项打卡、LeetCode 打卡、学习记录
- 管理员创建测验，并在测验内添加、编辑、删除题目
- 题目支持 Markdown 题干、LaTeX 公式、参考答案、图片上传、JSON/Markdown/TXT 批量导入
- 学生支持文本答案、图片答案提交
- 管理员查看提交、手动批改、反馈、打分

## 题目批量导入

管理员可在「题目管理」先新建或选择测验，再上传 JSON、Markdown 或 TXT 文件批量添加题目。JSON 支持数组格式和 `{ "questions": [...] }` 格式；Markdown/TXT 支持用一级标题或“第 n 题”分隔题目，并用 `## 参考答案` 分隔答案。详细字段说明见 [QUESTION_IMPORT_README.md](./QUESTION_IMPORT_README.md)。

## 管理员日志

管理员端提供「日志文档」页面，按 5 天一个文件记录访问 IP、用户操作、管理员操作和数据库写入事件，并提供数据库表概览。

## 部署

完整 Ubuntu / 腾讯云轻量服务器部署步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)。推荐使用 Docker Compose 部署，后端和 MySQL 不直接暴露公网端口，只让 Web 容器映射一个端口，方便避开已有 `frps` 服务。
