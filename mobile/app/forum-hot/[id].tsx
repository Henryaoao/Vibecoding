import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text } from "react-native";
import { getForumHotPost } from "@/api/forumHot";
import { ApiError } from "@/api/errors";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, typography } from "@/theme/tokens";
import type { ForumHotPostDetail } from "@/types/domain";

function metricsText(item: ForumHotPostDetail) {
  return `最新回复 ${item.latestReplyAt} · 浏览 ${item.viewCount} · 评论 ${item.commentCount} · 点赞 ${item.likeCount} · 热度 ${item.hotnessScore}`;
}

export default function ForumHotDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const postId = Array.isArray(id) ? id[0] : id;
  const forumHotQuery = useQuery({
    queryKey: ["mobile", "forum-hot", postId],
    queryFn: () => {
      if (!postId) {
        throw new Error("Forum hot post id is required");
      }
      return getForumHotPost(postId);
    },
    enabled: Boolean(postId)
  });

  if (forumHotQuery.isLoading) {
    return <LoadingState label="正在加载热帖详情..." />;
  }

  if (forumHotQuery.error instanceof ApiError && forumHotQuery.error.status === 404) {
    return <EmptyState title="热帖不存在" description="该热帖可能仍是草稿、已下架或你没有访问权限。" />;
  }

  if (forumHotQuery.error) {
    return <ErrorState message="热帖详情加载失败，请稍后重试" retrying={forumHotQuery.isFetching} onRetry={() => forumHotQuery.refetch()} />;
  }

  if (!forumHotQuery.data) {
    return <EmptyState title="热帖不存在" description="该热帖可能仍是草稿、已下架或你没有访问权限。" />;
  }

  const item = forumHotQuery.data;

  return (
    <Screen>
      <PageHeader title="热帖详情" subtitle="员工论坛热帖聚合详情；移动端不提供互动入口。" />

      <Card>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>{item.author} · 发布时间 {item.publishedAt}</Text>
        <Text style={styles.meta}>{metricsText(item)}</Text>
        <Text style={styles.summary}>{item.summary}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>内容</Text>
        <Text style={styles.body}>{item.body}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  summary: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22
  },
  body: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24
  }
});
