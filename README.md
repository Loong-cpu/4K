# 长资源 - 高清影视资源导航站

仿 4kcz.com 的影视导航站，接入豆瓣真实数据，支持在线播放。

## 功能特性

- 🎬 豆瓣电影 Top250 / 热播电视剧实时数据
- 🔍 站内搜索（基于豆瓣 suggest API）
- ▶️ 在线播放器（多源切换，iframe 嵌入）
- 🎠 轮播推荐位
- 📱 响应式设计，支持移动端
- 🌙 深色主题

## 技术栈

- **前端**: Vanilla JS + CSS (无框架依赖)
- **后端**: Express.js (本地开发) / Vercel Serverless (生产部署)
- **数据源**: 豆瓣电影 API
- **播放源**: ikanss / playm3u8 / vipuuvip 等第三方嵌入

## 快速开始

### 本地开发

```bash
cd 4kcz_site
npm install
npm start
# 访问 http://localhost:3000
```

### 部署到 Vercel（推荐）

#### 方式一：Vercel CLI（已安装）

```bash
# 1. 登录 Vercel
vercel login

# 2. 创建项目（按提示操作）
vercel

# 3. 部署
vercel --prod
```

#### 方式二：Vercel 网页一键部署（最简单）

1. 将代码推送到 GitHub（创建私有或公开仓库）
2. 访问 https://vercel.com/new
3. 选择 "Import Git Repository"，找到你的仓库
4. 点击 "Deploy"，等待约 1 分钟
5. 获得类似 `https://your-project.vercel.app` 的域名

#### 方式三：Netlify 部署

1. 将代码推送到 GitHub
2. 访问 https://app.netlify.com/drop
3. 连接 GitHub 仓库，构建命令填 `node server.js`，发布目录填 `public`
4. 或者直接用 Netlify CLI: `npx netlify deploy --prod`

### 部署到 Render.com

1. 推送代码到 GitHub
2. 访问 https://render.com/ 注册账号
3. 点击 "New +" -> "Web Service"
4. 连接 GitHub 仓库
5. 配置：
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: Free
6. 点击 "Create Web Service"

## 项目结构

```
4kcz_site/
├── api/                    # Vercel serverless 函数
│   ├── douban.js           # 豆瓣 API 请求封装
│   ├── rank.js             # 排行榜接口
│   ├── search.js           # 搜索接口
│   └── carousel.js         # 轮播接口
├── public/                 # 前端静态文件
│   ├── index.html          # 主页面
│   ├── style.css           # 样式
│   └── app.js              # 前端逻辑
├── server.js               # Express 服务器（本地开发）
├── vercel.json             # Vercel 部署配置
├── package.json
└── .gitignore
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/rank | 获取排行榜，参数: type, start, limit |
| GET | /api/search | 搜索电影，参数: q |
| GET | /api/carousel | 获取轮播推荐 |

## 注意事项

- 豆瓣 API 从服务端代理请求，避免 CORS 问题
- 播放源依赖第三方网站，可用性不保证
- 本项目仅供学习研究，请勿用于商业用途

## 作者

Loong-cpu (2335610058@qq.com)
