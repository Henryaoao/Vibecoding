import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";
import { getAnnouncement } from "@/api/announcements";
import { ApiError } from "@/api/errors";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, spacing, typography } from "@/theme/tokens";
import type { AnnouncementDetail } from "@/types/domain";

function signalText(item: AnnouncementDetail) {
  const signals = [];
  if (item.pinned) {
    signals.push("置顶");
  }
  if (item.important) {
    signals.push("重要");
  }
  return signals.join(" · ");
}

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const announcementId = Array.isArray(id) ? id[0] : id;
  const announcementQuery = useQuery({
    queryKey: ["mobile", "announcements", announcementId],
    queryFn: () => {
      if (!announcementId) {
        throw new Error("Announcement id is required");
      }
      return getAnnouncement(announcementId);
    },
    enabled: Boolean(announcementId)
  });


  if (announcementQuery.isLoading) {
    return <LoadingState label="正在加载公告详情..." />;
  }

  if (
    announcementQuery.error instanceof ApiError &&
    announcementQuery.error.status === 404
  ) {
    return (
      <EmptyState
        title="公告不存在"
        description="该公告可能仍是草稿、已下架或你没有访问权限。"
      />
    );
  }

  if (announcementQuery.error) {
    return (
      <ErrorState
        message="公告详情加载失败，请稍后重试"
        retrying={announcementQuery.isFetching}
        onRetry={() => announcementQuery.refetch()}
      />
    );
  }

  if (!announcementQuery.data) {
    return (
      <EmptyState
        title="公告不存在"
        description="该公告可能仍是草稿、已下架或你没有访问权限。"
      />
    );
  }

  const item = announcementQuery.data;

  return (
    <Screen>
      <PageHeader
        title="公告详情"
        subtitle="展示公告内容与附件；阅读量仅为展示字段。"
      />

      <Card>
        {signalText(item) ? (
          <Text style={styles.signal}>{signalText(item)}</Text>
        ) : null}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.department} · {item.category}
        </Text>
        <Text style={styles.summary}>{item.summary}</Text>
        <Text style={styles.meta}>
          有效期：{item.validFrom} 至 {item.validUntil}
        </Text>
        <Text style={styles.meta}>
          发布时间：{item.publishedAt} · 阅读 {item.readCount}
        </Text>
        {item.expired ? (
          <Text style={styles.expired}>已过期，仍可查询</Text>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>正文</Text>
        <Text style={styles.body}>{item.body}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>附件</Text>
        {item.attachments.length === 0 ? (
          <Text style={styles.meta}>暂无附件</Text>
        ) : (
          <View style={styles.attachmentList}>
            {item.attachments.map((attachment) => (
              <Text key={attachment.id} style={styles.attachment}>
                {attachment.fileName} · {attachment.sizeLabel}
              </Text>
            ))}
          </View>
        )}
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
  expired: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  attachmentList: {
    gap: spacing.sm,
  },
  attachment: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "700",
  },
});
