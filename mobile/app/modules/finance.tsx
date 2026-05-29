import { useMemo, useState } from "react";
import { router, type Href } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { listFinanceInfo } from "@/api/finance";
import { PixelTextInput } from "@/components/PixelTextInput";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ModuleListStatus } from "@/components/ModuleListControls";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import type { FinanceInfoItem, FinanceInfoTag } from "@/types/domain";
import { colors, radius, spacing, typography } from "@/theme/tokens";

const allFinanceTags: FinanceInfoTag[] = [
  "财经早知道",
  "指数概览",
  "金融小知识",
  "反诈提醒",
  "财经日历",
];

type FinanceSort = "newest" | "source";

function filterFinanceItems(items: FinanceInfoItem[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return items;
  }

  return items.filter((item) =>
    `${item.title} ${item.summary} ${item.source} ${item.tags.join(" ")}`
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

function sortFinanceItems(items: FinanceInfoItem[], sort: FinanceSort) {
  return [...items].sort((left, right) => {
    if (sort === "source") {
      return left.source.localeCompare(right.source, "zh-Hans-CN");
    }

    return right.publishedAt.localeCompare(left.publishedAt);
  });
}

export default function FinanceScreen() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<FinanceInfoTag | undefined>();
  const [sort, setSort] = useState<FinanceSort>("newest");
  const trimmedSearch = search.trim();
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "finance", { tag: selectedTag ?? "all" }],
    queryFn: () => listFinanceInfo({ tag: selectedTag }),
  });

  const visibleTags = useMemo(() => allFinanceTags, []);
  const items = useMemo(
    () => sortFinanceItems(filterFinanceItems(data ?? [], trimmedSearch), sort),
    [data, sort, trimmedSearch],
  );
  const hasActiveControls = Boolean(trimmedSearch) || Boolean(selectedTag) || sort !== "newest";
  const activeControlsText = `当前筛选：${[trimmedSearch ? `关键词：${trimmedSearch}` : null, selectedTag ?? null].filter(Boolean).join(" / ") || "全部财经资讯"} / 排序：${sort === "newest" ? "最新优先" : "来源名称"}`;
  const resetControls = () => {
    setSearch("");
    setSelectedTag(undefined);
    setSort("newest");
  };

  if (isLoading) {
    return <LoadingState label="正在加载财经轻资讯..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="财经轻资讯加载失败，请稍后重试"
        retrying={isFetching}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <Screen>
      <PageHeader title="财经轻资讯" subtitle="super_user 人工发布；不构成投资建议，不提供股票推荐或买卖建议。" />

      <PixelTextInput
        accessibilityLabel="搜索财经资讯"
        placeholder="搜索标题、摘要、来源或标签"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        <AppButton
          label="全部"
          variant={!selectedTag ? "primary" : "secondary"}
          onPress={() => setSelectedTag(undefined)}
        />
        {visibleTags.map((tag) => (
          <AppButton
            key={tag}
            label={tag}
            accessibilityLabel={`按${tag}筛选财经资讯`}
            variant={selectedTag === tag ? "primary" : "secondary"}
            onPress={() => setSelectedTag(tag)}
          />
        ))}
      </View>
      <ModuleListStatus
        label="财经轻资讯"
        count={items.length}
        activeSummary={selectedTag ? `当前筛选：标签：${selectedTag}` : "当前筛选：全部资讯"}
        onReset={selectedTag ? () => setSelectedTag(undefined) : undefined}
      />

      <View style={styles.filters}>
        <AppButton
          label="最新优先"
          accessibilityLabel="财经资讯按最新优先排序"
          variant={sort === "newest" ? "primary" : "secondary"}
          onPress={() => setSort("newest")}
        />
        <AppButton
          label="来源名称"
          accessibilityLabel="财经资讯按来源名称排序"
          variant={sort === "source" ? "primary" : "secondary"}
          onPress={() => setSort("source")}
        />
      </View>

      <View style={styles.controlSummary}>
        <Text style={styles.activeControls}>{activeControlsText}</Text>
        <AppButton
          label="重置"
          accessibilityLabel="重置财经资讯筛选和排序"
          variant="secondary"
          disabled={!hasActiveControls}
          onPress={resetControls}
        />
      </View>

      {items.length === 0 ? (
        <EmptyState
          title="没有匹配的财经资讯"
          description="换个关键词、标签或排序方式，或点重置恢复全部资讯。"
        />
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`查看财经资讯 ${item.title}`}
              onPress={() => router.push(`/finance/${item.id}` as Href)}
              style={({ pressed }) => [pressed ? styles.pressed : null]}
            >
              <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.summary}>{item.summary}</Text>
                <Text style={styles.meta}>
                  {item.source} · {item.publishedAt}
                </Text>
                <Text style={styles.tags}>{item.tags.join(" / ")}</Text>
                <Text style={styles.disclaimerSignal}>非投资建议</Text>
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
  tags: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "700",
  },
  disclaimerSignal: {
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
  pressed: {
    opacity: 0.85,
  },
});
