import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getAdminContents } from "@/api/admin";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { goBackOrHome } from "@/navigation/backNavigation";
import { colors, spacing, typography } from "@/theme/tokens";

export default function AdminContentsScreen() {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "admin", "contents"],
    queryFn: getAdminContents
  });

  if (isLoading) {
    return <LoadingState label="正在加载内容管理..." />;
  }

  if (error) {
    return <ErrorState message="内容管理加载失败" retrying={isFetching} onRetry={() => refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title="内容管理" subtitle="单条创建、编辑、发布、归档和软删除。" />
      <View style={styles.actions}>
        <AppButton label="新建内容" onPress={() => router.push("/admin/contents/new" as Href)} />
        <AppButton label="返回" variant="secondary" onPress={goBackOrHome} />
      </View>
      {data?.length ? (
        data.map((item) => (
          <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push(`/admin/contents/${item.id}` as Href)}>
            <Card>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>状态：{item.status}</Text>
              <Text style={styles.meta}>类型：{item.type} · 分类：{item.category}</Text>
              <Text style={styles.summary}>{item.summary}</Text>
            </Card>
          </Pressable>
        ))
      ) : (
        <EmptyState title="暂无内容" description="点击新建内容保存第一条草稿。" />
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
