import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text } from "react-native";
import { getNewcomerContent } from "@/api/newcomer";
import { ApiError } from "@/api/errors";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, typography } from "@/theme/tokens";

export default function NewcomerContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const contentId = Array.isArray(id) ? id[0] : id;
  const query = useQuery({
    queryKey: ["mobile", "newcomer", "content", contentId],
    queryFn: () => {
      if (!contentId) {
        throw new Error("Newcomer content id is required");
      }
      return getNewcomerContent(contentId);
    },
    enabled: Boolean(contentId)
  });


  if (query.isLoading) {
    return <LoadingState label="正在加载新人资料详情..." />;
  }

  if (query.error instanceof ApiError && query.error.status === 404) {
    return (
      <EmptyState
        title="新人资料不存在"
        description="该资料可能仍是草稿、已下架或你没有访问权限。"
      />
    );
  }

  if (query.error) {
    return (
      <ErrorState
        message="新人资料详情加载失败，请稍后重试"
        retrying={query.isFetching}
        onRetry={() => query.refetch()}
      />
    );
  }

  if (!query.data) {
    return (
      <EmptyState
        title="新人资料不存在"
        description="该资料可能仍是草稿、已下架或你没有访问权限。"
      />
    );
  }

  const item = query.data;

  return (
    <Screen>
      <PageHeader title="新人资料详情" subtitle="查看已发布新人材料。" />

      <Card>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.category} · {item.publishedAt}
        </Text>
        <Text style={styles.summary}>{item.summary}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>正文</Text>
        <Text style={styles.body}>{item.body}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
  summary: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
  },
  body: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: "700",
  },
});
