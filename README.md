# 资源检索系统（wx-mp-pan）

一个基于 **Spring Boot + SQLite + MapDB + 原生前端** 的资源检索与后台管理项目。

项目包含：
- 前台检索页（全文检索、热度排序、复制链接、提交资源、提交屏蔽词）
- 管理后台（分类管理、资源审核与管理、屏蔽词审核与管理、站点配置、埋点报表）
- 埋点系统（事件、路径、UA、设备 ID、访问 IP）

---

## 1. 技术栈

- 后端：Java 21、Spring Boot 3.5.6
- 数据访问：Spring JDBC
- 数据库：SQLite（`resource.db`）
- 热门关键词计数：MapDB（默认文件 `search-cache.db`）
- 前端：静态 HTML/CSS/JS（无构建）
- 测试：Spring Boot Test、Spring Security Test、MockMvc

---

## 2. 核心功能

### 前台功能
- 关键词检索（FTS5 全文检索）
- 排序方式：相关度 / 时间 / 热度
- 搜索结果支持复制链接，复制成功后资源热度 `heat_score +1`
- 首页展示：
  - 已上线资源总数
  - 热门搜索词（来自 MapDB 计数）
- 用户可提交资源（进入待审核）
- 用户可提交屏蔽词（进入待审核）
- 可配置前台网站标题和注入 `<head>` 脚本

### 后台功能（需要登录）
- 分类管理（增删改查）
- 资源审核（待审核通过/拒绝）
- 资源管理（直接新增上线、分页搜索、删除）
- 屏蔽词审核（通过/拒绝）
- 屏蔽词管理（直接新增生效、删除）
- 站点配置（标题、head 脚本、埋点开关与事件勾选）
- 埋点报表（总览 + 明细筛选分页）

### 埋点能力
- 前台事件上报到 `/api/track`
- 存储字段包括：
  - `event`
  - `path`
  - `props_json`
  - `user_agent`
  - `device_id`
  - `ip_address`
  - `created_at`

---

## 3. 快速开始

### 3.1 环境要求
- JDK 21+
- Maven 3.9+

### 3.2 启动项目

```bash
mvn spring-boot:run
```

默认端口：`8080`

前台首页：`http://127.0.0.1:8080/`  
后台登录页：`http://127.0.0.1:8080/admin/login.html`

### 3.3 后台默认账号

`application.yml` 默认：
- 用户名：`admin`
- 密码：`admin321`

建议生产环境通过环境变量覆盖：

```bash
export APP_ADMIN_PASSWORD='your-strong-password'
mvn spring-boot:run
```

---

## 4. 配置说明

配置文件：`src/main/resources/application.yml`

### 已有配置
- `spring.datasource.url`：SQLite 连接（默认 `jdbc:sqlite:./resource.db`）
- `server.port`：服务端口（默认 `8080`）
- `app.admin.username`：后台用户名
- `app.admin.password`：后台密码（支持 `APP_ADMIN_PASSWORD`）

### 可选配置（代码已支持）
- `app.mapdb.in-memory`：是否启用 MapDB 内存模式（默认 `false`）
  - `false`：写入文件 `search-cache.db`
  - `true`：仅内存（重启丢失）

---

## 5. 目录结构（关键）

```text
src/main/java/com/github/cooker/pan/
  config/         # 安全、数据库迁移、MapDB 配置
  controller/     # API 控制器
  service/        # 业务逻辑
  repository/     # JDBC 访问层
  dto/            # 请求/响应模型
  search/         # 排序枚举等

src/main/resources/
  application.yml
  schema.sql
  static/
    index.html
    css/
    js/
    admin/
      index.html
      login.html
      css/
      js/
        admin-app.js
        components/
          layout/
          pages/
          shared/

src/test/java/com/github/cooker/pan/
  AdminSecurityIntegrationTest.java
  ResourceSearchIntegrationTest.java
```

---

## 6. API 概览

> 以下仅列核心接口，完整细节以 Controller 为准。

### 前台公开接口
- `POST /api/search`：搜索资源
- `POST /api/resources`：提交资源（待审核）
- `POST /api/resources/{id}/heat`：资源热度 +1（复制成功触发）
- `POST /api/blocked-keywords`：提交屏蔽词（待审核）
- `GET /api/home/stats`：首页统计（总数 + 热词）
- `GET /api/site/config`：读取公开站点配置
- `POST /api/track`：埋点上报

### 后台接口（`/api/admin/**`，需管理员）
- 分类：`/api/admin/categories`
- 资源：`/api/admin/resources/**`
- 屏蔽词：`/api/admin/blocked-keywords/**`
- 站点配置：`/api/admin/site-config`
- 埋点报表：`/api/admin/analytics/overview`、`/api/admin/analytics/events`

---

## 7. 数据库与迁移

- 初始化脚本：`src/main/resources/schema.sql`
- 运行时迁移：`SchemaMigration`
  - 会自动补齐历史库缺失列（如 `heat_score`、`tracking_events`、`device_id`、`ip_address` 等）

说明：
- `schema.sql` 是初始建库基线
- 历史库升级依赖 `SchemaMigration` 自动补列，避免手工改表

---

## 8. 后台权限与静态资源

`SecurityConfig` 规则要点：
- `/api/admin/**` 仅 `ROLE_ADMIN` 可访问
- `/admin/**` 页面需登录
- 登录页及登录所需静态资源放行：
  - `/admin/login.html`
  - `/admin/perform_login`
  - `/admin/css/**`
  - `/admin/js/**`

---

## 9. 测试与质量

### 运行测试

```bash
mvn test
```

当前有两个主要集成测试类：
- `AdminSecurityIntegrationTest`
- `ResourceSearchIntegrationTest`

---

## 10. 常见问题（FAQ）

### Q1：后台页面空白/菜单右侧不显示？
- 确认浏览器控制台是否有 404 或 MIME 报错
- 确认 `/admin/js/**` 与 `/admin/css/**` 已放行（见 `SecurityConfig`）
- 清缓存强刷（`Cmd + Shift + R`）

### Q2：`Refused to apply style ... MIME type text/html`？
- 说明 CSS 请求被重定向成了 HTML（通常是权限拦截）
- 检查样式 URL 是否正确，以及静态资源放行规则

### Q3：热门搜索词为何重启后可能变化？
- 热词统计存于 MapDB
- 若启用内存模式 `app.mapdb.in-memory=true`，重启后会清空

---

## 11. 生产使用建议

- 覆盖默认管理员密码
- 在反向代理层正确透传 `X-Forwarded-For` / `X-Real-IP`
- 定期备份 `resource.db` 与 `search-cache.db`
- 若有隐私合规要求，可对 `ip_address` 做脱敏存储

---

## 12. License

当前仓库未声明开源许可证。如需开源，请补充 `LICENSE` 文件并在此处说明。
