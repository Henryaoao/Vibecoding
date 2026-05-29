import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getAdminDocuments } from "@/api/admin";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { goBackOrHome } from "@/navigation/backNavigation";
import { colors, spacing, typography } from "@/theme/tokens";

export default function AdminDocumentsScreen() {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "admin", "documents"],
    queryFn: getAdminDocuments
  });

  if (isLoading) {
    return <LoadingState label="正在加载文档管理..." />;
  }

  if (error) {
    return <ErrorState message="文档管理加载失败" retrying={isFetching} onRetry={() => refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title="文档管理" subtitle="单条上传/编辑、发布、归档和软删除。" />
      <View style={styles.actions}>
        <AppButton label="新建文档" onPress={() => router.push("/admin/documents/new" as Href)} />
        <AppButton label="返回" variant="secondary" onPress={goBackOrHome} />
      </View>
      {data?.length ? (
        data.map((item) => (
          <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push(`/admin/documents/${item.id}` as Href)}>
            <Card>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>状态：{item.status}</Text>
              <Text style={styles.meta}>分类：{item.category} · {item.file_type.toUpperCase()} · {item.size_label}</Text>
            </Card>
          </Pressable>
        ))
      ) : (
        <EmptyState title="暂无文档" description="点击新建文档保存第一条草稿。" />
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
  }
});
