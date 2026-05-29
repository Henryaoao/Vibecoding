import { useMemo, useState } from "react";
import { router, type Href } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PixelTextInput } from "@/components/PixelTextInput";
import { listAnnouncements } from "@/api/announcements";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ModuleListStatus } from "@/components/ModuleListControls";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { AnnouncementItem } from "@/types/domain";

const announcementCategories = ["办公通知", "福利通知", "制度提醒"];
type AnnouncementSort = "newest" | "mostRead";

function signalText(item: AnnouncementItem) {
  const signals = [];
  if (item.pinned) {
    signals.push("置顶");
  }
  if (item.important) {
    signals.push("重要");
  }
  return signals.join(" · ");
}

function sortAnnouncements(items: AnnouncementItem[], sort: AnnouncementSort) {
  return [...items].sort((left, right) => {
    if (sort === "mostRead") {
      return right.readCount - left.readCount;
    }

    return right.publishedAt.localeCompare(left.publishedAt);
  });
}

export default function AnnouncementsScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sort, setSort] = useState<AnnouncementSort>("newest");
  const trimmedSearch = search.trim();
  const queryKey = [
    "mobile",
    "announcements",
    { search: trimmedSearch, category: selectedCategory ?? "all" },
  ];
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      listAnnouncements({ search: trimmedSearch, category: selectedCategory }),
  });

  const categories = useMemo(() => announcementCategories, []);
  const items = useMemo(() => sortAnnouncements(data ?? [], sort), [data, sort]);
  const activeSummary = [
    trimmedSearch ? `关键词：${trimmedSearch}` : null,
    selectedCategory ? `分类：${selectedCategory}` : null,
  ].filter(Boolean);
  const hasActiveControls = Boolean(trimmedSearch) || Boolean(selectedCategory) || sort !== "newest";
  const activeControlsText = `当前筛选：${[trimmedSearch ? `关键词：${trimmedSearch}` : null, selectedCategory ?? null].filter(Boolean).join(" / ") || "全部公告"} / 排序：${sort === "newest" ? "最新优先" : "阅读最多"}`;
  const resetControls = () => {
    setSearch("");
    setSelectedCategory(undefined);
    setSort("newest");
  };

  if (isLoading) {
    return <LoadingState label="正在加载公司公告墙..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="公司公告墙加载失败，请稍后重试"
        retrying={isFetching}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <Screen>
      <PageHeader title="公司公告墙" subtitle="查看已发布公告，可搜索和筛选。" />

      <PixelTextInput
        accessibilityLabel="搜索公告"
        placeholder="搜索标题、摘要、正文或部门"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        <AppButton
          label="全部"
          variant={!selectedCategory ? "primary" : "secondary"}
          onPress={() => setSelectedCategory(undefined)}
        />
        {categories.map((category) => (
          <AppButton
            key={category}
            label={category}
            accessibilityLabel={`按${category}筛选公告`}
            variant={selectedCategory === category ? "primary" : "secondary"}
            onPress={() => setSelectedCategory(category)}
          />
        ))}
      </View>
      <ModuleListStatus
        label="公司公告墙"
        count={items.length}
        activeSummary={activeSummary.length ? `当前筛选：${activeSummary.join(" / ")}` : "当前筛选：全部公告"}
        onReset={
          activeSummary.length
            ? () => {
                setSearch("");
                setSelectedCategory(undefined);
              }
            : undefined
        }
      />

      <View style={styles.filters}>
        <AppButton
          label="最新优先"
          accessibilityLabel="公告按最新优先排序"
          variant={sort === "newest" ? "primary" : "secondary"}
          onPress={() => setSort("newest")}
        />
        <AppButton
          label="阅读最多"
          accessibilityLabel="公告按阅读最多排序"
          variant={sort === "mostRead" ? "primary" : "secondary"}
          onPress={() => setSort("mostRead")}
        />
      </View>

      <View style={styles.controlSummary}>
        <Text style={styles.activeControls}>{activeControlsText}</Text>
        <AppButton
          label="重置"
          accessibilityLabel="重置公告筛选和排序"
          variant="secondary"
          disabled={!hasActiveControls}
          onPress={resetControls}
        />
      </View>

      {items.length === 0 ? (
        <EmptyState title="没有匹配的公告" description="换个关键词、分类或排序方式，或点重置恢复全部公告。" />
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`查看公告 ${item.title}`}
              onPress={() => router.push(`/announcements/${item.id}` as Href)}
              style={({ pressed }) => [pressed ? styles.pressed : null]}
            >
              <View style={styles.cardBody}>
                {signalText(item) ? (
                  <Text style={styles.signal}>{signalText(item)}</Text>
                ) : null}
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.summary}>{item.summary}</Text>
                <Text style={styles.meta}>
                  {item.category} · {item.department}
                </Text>
                <Text style={styles.meta}>
                  有效期 {item.validFrom} 至 {item.validUntil} · 阅读{" "}
                  {item.readCount}
                </Text>
                {item.expired ? (
                  <Text style={styles.expired}>已过期，仍可查询</Text>
                ) : null}
              </View>
            </Pressable>
          </Card>
        ))
      )}
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
  signal: {
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    color: colors.warning,
    fontSize: typography.caption,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
  expired: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
