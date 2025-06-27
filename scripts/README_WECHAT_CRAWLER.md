# 微信公众号数据更新脚本

这个脚本集合用于从新榜等平台抓取微信公众号的粉丝数据，并更新到Supabase数据库中。

## 文件说明

### 1. `update_wechat_followers.py`
- **功能**: 从新榜抓取公众号数据并更新到Supabase
- **特点**: 
  - 自动搜索公众号
  - 获取真实粉丝数据
  - 包含反爬虫措施（随机延迟）
  - 完整的错误处理和日志记录

### 2. `test_wechat_update.py` 
- **功能**: 测试版本，使用模拟数据更新公众号粉丝数
- **特点**:
  - 无需网络抓取，直接更新数据库
  - 包含常见IC公众号的预设粉丝数
  - 适合测试数据库连接和更新功能

### 3. `run_wechat_update.sh`
- **功能**: Shell脚本，自动化运行Python脚本
- **特点**:
  - 自动检查依赖
  - 环境变量配置
  - 错误处理

## 环境要求

### Python依赖
```bash
pip3 install requests
```

### 环境变量
需要设置以下环境变量：

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
```

## 使用方法

### 方法1: 使用Shell脚本（推荐）
```bash
# 进入项目根目录
cd /path/to/ic123

# 运行脚本（会自动提示输入环境变量）
chmod +x scripts/run_wechat_update.sh
./scripts/run_wechat_update.sh
```

### 方法2: 直接运行Python脚本

#### 测试版本（推荐先运行）
```bash
# 设置环境变量
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"

# 运行测试脚本
python3 scripts/test_wechat_update.py
```

#### 完整版本（从新榜抓取）
```bash
# 设置环境变量
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"

# 运行抓取脚本
python3 scripts/update_wechat_followers.py
```

## 预设公众号数据

测试脚本包含以下公众号的模拟粉丝数据：

| 公众号名称 | 粉丝数 |
|-----------|--------|
| 芯片大师 | 85,000 |
| IC人才网 | 52,000 |
| 芯片设计工程师 | 78,000 |
| EDA技术分享 | 43,000 |
| 数字IC设计 | 65,000 |
| IC设计与验证 | 71,000 |
| 芯师爷 | 120,000 |
| 芯东西 | 180,000 |
| 半导体行业观察 | 95,000 |
| 芯榜 | 68,000 |

## 注意事项

### 1. 新榜抓取限制
- 新榜有反爬虫机制，可能需要登录
- 脚本已包含随机延迟，但仍可能被限制
- 建议使用测试脚本进行初始数据填充

### 2. 数据库权限
- 确保Supabase项目的RLS（行级安全）策略允许更新
- 匿名密钥需要有写入权限

### 3. 日志和监控
- 日志文件保存在 `logs/wechat_crawler.log`
- 建议定期检查日志了解执行情况

## 定期更新

### 使用cron定时任务
```bash
# 编辑crontab
crontab -e

# 添加每天凌晨2点执行的任务
0 2 * * * cd /path/to/ic123 && ./scripts/run_wechat_update.sh >> logs/cron.log 2>&1
```

### 监控脚本
可以添加邮件通知或钉钉通知，在更新完成后发送统计信息。

## 故障排除

### 1. 连接数据库失败
```
ValueError: 请设置 SUPABASE_URL 和 SUPABASE_ANON_KEY 环境变量
```
**解决**: 确保正确设置环境变量

### 2. 权限错误
```
获取公众号列表失败: 401
```
**解决**: 检查Supabase项目的API密钥和权限设置

### 3. 新榜访问失败
```
搜索公众号失败: timeout
```
**解决**: 
- 检查网络连接
- 尝试使用测试脚本
- 调整延迟时间

## 扩展功能

### 1. 其他数据源
可以扩展脚本支持其他公众号数据平台：
- 微信指数
- 清博大数据
- 新媒体指数

### 2. 更多数据字段
可以抓取更多信息：
- 阅读量
- 点赞数
- 文章更新频率
- 头像和简介

### 3. 数据分析
可以添加数据分析功能：
- 粉丝增长趋势
- 公众号排名变化
- 行业分析报告 