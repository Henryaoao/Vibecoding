import { useMemo, useState } from "react";
import { router, type Href } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PixelTextInput } from "@/components/PixelTextInput";
import { listBriefs } from "@/api/briefs";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ModuleListStatus } from "@/components/ModuleListControls";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { BriefItem } from "@/types/domain";

type BriefSort = "newest" | "oldest";

function sortBriefs(items: BriefItem[], sort: BriefSort) {
  return [...items].sort((left, right) => {
    const result = left.briefDate.localeCompare(right.briefDate);
    return sort === "newest" ? -result : result;
  });
}

export default function BriefsScreen() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<BriefSort>("newest");
  const trimmedSearch = search.trim();
  const queryKey = ["mobile", "briefs", { search: trimmedSearch }];
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () => listBriefs({ search: trimmedSearch })
  });

  const items = useMemo(() => sortBriefs(data ?? [], sort), [data, sort]);
  const hasActiveControls = Boolean(trimmedSearch) || sort !== "newest";
  const activeControlsText = `当前筛选：${trimmedSearch ? `关键词：${trimmedSearch}` : "全部简报"} / 排序：${sort === "newest" ? "最新优先" : "最早优先"}`;
  const resetControls = () => {
    setSearch("");
    setSort("newest");
  };

  if (isLoading) {
    return <LoadingState label="正在加载今日公司简报..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="今日公司简报加载失败，请稍后重试"
        retrying={isFetching}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <Screen>
      <PageHeader title="今日公司简报" subtitle="查看已发布简报，可搜索重点信息。" />

      <PixelTextInput
        accessibilityLabel="搜索简报"
        placeholder="搜索标题、摘要、正文、来源或部门"
        value={search}
        onChangeText={setSearch}
      />
      <ModuleListStatus
        label="今日公司简报"
        count={items.length}
        activeSummary={trimmedSearch ? `当前筛选：关键词：${trimmedSearch}` : "当前筛选：全部简报"}
        onReset={trimmedSearch ? () => setSearch("") : undefined}
      />

      <View style={styles.filters}>
        <AppButton
          label="最新优先"
          accessibilityLabel="简报按最新优先排序"
          variant={sort === "newest" ? "primary" : "secondary"}
          onPress={() => setSort("newest")}
        />
        <AppButton
          label="最早优先"
          accessibilityLabel="简报按最早优先排序"
          variant={sort === "oldest" ? "primary" : "secondary"}
          onPress={() => setSort("oldest")}
        />
      </View>

      <View style={styles.controlSummary}>
        <Text style={styles.activeControls}>{activeControlsText}</Text>
        <AppButton
          label="重置"
          accessibilityLabel="重置简报筛选和排序"
          variant="secondary"
          disabled={!hasActiveControls}
          onPress={resetControls}
        />
      </View>

      {items.length === 0 ? (
        <EmptyState
          title="没有匹配的简报"
          description="换个关键词、排序方式，或点重置恢复全部简报。"
        />
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`查看简报 ${item.title}`}
              onPress={() => router.push(`/briefs/${item.id}` as Href)}
              style={({ pressed }) => [pressed ? styles.pressed : null]}
            >
              <View style={styles.cardBody}>
                {item.isLatestFallback ? (
                  <Text style={styles.signal}>
                    展示最近已发布简报：{item.briefDate}
                  </Text>
                ) : null}
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.summary}>{item.summary}</Text>
                <Text style={styles.meta}>
                  简报日期 {item.briefDate} · 更新 {item.updatedAt}
                </Text>
                <View style={styles.keyPointList}>
                  {item.keyPoints.map((point) => (
                    <Text key={point} style={styles.keyPoint}>
                      {point}
                    </Text>
                  ))}
                </View>
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
  keyPointList: {
    gap: spacing.xs,
  },
  keyPoint: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.85,
  },
});
