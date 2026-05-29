import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";
import { getBrief } from "@/api/briefs";
import { ApiError } from "@/api/errors";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, spacing, typography } from "@/theme/tokens";

export default function BriefDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const briefId = Array.isArray(id) ? id[0] : id;
  const briefQuery = useQuery({
    queryKey: ["mobile", "briefs", briefId],
    queryFn: () => {
      if (!briefId) {
        throw new Error("Brief id is required");
      }
      return getBrief(briefId);
    },
    enabled: Boolean(briefId)
  });


  if (briefQuery.isLoading) {
    return <LoadingState label="正在加载简报详情..." />;
  }

  if (briefQuery.error instanceof ApiError && briefQuery.error.status === 404) {
    return (
      <EmptyState
        title="简报不存在"
        description="该简报可能仍是草稿、已归档、已下架或你没有访问权限。"
      />
    );
  }

  if (briefQuery.error) {
    return (
      <ErrorState
        message="简报详情加载失败，请稍后重试"
        retrying={briefQuery.isFetching}
        onRetry={() => briefQuery.refetch()}
      />
    );
  }

  if (!briefQuery.data) {
    return (
      <EmptyState
        title="简报不存在"
        description="该简报可能仍是草稿、已归档、已下架或你没有访问权限。"
      />
    );
  }

  const item = briefQuery.data;

  return (
    <Screen>
      <PageHeader
        title="简报详情"
        subtitle="阅读量仅为展示字段，不记录用户行为。"
      />

      <Card>
        {item.isLatestFallback ? (
          <Text style={styles.signal}>
            展示最近已发布简报：{item.briefDate}
          </Text>
        ) : null}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.department} · {item.source}
        </Text>
        <Text style={styles.summary}>{item.summary}</Text>
        <Text style={styles.meta}>简报日期：{item.briefDate}</Text>
        <Text style={styles.meta}>
          发布时间：{item.publishedAt} · 阅读 {item.readCount}
        </Text>
        <Text style={styles.meta}>更新：{item.updatedAt}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>重点信息</Text>
        <View style={styles.keyPointList}>
          {item.keyPoints.map((point) => (
            <Text key={point} style={styles.keyPoint}>
              {point}
            </Text>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>正文</Text>
        <Text style={styles.body}>{item.body}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  signal: {
    color: colors.warning,
    fontSize: typography.caption,
    fontWeight: "800",
  },
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
  keyPointList: {
    gap: spacing.sm,
  },
  keyPoint: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
  },
});
