import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getAdminNewcomerTasks } from "@/api/admin";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { goBackOrHome } from "@/navigation/backNavigation";
import { colors, spacing, typography } from "@/theme/tokens";

export default function AdminNewcomerTasksScreen() {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "admin", "newcomer-tasks"],
    queryFn: getAdminNewcomerTasks
  });

  if (isLoading) {
    return <LoadingState label="正在加载新人任务管理..." />;
  }

  if (error) {
    return <ErrorState message="新人任务管理加载失败" retrying={isFetching} onRetry={() => refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title="新人任务管理" subtitle="单条创建、编辑、启用和禁用，不支持批量操作。" />
      <View style={styles.actions}>
        <AppButton label="新建新人任务" onPress={() => router.push("/admin/newcomer-tasks/new" as Href)} />
        <AppButton label="返回" variant="secondary" onPress={goBackOrHome} />
      </View>
      {data?.length ? (
        data.map((item) => (
          <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push(`/admin/newcomer-tasks/${item.id}` as Href)}>
            <Card>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>状态：{item.enabled ? "enabled" : "disabled"}</Text>
              <Text style={styles.meta}>排序：{item.sort_order}</Text>
              <Text style={styles.summary}>{item.description}</Text>
            </Card>
          </Pressable>
        ))
      ) : (
        <EmptyState title="暂无新人任务" description="点击新建新人任务保存第一条任务模板。" />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  }
});
