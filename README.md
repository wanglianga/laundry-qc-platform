# 洗衣质检平台

## 项目简介

面向连锁洗衣门店、中央工厂、客服和顾客的全流程洗衣质检管理平台，实现从收衣质检、工厂清洗、返店签收、顾客取衣到争议赔付的完整证据链管理。

## 技术栈

- **前端**: Vue 3 + Vite + TypeScript + Element Plus + Vue Router
- **后端**: NestJS + TypeORM + SQLite
- **部署**: Docker + Docker Compose

## 原始需求

> 修复洗衣质检平台证据链断点：门店工作台需要为 returning 状态提供"返店签收"入口并调用 /api/clothing/:id/store-receive，签收后订单进入 ready，顾客端和门店才能确认取衣；客服工作台需要为投诉列表提供明确的"处理赔付"入口，选中赔付记录后可填写赔付方式、金额、方案、顾客反馈并调用 /api/compensations/:id/handle。修复后用浏览器完整验证"门店收衣 -> 送厂 -> 工厂处理 -> 返店签收 -> 顾客取衣/评价 -> 投诉赔付处理"的证据链。

## 功能模块

### 门店工作台
- 衣物收衣登记（品类、品牌、颜色、材质、口袋检查、预存瑕疵、顾客要求）
- 瑕疵照片上传
- 待处理衣物列表
- 送往中央工厂
- 返店签收
- 取衣确认

### 工厂工作台
- 待处理任务列表
- 清洗工艺记录
- 去渍尝试记录
- 烘干方式记录
- 整烫结果记录
- 洗后新增损伤记录
- 返店批次管理
- 洗后照片上传

### 客服工作台
- 投诉发起与管理（掉色、缩水、破损、错拿、逾期）
- 赔付依据管理（预存瑕疵、洗后新增损伤、逾期取衣、错件等）
- 赔付方案处理（退款、重洗、折扣、现金赔付）
- 客户反馈记录

### 顾客端
- 订单查询
- 洗涤进度查看
- 取衣确认
- 服务评价
- 投诉与赔付申请

### 证据链系统
- 衣物档案全生命周期追踪
- 流转节点时间线
- 照片证据分类管理
- 赔付记录关联

## 启动方式

### 方式一：Docker 一键启动（推荐）

#### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

#### 启动步骤

```bash
docker compose up --build
```

后台运行：

```bash
docker compose up --build -d
```

查看服务日志：

```bash
docker compose logs -f
```

停止服务：

```bash
docker compose down
```

**访问地址**:
- 前端页面: http://localhost:8080
- 后端API: http://localhost:3000

---

### 方式二：本地开发启动

#### 前置要求

- Node.js 18+
- npm 或 pnpm

#### 后端启动

```bash
cd backend

# 安装依赖
npm install

# 开发模式启动
npm run start:dev

# 或生产模式启动
npm run build && npm run start:prod
```

后端服务地址: http://localhost:3000

#### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 开发模式启动
npm run dev

# 或生产构建
npm run build && npm run preview
```

前端页面地址: http://localhost:5173

---

## API 接口说明

### 衣物档案

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/clothing | 获取衣物列表 |
| GET | /api/clothing/:id | 获取衣物详情 |
| POST | /api/clothing | 创建衣物档案 |
| PUT | /api/clothing/:id | 更新衣物信息 |
| PUT | /api/clothing/:id/status | 更新衣物状态 |
| POST | /api/clothing/:id/factory-process | 工厂处理完成 |
| POST | /api/clothing/:id/store-receive | 门店签收 |
| POST | /api/clothing/:id/pickup | 顾客取衣 |
| POST | /api/clothing/:id/photos | 上传照片证据 |
| POST | /api/clothing/:id/store-inspection | 门店质检提交 |
| POST | /api/clothing/:id/factory-inspection | 工厂质检提交 |
| POST | /api/clothing/:id/handle-review | 处理复核 |
| GET | /api/clothing/:id/can-wash | 检查是否可进入清洗 |

### 赔付记录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/compensations | 获取赔付列表 |
| GET | /api/compensations/:id | 获取赔付详情 |
| GET | /api/compensations/clothing/:clothingId | 获取指定衣物的赔付记录 |
| POST | /api/compensations | 创建赔付申请 |
| PUT | /api/compensations/:id | 更新赔付信息 |
| PUT | /api/compensations/:id/handle | 处理赔付 |

---

## 目录结构

```
.
├── backend/                 # NestJS 后端服务
│   ├── src/
│   │   ├── entities/        # 数据库实体定义
│   │   ├── modules/         # 业务模块
│   │   │   ├── clothing/    # 衣物管理模块
│   │   │   ├── photo-evidence/ # 照片证据模块
│   │   │   └── compensation/   # 赔付管理模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/                # Vue3 前端应用
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── router/          # 路由配置
│   │   ├── api/             # API 接口
│   │   ├── types/           # 类型定义
│   │   ├── App.vue
│   │   └── main.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml       # Docker 编排配置
├── Dockerfile               # 根目录 Dockerfile
└── README.md
```

---

## 注意事项

1. 数据存储：开发环境使用 SQLite 数据库，文件位于 `backend/data/laundry.db`
2. 文件上传：照片文件存储在 `backend/uploads/` 目录
3. Docker 启动时会自动创建数据卷，保证数据持久化
4. 生产环境建议更换为 MySQL 或 PostgreSQL 数据库
