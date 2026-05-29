import { useMemo, useState } from "react";
import { router, type Href } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { PixelTextInput } from "@/components/PixelTextInput";
import { listForumHotPosts } from "@/api/forumHot";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ModuleListStatus } from "@/components/ModuleListControls";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { ForumHotPostItem } from "@/types/domain";

function metricsText(item: ForumHotPostItem) {
  return `最新回复 ${item.latestReplyAt} · 浏览 ${item.viewCount} · 评论 ${item.commentCount} · 点赞 ${item.likeCount} · 热度 ${item.hotnessScore}`;
}

function isAllowedForumUrl(url: string) {
  return /^https:\/\/forum\.projectm\.local\//.test(url);
}

async function openExternalForumLink(item: ForumHotPostItem) {
  if (!item.externalUrl || !isAllowedForumUrl(item.externalUrl)) {
    return false;
  }

  const canOpen = await Linking.canOpenURL(item.externalUrl);
  if (!canOpen) {
    return false;
  }

  await Linking.openURL(item.externalUrl);
  return true;
}

type ForumHotFilter = "all" | "detail" | "external";
type ForumHotSort = "hotness" | "latestReply";

function filterForumPosts(items: ForumHotPostItem[], search: string, filter: ForumHotFilter) {
  const normalizedSearch = search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesFilter = filter === "all" || item.linkType === filter;
    const matchesSearch = !normalizedSearch || `${item.title} ${item.summary} ${item.author}`.toLowerCase().includes(normalizedSearch);
    return matchesFilter && matchesSearch;
  });
}

function sortForumPosts(items: ForumHotPostItem[], sort: ForumHotSort) {
  return [...items].sort((left, right) => {
    if (sort === "latestReply") {
      return right.latestReplyAt.localeCompare(left.latestReplyAt);
    }

    return right.hotnessScore - left.hotnessScore;
  });
}

export default function ForumHotScreen() {
  const [externalLinkError, setExternalLinkError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ForumHotFilter>("all");
  const [sort, setSort] = useState<ForumHotSort>("hotness");
  const trimmedSearch = search.trim();
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "forum-hot"],
    queryFn: listForumHotPosts,
  });

  const items = useMemo(
    () => sortForumPosts(filterForumPosts(data ?? [], trimmedSearch, selectedFilter), sort),
    [data, selectedFilter, sort, trimmedSearch],
  );
  const hasActiveControls = Boolean(trimmedSearch) || selectedFilter !== "all" || sort !== "hotness";
  const activeControlsText = `当前筛选：${[trimmedSearch ? `关键词：${trimmedSearch}` : null, selectedFilter === "detail" ? "站内详情" : selectedFilter === "external" ? "外部论坛链接" : null].filter(Boolean).join(" / ") || "全部热帖"} / 排序：${sort === "hotness" ? "热度优先" : "最新回复"}`;
  const statusSummaryText = `当前筛选：${[trimmedSearch ? `关键词：${trimmedSearch}` : null, selectedFilter === "detail" ? "站内详情" : selectedFilter === "external" ? "外部论坛链接" : null].filter(Boolean).join(" / ") || "全部热帖"} · ${sort === "hotness" ? "热度优先" : "最新回复"}`;
  const resetControls = () => {
    setSearch("");
    setSelectedFilter("all");
    setSort("hotness");
  };

  if (isLoading) {
    return <LoadingState label="正在加载员工论坛热帖..." />;
  }

  if (error) {
    return <ErrorState message="员工论坛热帖加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title="员工论坛热帖" subtitle="聚合最近热门、最新回复和每周话题；移动端只读展示。" />
      {externalLinkError ? <Text style={styles.error}>{externalLinkError}</Text> : null}
      <PixelTextInput
        accessibilityLabel="搜索热帖"
        placeholder="搜索标题、摘要或作者"
        value={search}
        onChangeText={setSearch}
      />
      <ModuleListStatus
        label="员工论坛热帖"
        count={items.length}
        activeSummary={statusSummaryText}
        onReset={hasActiveControls ? resetControls : undefined}
      />

      <View style={styles.filters}>
        <AppButton label="全部" variant={selectedFilter === "all" ? "primary" : "secondary"} onPress={() => setSelectedFilter("all")} />
        <AppButton label="站内详情" accessibilityLabel="筛选站内详情热帖" variant={selectedFilter === "detail" ? "primary" : "secondary"} onPress={() => setSelectedFilter("detail")} />
        <AppButton label="外部链接" accessibilityLabel="筛选外部链接热帖" variant={selectedFilter === "external" ? "primary" : "secondary"} onPress={() => setSelectedFilter("external")} />
      </View>

      <View style={styles.filters}>
        <AppButton label="热度优先" accessibilityLabel="热帖按热度优先排序" variant={sort === "hotness" ? "primary" : "secondary"} onPress={() => setSort("hotness")} />
        <AppButton label="最新回复" accessibilityLabel="热帖按最新回复排序" variant={sort === "latestReply" ? "primary" : "secondary"} onPress={() => setSort("latestReply")} />
      </View>

      <View style={styles.controlSummary}>
        <Text style={styles.activeControls}>{activeControlsText}</Text>
        <AppButton label="重置" accessibilityLabel="重置热帖筛选和排序" variant="secondary" disabled={!hasActiveControls} onPress={resetControls} />
      </View>

      {items.length === 0 ? (
        <EmptyState title="没有匹配的热帖" description="换个关键词、链接类型或排序方式，或点重置恢复全部热帖。" />
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.linkType === "external" ? "打开外部热帖" : "查看热帖"} ${item.title}`}
              onPress={async () => {
                setExternalLinkError(null);
                if (item.linkType === "external") {
                  const opened = await openExternalForumLink(item);
                  if (!opened) {
                    setExternalLinkError("外部链接暂不可用，请稍后在公司论坛中查看。");
                  }
                  return;
                }

                router.push(`/forum-hot/${item.id}` as Href);
              }}
              style={({ pressed }) => [pressed ? styles.pressed : null]}
            >
              <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.summary}>{item.summary}</Text>
                <Text style={styles.meta}>{item.author} · 发布时间 {item.publishedAt}</Text>
                <Text style={styles.meta}>{metricsText(item)}</Text>
                <Text style={styles.signal}>{item.linkType === "external" ? "外部论坛链接" : "站内详情"}</Text>
              </View>
            </Pressable>
          </Card>
        ))
      )}

      <AppButton label="刷新热帖" variant="secondary" loading={isFetching} onPress={() => refetch()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  controlSummary: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  activeControls: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: typography.body,
  },
  cardBody: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
  },
  summary: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
  signal: {
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  error: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: "700",
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
});
