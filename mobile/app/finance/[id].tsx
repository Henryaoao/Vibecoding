import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text } from "react-native";
import { getFinanceInfo } from "@/api/finance";
import { ApiError } from "@/api/errors";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, typography } from "@/theme/tokens";

export default function FinanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const financeInfoId = Array.isArray(id) ? id[0] : id;
  const financeQuery = useQuery({
    queryKey: ["mobile", "finance", financeInfoId],
    queryFn: () => {
      if (!financeInfoId) {
        throw new Error("Finance info id is required");
      }
      return getFinanceInfo(financeInfoId);
    },
    enabled: Boolean(financeInfoId)
  });


  if (financeQuery.isLoading) {
    return <LoadingState label="正在加载财经资讯..." />;
  }

  if (
    financeQuery.error instanceof ApiError &&
    financeQuery.error.status === 404
  ) {
    return (
      <EmptyState
        title="资讯不存在"
        description="该财经资讯可能已下架或你没有访问权限。"
      />
    );
  }

  if (financeQuery.error) {
    return (
      <ErrorState
        message="财经资讯加载失败，请稍后重试"
        retrying={financeQuery.isFetching}
        onRetry={() => financeQuery.refetch()}
      />
    );
  }

  if (!financeQuery.data) {
    return (
      <EmptyState
        title="资讯不存在"
        description="该财经资讯可能已下架或你没有访问权限。"
      />
    );
  }

  const item = financeQuery.data;

  return (
    <Screen>
      <PageHeader
        title="财经轻资讯详情"
        subtitle="仅展示 super_user 人工确认的内部资讯。"
      />

      <Card>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.source} · {item.publishedAt}
        </Text>
        <Text style={styles.tags}>{item.tags.join(" / ")}</Text>
        <Text style={styles.curated}>
          发布确认：{item.curatedByRole} 人工发布
        </Text>
        <Text style={styles.summary}>{item.summary}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>正文</Text>
        <Text style={styles.body}>{item.body}</Text>
      </Card>

      <Card>
        <Text style={styles.disclaimerTitle}>免责声明</Text>
        <Text style={styles.disclaimer}>{item.disclaimer}</Text>
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
  tags: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "700",
  },
  curated: {
    color: colors.success,
    fontSize: typography.body,
    fontWeight: "700",
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
  disclaimerTitle: {
    color: colors.warning,
    fontSize: typography.body,
    fontWeight: "800",
  },
  disclaimer: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
  },
});
