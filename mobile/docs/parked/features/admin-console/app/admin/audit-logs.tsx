import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { getAdminAuditLogs } from "@/api/admin";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { goBackOrHome } from "@/navigation/backNavigation";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { AdminAuditLogAction, AdminAuditLogItem } from "@/types/domain";

export default function AdminAuditLogsScreen() {
  const [draftQuery, setDraftQuery] = useState("");
  const [draftAction, setDraftAction] = useState<AdminAuditLogAction | "">("");
  const [filters, setFilters] = useState({ query: "", action: "" as AdminAuditLogAction | "" });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["mobile", "admin", "audit-logs", filters],
    queryFn: () => getAdminAuditLogs(filters)
  });

  const subtitle = useMemo(() => {
    const total = query.data?.total ?? 0;
    return `只读审计日志，可搜索和按动作过滤；当前 ${total} 条。`;
  }, [query.data?.total]);

  function applyFilters() {
    setExpandedId(null);
    setFilters({ query: draftQuery.trim(), action: draftAction });
  }

  if (query.isLoading) {
    return <LoadingState label="正在加载审计日志..." />;
  }

  if (query.error) {
    return <ErrorState message="审计日志加载失败" retrying={query.isFetching} onRetry={() => query.refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title="审计日志" subtitle={subtitle} />
      <Card>
        <Text style={styles.label}>搜索</Text>
        <TextInput
          placeholder="搜索操作者、动作或资源 ID"
          style={styles.input}
          value={draftQuery}
          onChangeText={setDraftQuery}
        />
        <Text style={styles.label}>动作</Text>
        <TextInput
          accessibilityLabel="动作过滤"
          placeholder="create / update / publish / archive / disable / login"
          style={styles.input}
          value={draftAction}
          onChangeText={(value) => setDraftAction(value as AdminAuditLogAction | "")}
        />
        <View style={styles.actions}>
          <AppButton label="应用筛选" onPress={applyFilters} />
          <AppButton label="返回" variant="secondary" onPress={goBackOrHome} />
        </View>
      </Card>

      {query.data?.items.length ? (
        query.data.items.map((item) => (
          <AuditLogCard key={item.id} item={item} expanded={expandedId === item.id} onPress={() => setExpandedId(expandedId === item.id ? null : item.id)} />
        ))
      ) : (
        <EmptyState title="暂无审计日志" description="调整搜索词或动作过滤后重试。" />
      )}
    </Screen>
  );
}

function AuditLogCard({ item, expanded, onPress }: { item: AdminAuditLogItem; expanded: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card>
        <Text style={styles.title}>{item.actor_name}</Text>
        <Text style={styles.meta}>动作：{item.action} · 资源：{item.resource_type}</Text>
        <Text style={styles.summary}>{item.summary}</Text>
        <Text style={styles.meta}>时间：{item.created_at}</Text>
        {expanded ? (
          <View style={styles.details}>
            <Text style={styles.detail}>操作者：{item.actor_name}</Text>
            <Text style={styles.detail}>资源类型：{item.resource_type}</Text>
            <Text style={styles.detail}>资源 ID：{item.resource_id}</Text>
            <Text style={styles.detail}>IP：{item.ip_address}</Text>
            <Text style={styles.detail}>User-Agent：{item.user_agent}</Text>
            <Text style={styles.notice}>仅展示安全审计元数据，敏感内容已被排除。</Text>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body,
    backgroundColor: colors.background
  },
  actions: {
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  meta: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  summary: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  },
  details: {
    gap: spacing.xs,
    paddingTop: spacing.sm
  },
  detail: {
    color: colors.text,
    fontSize: typography.body
  },
  notice: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18
  }
});
