# P01 Merge Order

目标整合分支建议：`codex/p01-integration`

## 推荐合并顺序

1. `codex/p01-d-platform-runtime-baseline`
2. `codex/p01-b-web-shell-baseline`
3. `codex/p01-a-info-publishing-foundation`
4. `codex/p01-c-app-community-finance-foundation`

## 原则

- D 是平台基线，必须最先合并。
- B 依赖 D，且提供 A/C 的 Web shell 接入基线，第二个合并。
- A/C 理论上可互换；默认先 A 后 C。
- 每合并一个分支后运行最小验证，再继续下一个分支。

## 合并前检查

- `git status --short --branch`
- `git fetch --prune`
- 确认 A/B/C/D 四个分支都存在远端。
- 分别查看每个分支相对基准的 diff 摘要。

## 合并后验证

按当前项目可用命令执行：

- `git diff --check`
- `docker compose config --services`
- `docker compose --profile local-db config --services`
- `cd ProjectM-source-code/backend && go test ./...`
- `npm --prefix ProjectM-source-code/frontend run build`
- `npm --prefix mobile run typecheck`
- `npm --prefix mobile test -- --runInBand`

如果某个命令因依赖未安装、环境缺失或真实凭据缺失无法运行，记录原因，不要伪造通过。

## 合并禁令

- 不使用 `git reset --hard`。
- 不重写 A/B/C/D 分支历史。
- 不删除用户已有改动。
- 不把 P02+ 功能混进 P01 整合。
- 不接受真实 `.env` 或密钥进入提交。
