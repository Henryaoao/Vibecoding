import { router, type Href } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { listMyDownloads } from "@/api/me";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, spacing, typography } from "@/theme/tokens";

export default function DownloadsScreen() {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "me", "downloads"],
    queryFn: listMyDownloads
  });

  if (isLoading) {
    return <LoadingState label="正在加载下载记录..." />;
  }

  if (error) {
    return <ErrorState message="下载记录加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  const downloads = data ?? [];

  return (
    <Screen>
      <PageHeader title="下载记录" subtitle="仅展示用户显式下载产生的文档记录，不展示浏览或阅读行为。" />

      {downloads.length === 0 ? (
        <EmptyState title="暂无下载记录" description="下载文档后会显示在这里。" />
      ) : (
        downloads.map((download) => (
          <Card key={download.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`查看下载文档 ${download.title}`}
              onPress={() => router.push(`/documents/${download.documentId}` as Href)}
              style={({ pressed }) => [pressed ? styles.pressed : null]}
            >
              <View style={styles.cardBody}>
                <Text style={styles.title}>{download.title}</Text>
                <Text style={styles.summary}>{download.fileName}</Text>
                <Text style={styles.meta}>
                  {download.fileType.toUpperCase()} · {download.sizeLabel} · {download.downloadedAt}
                </Text>
                <Text style={styles.meta}>来源：显式下载记录</Text>
              </View>
            </Pressable>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  summary: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  pressed: {
    opacity: 0.85
  }
});
