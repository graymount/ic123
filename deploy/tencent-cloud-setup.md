# 腾讯云部署指南

## 数据库选择

### 方案一：腾讯云PostgreSQL（推荐）
- 兼容性最好，无需修改现有SQL
- 支持JSON字段和数组
- 价格：基础版约100-200元/月

### 方案二：腾讯云MySQL 8.0
- 性价比高
- 需要调整部分SQL语法
- 价格：基础版约80-150元/月

## 部署步骤

### 1. 创建腾讯云数据库实例

#### PostgreSQL配置
- 规格：1核2GB（测试环境）
- 存储：50GB SSD
- 网络：私有网络VPC
- 安全组：开放5432端口

#### MySQL配置  
- 规格：1核2GB（测试环境）
- 存储：50GB SSD
- 版本：MySQL 8.0
- 网络：私有网络VPC
- 安全组：开放3306端口

### 2. 网络配置
```bash
# 安全组规则
入站规则：
- 协议：TCP
- 端口：5432（PostgreSQL）或3306（MySQL）
- 来源：0.0.0.0/0（或指定IP）

# 白名单设置
允许的IP地址：
- 你的开发机器IP
- 服务器IP（如果部署到云服务器）
```

### 3. 数据库初始化
```sql
-- 创建数据库
CREATE DATABASE ic123;

-- 创建用户
CREATE USER ic123_user WITH PASSWORD 'your_strong_password';

-- 授权
GRANT ALL PRIVILEGES ON DATABASE ic123 TO ic123_user;
```

## 环境变量配置

### PostgreSQL
```env
# 腾讯云PostgreSQL
DATABASE_URL=postgresql://ic123_user:password@your-host:5432/ic123
DB_HOST=your-postgres-host.tencentcdb.com
DB_PORT=5432
DB_NAME=ic123
DB_USER=ic123_user
DB_PASSWORD=your_strong_password
```

### MySQL
```env
# 腾讯云MySQL
DATABASE_URL=mysql://ic123_user:password@your-host:3306/ic123
DB_HOST=your-mysql-host.tencentcdb.com
DB_PORT=3306
DB_NAME=ic123
DB_USER=ic123_user
DB_PASSWORD=your_strong_password
```

## 成本估算

### PostgreSQL
- 基础版1核2GB：约150元/月
- 存储50GB：约15元/月
- 总计：约165元/月

### MySQL
- 基础版1核2GB：约120元/月
- 存储50GB：约12元/月  
- 总计：约132元/月

## 性能优化建议

1. **选择合适的地域**：选择离用户最近的地域
2. **配置连接池**：使用pg-pool或MySQL连接池
3. **启用慢查询日志**：监控性能问题
4. **定期备份**：设置自动备份策略 