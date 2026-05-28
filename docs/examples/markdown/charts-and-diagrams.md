# 📊 图表和可视化

在现代文档中，图表和可视化是传达复杂信息的强大工具。HyperRead 支持 Mermaid 图表库，让你能够用代码创建专业的图表和图形。

## 🔄 流程图 (Flowchart)

### 基础流程图

```mermaid
graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主界面]
    B -->|否| D[显示登录页面]
    D --> E[用户输入账号密码]
    E --> F{验证成功?}
    F -->|成功| C
    F -->|失败| G[显示错误信息]
    G --> D
    C --> H[结束]
```

### 软件开发流程

```mermaid
graph LR
    A[需求分析] --> B[系统设计]
    B --> C[编码实现]
    C --> D[单元测试]
    D --> E[集成测试]
    E --> F{测试通过?}
    F -->|通过| G[部署上线]
    F -->|失败| H[Bug修复]
    H --> C
    G --> I[运维监控]
    I --> J[用户反馈]
    J --> A
```

### 复杂业务流程

```mermaid
graph TB
    Start([用户访问网站]) --> Auth{用户已登录?}
    Auth -->|否| Login[跳转登录页]
    Auth -->|是| CheckRole{检查用户角色}

    Login --> InputCreds[输入用户名密码]
    InputCreds --> ValidateCreds{验证凭据}
    ValidateCreds -->|失败| ErrorMsg[显示错误信息]
    ValidateCreds -->|成功| SetSession[设置用户会话]
    ErrorMsg --> Login
    SetSession --> CheckRole

    CheckRole -->|管理员| AdminPanel[管理员面板]
    CheckRole -->|普通用户| UserDashboard[用户仪表板]
    CheckRole -->|访客| PublicContent[公开内容]

    AdminPanel --> AdminFunctions[管理功能]
    UserDashboard --> UserFunctions[用户功能]
    PublicContent --> BrowseContent[浏览公开内容]

    AdminFunctions --> End([结束])
    UserFunctions --> End
    BrowseContent --> End
```

## 📈 时序图 (Sequence Diagram)

### API 调用时序图

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端应用
    participant API as API服务器
    participant DB as 数据库

    User->>+Frontend: 点击登录按钮
    Frontend->>+API: POST /api/login
    API->>+DB: 查询用户信息
    DB-->>-API: 返回用户数据
    API->>API: 验证密码
    API-->>-Frontend: 返回JWT令牌
    Frontend->>Frontend: 保存令牌到localStorage
    Frontend-->>-User: 显示登录成功

    Note over User,DB: 用户登录完成

    User->>+Frontend: 访问用户资料页
    Frontend->>+API: GET /api/profile (带JWT)
    API->>API: 验证JWT令牌
    API->>+DB: 查询用户详细信息
    DB-->>-API: 返回详细数据
    API-->>-Frontend: 返回用户资料
    Frontend-->>-User: 显示用户资料
```

### 微服务架构时序图

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant Gateway as API网关
    participant UserService as 用户服务
    participant OrderService as 订单服务
    participant PaymentService as 支付服务
    participant NotificationService as 通知服务

    Client->>+Gateway: 创建订单请求
    Gateway->>+UserService: 验证用户身份
    UserService-->>-Gateway: 用户验证成功

    Gateway->>+OrderService: 创建订单
    OrderService->>OrderService: 生成订单ID
    OrderService-->>-Gateway: 返回订单信息

    Gateway->>+PaymentService: 处理支付
    PaymentService->>PaymentService: 调用第三方支付
    PaymentService-->>-Gateway: 支付成功

    par 并行通知
        Gateway->>+NotificationService: 发送订单确认邮件
        NotificationService-->>-Gateway: 邮件发送成功
    and
        Gateway->>+NotificationService: 发送短信通知
        NotificationService-->>-Gateway: 短信发送成功
    end

    Gateway-->>-Client: 订单创建成功
```

## 🏗️ 类图 (Class Diagram)

### 用户管理系统类图

```mermaid
classDiagram
    class User {
        -id: string
        -username: string
        -email: string
        -password: string
        -createdAt: Date
        +login() boolean
        +logout() void
        +updateProfile() void
        +changePassword() boolean
    }

    class Admin {
        -permissions: string[]
        +manageUsers() void
        +viewSystemLogs() void
        +configureSettings() void
    }

    class RegularUser {
        -profile: UserProfile
        +viewDashboard() void
        +updatePreferences() void
    }

    class UserProfile {
        -firstName: string
        -lastName: string
        -avatar: string
        -bio: string
        +getFullName() string
        +updateAvatar() void
    }

    class AuthService {
        +authenticate(username, password) boolean
        +generateToken(user) string
        +validateToken(token) boolean
    }

    User <|-- Admin
    User <|-- RegularUser
    RegularUser --> UserProfile
    User --> AuthService : uses
```

### 电商系统核心类图

```mermaid
classDiagram
    class Product {
        -id: string
        -name: string
        -price: decimal
        -inventory: int
        -category: Category
        +updatePrice(price) void
        +checkAvailability() boolean
    }

    class Category {
        -id: string
        -name: string
        -description: string
        +getProducts() Product[]
    }

    class Order {
        -id: string
        -userId: string
        -status: OrderStatus
        -total: decimal
        -items: OrderItem[]
        +addItem(product, quantity) void
        +calculateTotal() decimal
        +updateStatus(status) void
    }

    class OrderItem {
        -productId: string
        -quantity: int
        -price: decimal
        +getSubtotal() decimal
    }

    class ShoppingCart {
        -userId: string
        -items: CartItem[]
        +addProduct(product, quantity) void
        +removeProduct(productId) void
        +clear() void
        +checkout() Order
    }

    Product --> Category
    Order --> OrderItem
    OrderItem --> Product
    ShoppingCart --> Product
    ShoppingCart ..> Order : creates
```

## 📊 甘特图 (Gantt Chart)

### 项目开发计划

```mermaid
gantt
    title HyperRead 开发时间线
    dateFormat  YYYY-MM-DD
    section 项目规划
    需求分析           :done,    req1, 2025-08-01, 2025-08-15
    技术选型           :done,    tech1, 2025-08-10, 2025-08-20
    架构设计           :done,    arch1, 2025-08-18, 2025-08-30

    section 核心开发
    基础框架搭建       :done,    core1, 2025-08-25, 2025-09-10
    文件解析模块       :done,    parse1, 2025-09-05, 2025-09-20
    渲染引擎开发       :active,  render1, 2025-09-15, 2025-10-05
    用户界面设计       :active,  ui1, 2025-09-20, 2025-10-10

    section 高级功能
    拖拽功能实现       :done,    drag1, 2025-09-10, 2025-09-17
    缩放功能优化       :done,    zoom1, 2025-09-17, 2025-09-20
    搜索功能开发       :         search1, 2025-10-01, 2025-10-15
    主题系统实现       :         theme1, 2025-10-10, 2025-10-25

    section 测试和发布
    单元测试编写       :         test1, 2025-10-15, 2025-10-30
    集成测试           :         test2, 2025-10-25, 2025-11-10
    性能优化           :         perf1, 2025-11-05, 2025-11-20
    发布准备           :         release1, 2025-11-15, 2025-11-30
```

### 学习计划甘特图

```mermaid
gantt
    title 前端技能学习计划
    dateFormat  YYYY-MM-DD
    section 基础阶段
    HTML5 学习        :done, html, 2025-06-01, 2025-06-15
    CSS3 学习         :done, css, 2025-06-10, 2025-06-30
    JavaScript 基础   :done, js, 2025-06-25, 2025-07-20

    section 框架学习
    React 入门        :active, react, 2025-07-15, 2025-08-15
    Vue.js 学习       :vue, 2025-08-01, 2025-08-30
    Angular 学习      :angular, 2025-08-15, 2025-09-15

    section 工程化
    Webpack 配置      :webpack, 2025-08-20, 2025-09-05
    TypeScript 学习   :ts, 2025-09-01, 2025-09-20
    测试框架学习      :testing, 2025-09-10, 2025-09-30

    section 实战项目
    个人博客系统      :project1, 2025-09-15, 2025-10-15
    电商平台前端      :project2, 2025-10-01, 2025-11-15
    移动端应用        :project3, 2025-11-01, 2025-12-15
```

## 🌊 状态图 (State Diagram)

### 订单状态流转

```mermaid
stateDiagram-v2
    [*] --> Draft : 创建订单
    Draft --> Pending : 提交订单
    Draft --> Cancelled : 取消订单

    Pending --> Confirmed : 确认订单
    Pending --> Cancelled : 取消订单

    Confirmed --> Processing : 开始处理
    Confirmed --> Cancelled : 取消订单

    Processing --> Shipped : 发货
    Processing --> Cancelled : 取消订单

    Shipped --> Delivered : 送达
    Shipped --> Failed : 配送失败

    Failed --> Shipped : 重新发货
    Failed --> Cancelled : 取消订单

    Delivered --> Completed : 确认收货
    Delivered --> Returned : 申请退货

    Returned --> Refunded : 退款完成
    Completed --> [*]
    Cancelled --> [*]
    Refunded --> [*]
```

### 用户登录状态

```mermaid
stateDiagram-v2
    [*] --> Visitor : 首次访问

    Visitor --> LoggingIn : 点击登录
    LoggingIn --> Authenticated : 认证成功
    LoggingIn --> Visitor : 认证失败

    Authenticated --> Active : 正常使用
    Authenticated --> Idle : 用户空闲

    Active --> Idle : 5分钟无操作
    Idle --> Active : 用户操作
    Idle --> SessionExpired : 30分钟超时

    Active --> LoggingOut : 用户登出
    SessionExpired --> Visitor : 自动登出
    LoggingOut --> Visitor : 登出完成

    Visitor --> [*] : 关闭页面
    Active --> [*] : 关闭页面
    Idle --> [*] : 关闭页面
```

## 🎯 Git 工作流图

### Git Flow 分支策略

```mermaid
gitgraph
    commit id: "初始化"
    branch develop
    checkout develop
    commit id: "开发环境搭建"

    branch feature/user-auth
    checkout feature/user-auth
    commit id: "添加登录功能"
    commit id: "添加注册功能"

    checkout develop
    merge feature/user-auth
    commit id: "合并用户认证功能"

    branch feature/file-management
    checkout feature/file-management
    commit id: "文件上传功能"
    commit id: "文件列表显示"

    checkout develop
    merge feature/file-management
    commit id: "合并文件管理功能"

    branch release/v1.0
    checkout release/v1.0
    commit id: "版本1.0准备"
    commit id: "修复发现的bug"

    checkout main
    merge release/v1.0
    commit id: "发布v1.0" tag: "v1.0"

    checkout develop
    merge main
    commit id: "同步主分支"
```

## 🏛️ 实体关系图 (ER Diagram)

### 博客系统数据库设计

```mermaid
erDiagram
    USER ||--o{ POST : writes
    USER {
        int id PK
        string username UK
        string email UK
        string password
        datetime created_at
        datetime updated_at
    }

    POST ||--o{ COMMENT : has
    POST {
        int id PK
        int user_id FK
        string title
        text content
        string status
        datetime created_at
        datetime updated_at
    }

    POST }o--o{ TAG : tagged_with
    TAG {
        int id PK
        string name UK
        string slug UK
        text description
    }

    POST_TAG {
        int post_id FK
        int tag_id FK
    }

    COMMENT {
        int id PK
        int post_id FK
        int user_id FK
        int parent_id FK
        text content
        datetime created_at
    }

    USER ||--o{ COMMENT : makes
    COMMENT ||--o{ COMMENT : replies_to
    POST }o--o{ TAG : POST_TAG
```

## 💭 深度思考：可视化的认知科学

### 1. **视觉认知原理**
- **图形胜过文字** - 人脑处理图像比文字快60,000倍
- **空间记忆** - 位置关系帮助记忆和理解
- **模式识别** - 图表帮助识别数据中的模式和趋势

### 2. **信息架构可视化**
```mermaid
graph TD
    A[原始信息] --> B{信息类型}
    B -->|流程信息| C[流程图]
    B -->|时间信息| D[时序图/甘特图]
    B -->|结构信息| E[类图/组织图]
    B -->|关系信息| F[ER图/网络图]
    B -->|状态信息| G[状态图]

    C --> H[用户理解]
    D --> H
    E --> H
    F --> H
    G --> H
```

### 3. **图表选择决策树**
```mermaid
graph TD
    A[需要可视化的信息] --> B{信息的本质是什么?}
    B -->|过程和步骤| C{有分支判断吗?}
    B -->|时间关系| D{涉及多个参与者?}
    B -->|数据结构| E[类图或ER图]
    B -->|系统状态| F[状态图]

    C -->|有| G[流程图]
    C -->|无| H[线性流程图]

    D -->|是| I[时序图]
    D -->|否| J[甘特图或时间线]
```

### 4. **图表设计原则**

#### 简洁性原则 (Less is More)
- 移除不必要的装饰元素
- 突出关键信息和关系
- 使用一致的视觉语言

#### 层次性原则 (Hierarchy)
```mermaid
graph TD
    A[主要概念] --> B[次要概念1]
    A --> C[次要概念2]
    B --> D[细节1]
    B --> E[细节2]
    C --> F[细节3]
    C --> G[细节4]
```

#### 一致性原则 (Consistency)
- 相同概念使用相同视觉表示
- 保持颜色、形状、大小的一致性
- 统一的命名和标注规范

## 🎨 图表美学指南

### 颜色使用建议
1. **功能性色彩**
   - 🔴 红色：错误、警告、终止状态
   - 🟢 绿色：成功、完成、正常状态
   - 🟡 黄色：警告、等待、进行中
   - 🔵 蓝色：信息、流程、中性状态

2. **语义化色彩**
   - 保持品牌色彩一致性
   - 考虑文化背景中的色彩含义
   - 确保色彩对比度足够（无障碍设计）

### 布局设计原则
1. **从左到右，从上到下** - 符合阅读习惯
2. **重要元素突出** - 使用大小、颜色、位置强调
3. **留白平衡** - 适当的空白增强可读性
4. **对齐规范** - 保持元素的视觉对齐

---

*下一章：[代码和语法高亮](./code-and-highlighting.md) - 代码展示的艺术*