# 需求文档

## 1. 改动目标
修复 EmailNotifications 集合的 formTypes 字段（select hasMany）保存失败问题，根因是关联表 `email_notifications_form_types` 的 `id` 列缺少 UUID 默认值生成机制。

## 2. 现状 vs 目标
- **现状**：手动创建的 `email_notifications_form_types` 表中 `id varchar PRIMARY KEY` 没有默认值，Payload 插入时传 `default`（NULL）导致违反 NOT NULL 约束
- **目标**：`id` 列使用 `gen_random_uuid()` 作为默认值，让数据库自动生成 UUID

## 3. 改动点说明
- 删除旧的 `email_notifications_form_types` 表
- 重建表结构，`id` 列定义为 `varchar PRIMARY KEY DEFAULT gen_random_uuid()`
- 保留 `order`、`parent_id`、`value` 列及索引和外键约束

## 4. 影响面与调用链
```
用户保存 Email Notification
  → Payload CMS 创建主记录
    → 插入 formTypes 到关联表
      → PostgreSQL 自动生成 UUID（无需应用层传入）
        → 保存成功
```

只影响 `email_notifications_form_types` 表，不影响其他表或功能。

## 5. 回归与兼容风险
| 风险点 | 是否破坏现有行为 | 兼容策略 | 需回归测试的点 |
|--------|-----------------|---------|---------------|
| 删除重建表会丢失已有 formTypes 数据 | 是（但当前无数据） | 空库无影响 | 保存后验证数据正确写入 |
| UUID 格式变化 | 否 | Payload 内部处理 | 查询列表是否正常显示 |

## 6. 涉及文件定位
- `/home/project/server/scripts/fix-email-notifications-save-error.sql` - 需要更新 SQL 脚本，添加 `DEFAULT gen_random_uuid()`

## 7. 验收标准
- [ ] 在 Payload CMS 后台创建 Email Notification，填写所有必填字段（包括 formTypes 选择"询盘"）
- [ ] 点击 Save 按钮，页面显示保存成功提示
- [ ] 刷新页面，新创建的记录出现在列表中
- [ ] 点击记录进入详情页，formTypes 字段正确显示选中的值

## 8. 不改动范围
- EmailNotifications 集合定义（`server/src/collections/EmailNotifications.ts`）不变
- 其他集合和表结构不变
- SMTP 邮件发送逻辑不变