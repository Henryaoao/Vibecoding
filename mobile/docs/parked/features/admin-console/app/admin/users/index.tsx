import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getAdminUsers } from "@/api/admin";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { goBackOrHome } from "@/navigation/backNavigation";
import { colors, spacing, typography } from "@/theme/tokens";

export default function AdminUsersScreen() {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "admin", "users"],
    queryFn: getAdminUsers
  });

  if (isLoading) {
    return <LoadingState label="正在加载用户管理..." />;
  }

  if (error) {
    return <ErrorState message="用户管理加载失败" retrying={isFetching} onRetry={() => refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title="用户管理" subtitle="单条创建、编辑、禁用和分配 user 或 super_user，不支持批量操作。" />
      <View style={styles.actions}>
        <AppButton label="新建用户" onPress={() => router.push("/admin/users/new" as Href)} />
        <AppButton label="返回" variant="secondary" onPress={goBackOrHome} />
      </View>
      {data?.length ? (
        data.map((item) => (
          <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push(`/admin/users/${item.id}` as Href)}>
            <Card>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.meta}>角色：{item.role}</Text>
              <Text style={styles.meta}>状态：{item.enabled ? "enabled" : "disabled"}</Text>
              <Text style={styles.summary}>{item.department} · {item.email}</Text>
            </Card>
          </Pressable>
        ))
      ) : (
        <EmptyState title="暂无用户" description="点击新建用户保存第一条用户记录。" />
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
