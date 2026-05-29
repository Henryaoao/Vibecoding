import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { getAdminPortalConfig, updateAdminPortalConfigColumn } from "@/api/admin";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { goBackOrHome } from "@/navigation/backNavigation";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { AdminPortalConfigColumn, ModuleKey } from "@/types/domain";

type ColumnDraft = {
  enabled: boolean;
  display_order: string;
  display_count: string;
};

function draftFromColumn(column: AdminPortalConfigColumn): ColumnDraft {
  return {
    enabled: column.enabled,
    display_order: String(column.display_order),
    display_count: String(column.display_count)
  };
}

function draftMapFromColumns(columns: AdminPortalConfigColumn[]) {
  return columns.reduce<Partial<Record<ModuleKey, ColumnDraft>>>((drafts, column) => {
    drafts[column.key] = draftFromColumn(column);
    return drafts;
  }, {});
}

export default function AdminPortalConfigScreen() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Partial<Record<ModuleKey, ColumnDraft>>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["mobile", "admin", "portal-config"],
    queryFn: getAdminPortalConfig
  });

  useEffect(() => {
    if (query.data?.columns) {
      setDrafts(draftMapFromColumns(query.data.columns));
    }
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: (column: AdminPortalConfigColumn) => {
      const draft = drafts[column.key] ?? draftFromColumn(column);
      return updateAdminPortalConfigColumn({
        key: column.key,
        enabled: draft.enabled,
        display_order: Number(draft.display_order) || 0,
        display_count: Number(draft.display_count) || 0
      });
    },
    onSuccess: (updatedColumn) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof getAdminPortalConfig>>>(["mobile", "admin", "portal-config"], (current) => ({
        columns: (current?.columns ?? []).map((column) => (column.key === updatedColumn.key ? updatedColumn : column))
      }));
      setDrafts((current) => ({
        ...current,
        [updatedColumn.key]: draftFromColumn(updatedColumn)
      }));
      setNotice(`${updatedColumn.key} 已保存`);
    }
  });

  function updateDraft(column: AdminPortalConfigColumn, nextDraft: Partial<ColumnDraft>) {
    setDrafts((current) => ({
      ...current,
      [column.key]: {
        ...(current[column.key] ?? draftFromColumn(column)),
        ...nextDraft
      }
    }));
  }

  if (query.isLoading) {
    return <LoadingState label="正在加载首页栏目配置..." />;
  }

  if (query.error) {
    return <ErrorState message="首页栏目配置加载失败" retrying={query.isFetching} onRetry={() => query.refetch()} />;
  }

  const columns = query.data?.columns ?? [];

  return (
    <Screen>
      <PageHeader title="首页栏目配置" subtitle="按单条栏目保存启用状态、展示顺序和展示数量，不支持批量操作。" />
      {notice ? (
        <Card>
          <Text style={styles.notice}>{notice}</Text>
        </Card>
      ) : null}
      {columns.length ? (
        columns.map((column) => {
          const draft = drafts[column.key] ?? draftFromColumn(column);
          return (
            <Card key={column.key}>
              <Text style={styles.title}>{column.title}</Text>
              <Text style={styles.meta}>栏目 key：{column.key}</Text>
              <Text style={styles.status}>状态：{draft.enabled ? "enabled" : "disabled"}</Text>

              <Text style={styles.label}>展示顺序</Text>
              <TextInput
                accessibilityLabel={`${column.key} display order`}
                keyboardType="number-pad"
                style={styles.input}
                value={draft.display_order}
                onChangeText={(value) => updateDraft(column, { display_order: value })}
              />

              <Text style={styles.label}>展示数量</Text>
              <TextInput
                accessibilityLabel={`${column.key} display count`}
                keyboardType="number-pad"
                style={styles.input}
                value={draft.display_count}
                onChangeText={(value) => updateDraft(column, { display_count: value })}
              />

              <View style={styles.actions}>
                <AppButton
                  label={`${draft.enabled ? "禁用" : "启用"} ${column.key}`}
                  variant="secondary"
                  onPress={() => updateDraft(column, { enabled: !draft.enabled })}
                />
                <AppButton
                  label={`保存 ${column.key}`}
                  onPress={() => mutation.mutate(column)}
                  loading={mutation.isPending && mutation.variables?.key === column.key}
                />
              </View>
            </Card>
          );
        })
      ) : (
        <EmptyState title="暂无首页栏目" description="当前没有可配置的首页栏目。" />
      )}
      <AppButton label="返回" variant="secondary" onPress={goBackOrHome} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  status: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "800"
  },
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
  notice: {
    color: colors.success,
    fontSize: typography.body,
    fontWeight: "700"
  }
});
