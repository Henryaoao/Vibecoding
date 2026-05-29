# ProjectM 验证与运行检查

## 开发命令

当前文档阶段常用检查：

```bash
rg -n "content_admin|department_admin|system_admin|recent_views|TBD" docs AGENTS.md agentschinese.md README.md
rg -n "user|super_user|pgAdmin|5050|React Native|Expo|股票推荐|买卖建议|投资建议" docs AGENTS.md agentschinese.md README.md
rg -n "mysql|phpMyAdmin|3306|8081|INSERT IGNORE|UNSIGNED|ON UPDATE|utf8mb4" docs AGENTS.md agentschinese.md README.md ProjectM-source-code database
find docs/prd/phases/modules -mindepth 2 -maxdepth 2 -name '*-prd.md' | wc -l
python3 - <<'PY2'
from pathlib import Path
required = ['## 1. 文档状态','## 2. 目标','## 3. 事实来源链接','## 4. 范围内','## 5. 范围外','## 6. 依赖与前置条件','## 7. 需求','## 8. 验收标准','## 9. 验证指针','## 10. OMX 交接','## 11. 决策策略继承']
files = sorted(Path('docs/prd/phases/modules').glob('*/*-prd.md'))
missing = [(str(p), r) for p in files for r in required if r not in p.read_text(encoding='utf-8')]
print({'files': len(files), 'missing': len(missing)})
if missing: raise SystemExit(missing[:10])
PY2
```

实现代码存在后才能声明以下命令通过：

```bash
docker compose up --build
go test ./...
npm test
npm run build
```

## 文档规则

- 规范产品需求保存在 `docs/prd/`。
- AI / Agent 修改权限、文档结构保护、自我验证和交接 gate 保存在 `docs/agents/capability-governance.md`。
- PRD 文档中文优先；代码标识符、路径、API 路径、角色代码和技术栈名称可保留英文。
- 使用 `docs/prd/README.md` 判断事实来源优先级和阅读顺序。
- 稳定项目基线保存在 `docs/prd/projectm-overall-prd.md`。
- 端侧 Web/App 细节保存在 `docs/prd/endpoints/`；App 技术栈为 React Native + TypeScript + Expo，并排除移动端管理写入。
- 角色/Admin 细节保存在 `docs/prd/references/permissions-and-admin-guide.md`。
- 样例/参考内容保存在 `docs/prd/references/sample-data.md`。
- 红线和确认策略保存在 `docs/prd/references/omx-decision-policy.md`。
- 可独立执行的工作切片保存在 `docs/prd/phases/`。
- 不得自行移动、重命名、拆分、合并或删除 `docs/prd/` 下的 PRD 文件；需要改变 PRD 层级或事实来源顺序时必须先获得用户确认。
- 修改模块时，除非用户明确只改某一层，否则应同时检查数据库、后端、Web、App 阶段 PRD 和合同登记表。
- 验收标准要具体，避免只有“快速”“简单”“现代化”等无法验证的描述。

## 实现规则

- 代码存在后优先遵循项目既有模式。
- 保持修改小而可审查。
- 交付角色只能在 `docs/agents/capability-governance.md` 允许的默认范围内修改；跨角色修改必须记录原因和验证结果。
- 进入下一个角色或任务前，当前角色必须完成自我验证并说明未验证项。
- 为实现的行为补充测试。
- 可行时使用结构化解析/API，避免临时字符串拼接。
- 没有明确理由不要新增依赖。
- 用户可见角色限制为 `user` 与 `super_user`。
- `super_user` 管理和写入保留在 Web Admin Console；App 只承载员工门户使用场景。
- 除非用户明确反转决策，不要实现浏览历史。

## 完成前检查清单

汇报完成前，按任务相关性检查：

- 修改文件是有意的。
- `docs/prd/` 事实来源、权限指南、样例数据、阶段 PRD 和合同登记表保持一致。
- 旧角色名没有作为活跃角色重新出现。
- 浏览历史、最近浏览等已排除功能没有被重新引入。
- 财经轻资讯保持非投资建议边界。
- Docker 默认值保持 `frontend:3000`、`backend:8080`、`postgres:5432`、`pgadmin:5050`。
- App 技术栈和管理边界与 `docs/prd/endpoints/app-prd.md`、`docs/prd/references/omx-decision-policy.md` 一致。
- PostgreSQL SQL 不含旧数据库语法，并保留 `TIMESTAMPTZ`、JSONB 检查、外键索引和部分索引方向。
- 如果代码存在并被修改，已运行对应测试或冒烟检查并报告结果。
