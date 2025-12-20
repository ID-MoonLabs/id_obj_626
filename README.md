# General Agent（iBot）

一个基于 Next.js 的通用智能体组件, 集成组件如下:

- RAG（检索增强生成）
- Pipline（自动化流水线）
- Observable（可观测）

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [配置](#配置)
- [使用指南](#使用指南)
- [API 接口](#api-接口)
- [开发指南](#开发指南)

## 功能特性

### 🤖 智能对话

- 基于知识库的智能问答系统
- 支持流式响应，实时显示回答内容
- 自动检索相关文档并显示来源
- 支持多轮对话
- 可下载问答中引用的文档

### 📚 知识库管理

- 创建和管理多个知识库
- 查看知识库状态和文档数量
- 支持知识库描述和状态管理
- 删除知识库及其关联文档

### 📄 文档管理

- 上传多种格式的文档（支持 PDF、Word、TXT 等）
- 手动触发文档解析（上传后需手动点击"开始解析"）
- 实时查看文档解析状态（待处理、处理中、已完成、失败）
- 支持文档重新解析和删除
- 显示文档分块数量和文件大小
- 支持文档下载

## 技术栈

- **框架**: Next.js 16.0.10
- **语言**: TypeScript 5
- **UI 库**: React 19.2.1
- **样式**: Tailwind CSS 4
- **组件库**: HeroUI (@heroui/react) 2.0.0
- **HTTP 客户端**: 原生 Fetch API
- **动画**: Framer Motion 11.0.0
- **图标**: Lucide React 0.446.0

## 项目结构

```
id_obj_626/
├── src/
│   ├── app/
│   │   ├── page.tsx           # 主页面
│   │   ├── layout.tsx         # 根布局
│   │   ├── globals.css        # 全局样式
│   │   └── favicon.ico        # 网站图标
│   ├── components/            # React 组件目录
│   └── lib/
│       └── utils.ts           # 工具函数
├── public/                    # 静态资源
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── package.json               # 项目依赖配置
├── tsconfig.json              # TypeScript 配置
├── tailwind.config.ts         # Tailwind CSS 配置
├── postcss.config.mjs         # PostCSS 配置
├── next.config.ts             # Next.js 配置
├── components.json            # 组件配置文件
├── next-env.d.ts              # Next.js 类型定义
├── yarn.lock                  # Yarn 锁文件
└── .gitignore                 # Git 忽略文件
```

## 快速开始

### 环境要求

- Node.js 18+
- Yarn 或 npm

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd id_obj_626

# 安装依赖
yarn install

```

### 运行

```bash
# 开发模式
yarn dev

# 构建生产版本
yarn build

# 启动生产服务器
yarn start

```

## 配置

### 环境变量

在项目根目录创建 `.env.local` 文件（可选）：

```env
# 后端 API 基础 URL（默认: http://localhost:18080/b/ibot）
NEXT_PUBLIC_API_BASE_URL=http://localhost:18080/b/ibot
```

### 后端 API 配置

确保后端服务运行在 `http://localhost:18080/b/ibot`，或通过环境变量配置其他地址。

代码中默认使用 `http://localhost:18080/b/ibot` 作为 API 基础地址（定义在 `src/app/page.tsx` 中的 `API_BASE_URL` 常量）。

### Next.js 配置

项目配置了 API 重写规则（`next.config.ts`），将 `/api/*` 路径重写到 `http://localhost:18080/*`。如果需要修改后端地址，请更新配置文件。

## 使用指南

### 智能对话

1. **选择知识库**：在侧边栏的"对话"标签页中选择一个知识库
2. **开始对话**：在输入框中输入问题，按 Enter 或点击发送按钮
3. **查看回答**：系统会流式显示回答内容，实时更新
4. **下载文档**：如果回答中引用了文档，可以点击文档名下载原始文档

### 知识库管理

1. **创建知识库**：

   - 切换到"知识库"标签页
   - 点击"创建知识库"按钮
   - 填写知识库名称（必填）和描述（可选）
   - 点击"创建知识库"确认
2. **选择知识库**：

   - 在知识库列表中点击某个知识库
   - 选中的知识库会高亮显示，并在主内容区显示其文档列表
3. **删除知识库**：

   - 在知识库列表中点击删除图标
   - 确认删除（这将删除所有相关文档）

### 文档管理

1. **上传文档**：

   - 选择一个知识库
   - 点击"上传文档"按钮
   - 选择文件（支持 PDF、Word、TXT 等格式）
   - 上传后文档状态为"待处理"
2. **解析文档**：

   - 对于"待处理"或"失败"状态的文档，点击"开始解析"或"重新解析"按钮
   - 解析过程中状态会显示为"处理中"
   - 解析完成后状态变为"已完成"
3. **重新解析文档**：

   - 对于"已完成"的文档，可以点击"重新解析"来重新处理
   - 这将删除旧的解析数据并重新解析
4. **下载文档**：

   - 在对话中，如果回答引用了文档，可以点击文档名下载原始文档
5. **删除文档**：

   - 在文档列表中点击删除图标
   - 确认删除操作

## API 接口

所有 API 端点基于 `/b/ibot` 前缀，默认地址为 `http://localhost:18080/b/ibot`。

### 知识库相关

#### 创建知识库

```http
POST /dataset/create
Content-Type: application/json

{
  "name": "知识库名称",
  "description": "知识库描述",
  "user_id": 1
}
```

#### 读取知识库列表

```http
POST /dataset/read
Content-Type: application/json

{}
```

响应示例：

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "知识库名称",
      "description": "知识库描述",
      "status": "active",
      "doc_count": 5,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 删除知识库

```http
POST /dataset/delete
Content-Type: application/json

{
  "id": 1
}
```

### 文档相关

#### 上传文档

```http
POST /document/upload
Content-Type: multipart/form-data

file: [文件]
knowledge_base_id: 1
```

#### 读取文档列表

```http
POST /document/read
Content-Type: application/json

{
  "knowledge_base_id": 1
}
```

#### 开始解析文档

```http
POST /document/parse/start
Content-Type: application/json

{
  "id": 1
}
```

#### 重新解析文档

```http
POST /document/parse/reparse
Content-Type: application/json

{
  "id": 1
}
```

#### 删除文档

```http
POST /document/delete
Content-Type: application/json

{
  "id": 1
}
```

#### 下载文档

```http
POST /document/download
Content-Type: application/json

{
  "id": 1
}
```

### 对话相关

#### RAG 对话（流式响应）

```http
POST /rag/chat
Content-Type: application/json

{
  "knowledge_base_id": 1,
  "query": "用户问题",
  "k": 5
}
```

响应格式为 Server-Sent Events (SSE)，包含以下事件类型：

- `token`: 文本内容流
- `search_complete`: 检索完成事件
- `sources`: 来源文档信息
- `done`: 响应完成
- `error`: 错误信息

## 开发指南

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 React Hooks 最佳实践
- 使用 Tailwind CSS 进行样式设计
- 组件使用 HeroUI 作为基础 UI 库
- 使用函数式组件和 Hooks

### 添加新功能

1. 在 `src/components` 中创建新组件（当前目录为空，可在此添加组件）
2. 在 `src/lib` 中添加工具函数或 API 调用
3. 在 `src/app/page.tsx` 中集成新功能
4. 遵循现有的代码风格和结构

### 项目说明

- **单页面应用**：当前所有功能都在 `src/app/page.tsx` 中实现
- **组件化**：UI 使用 HeroUI 组件库，可以提取为独立组件
- **状态管理**：使用 React Hooks 进行状态管理
- **类型安全**：使用 TypeScript 接口定义数据结构

### 注意事项

- 文档上传后不会自动解析，需要手动点击"开始解析"按钮
- RAG 对话使用流式响应（SSE），需要正确处理数据流
- 文档下载功能仅在对话中引用了文档时可用
- 确保后端服务正常运行，否则 API 调用会失败

### 构建和部署

```bash
# 构建生产版本
yarn build

# 预览生产构建
yarn start

```

## 许可证

📃 MIT

## 贡献

👏 欢迎Fork本分支使用，并积极提交 Issue

## 邮箱

📮 zha.rui@foxmail.com
