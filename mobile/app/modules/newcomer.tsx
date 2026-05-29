import { useMemo, useState } from "react";
import { router, type Href } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PixelTextInput } from "@/components/PixelTextInput";
import { completeMyNewcomerTask, listMyNewcomerTasks, listNewcomerContent } from "@/api/newcomer";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ModuleListStatus } from "@/components/ModuleListControls";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, spacing, typography } from "@/theme/tokens";
import type { MyNewcomerTaskItem, NewcomerContentItem } from "@/types/domain";

type NewcomerTaskFilter = "all" | "todo" | "done";
type NewcomerSort = "newest" | "category";
type NewcomerTaskSort = "order" | "status";

function sortContentItems(items: NewcomerContentItem[], sort: NewcomerSort) {
  return [...items].sort((left, right) => {
    if (sort === "category") {
      const categoryResult = left.category.localeCompare(right.category, "zh-Hans-CN");
      return categoryResult || right.publishedAt.localeCompare(left.publishedAt);
    }

    return right.publishedAt.localeCompare(left.publishedAt);
  });
}

function filterTaskItems(items: MyNewcomerTaskItem[], filter: NewcomerTaskFilter) {
  return items.filter((task) => {
    if (filter === "todo") {
      return !task.completed;
    }
    if (filter === "done") {
      return task.completed;
    }
    return true;
  });
}

function sortTaskItems(items: MyNewcomerTaskItem[], sort: NewcomerTaskSort) {
  return [...items].sort((left, right) => {
    if (sort === "status") {
      if (left.completed !== right.completed) {
        return Number(left.completed) - Number(right.completed);
      }
    }

    return left.sort_order - right.sort_order;
  });
}

export default function NewcomerScreen() {
  const [search, setSearch] = useState("");
  const [contentSort, setContentSort] = useState<NewcomerSort>("newest");
  const [taskFilter, setTaskFilter] = useState<NewcomerTaskFilter>("all");
  const [taskSort, setTaskSort] = useState<NewcomerTaskSort>("order");
  const queryClient = useQueryClient();
  const trimmedSearch = search.trim();
  const contentQueryKey = [
    "mobile",
    "newcomer",
    "content",
    { search: trimmedSearch },
  ];
  const tasksQueryKey = ["mobile", "me", "newcomer-tasks"];

  const contentQuery = useQuery({
    queryKey: contentQueryKey,
    queryFn: () => listNewcomerContent({ search: trimmedSearch }),
  });
  const tasksQuery = useQuery({
    queryKey: tasksQueryKey,
    queryFn: listMyNewcomerTasks,
  });

  const completeMutation = useMutation({
    mutationFn: (task: MyNewcomerTaskItem) => completeMyNewcomerTask(task.id),
    onSuccess: async (task) => {
      queryClient.setQueryData<MyNewcomerTaskItem[]>(tasksQueryKey, (current) =>
        current?.map((candidate) =>
          candidate.id === task.id ? task : candidate,
        ),
      );
      queryClient.setQueryData(
        ["mobile", "me", "newcomer-tasks", task.id],
        task,
      );
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });

  const contentItems = useMemo(
    () => sortContentItems(contentQuery.data ?? [], contentSort),
    [contentQuery.data, contentSort],
  );
  const taskItems = useMemo(
    () => sortTaskItems(filterTaskItems(tasksQuery.data ?? [], taskFilter), taskSort),
    [taskFilter, taskSort, tasksQuery.data],
  );
  const hasActiveControls = Boolean(trimmedSearch) || contentSort !== "newest" || taskFilter !== "all" || taskSort !== "order";
  const activeControlsText = `当前筛选：${[trimmedSearch ? `关键词：${trimmedSearch}` : null, taskFilter === "todo" ? "未完成任务" : taskFilter === "done" ? "已完成任务" : null].filter(Boolean).join(" / ") || "全部新人资料和任务"} / 资料排序：${contentSort === "newest" ? "最新优先" : "分类名称"} / 任务排序：${taskSort === "order" ? "任务顺序" : "未完成优先"}`;
  const resetControls = () => {
    setSearch("");
    setContentSort("newest");
    setTaskFilter("all");
    setTaskSort("order");
  };

  if (contentQuery.isLoading || tasksQuery.isLoading) {
    return <LoadingState label="正在加载新人专区..." />;
  }

  if (contentQuery.error || tasksQuery.error) {
    return (
      <ErrorState
        message="新人专区加载失败，请稍后重试"
        retrying={contentQuery.isFetching || tasksQuery.isFetching}
        onRetry={() => {
          void contentQuery.refetch();
          void tasksQuery.refetch();
        }}
      />
    );
  }

  return (
    <Screen>
      <PageHeader
        title="新人专区"
        subtitle="浏览新人资料，完成自己的启用任务。"
      />

      <PixelTextInput
        accessibilityLabel="搜索新人资料"
        placeholder="搜索新人资料标题、摘要或正文"
        value={search}
        onChangeText={setSearch}
      />
      <ModuleListStatus
        label="新人专区"
        count={contentItems.length + taskItems.length}
        activeSummary={trimmedSearch ? `当前筛选：新人资料关键词：${trimmedSearch}` : "当前筛选：全部新人资料与任务"}
        onReset={trimmedSearch ? () => setSearch("") : undefined}
      />

      <View style={styles.filters}>
        <AppButton label="最新优先" accessibilityLabel="新人资料按最新优先排序" variant={contentSort === "newest" ? "primary" : "secondary"} onPress={() => setContentSort("newest")} />
        <AppButton label="分类名称" accessibilityLabel="新人资料按分类名称排序" variant={contentSort === "category" ? "primary" : "secondary"} onPress={() => setContentSort("category")} />
      </View>

      <View style={styles.filters}>
        <AppButton label="全部任务" variant={taskFilter === "all" ? "primary" : "secondary"} onPress={() => setTaskFilter("all")} />
        <AppButton label="未完成" accessibilityLabel="筛选未完成新人任务" variant={taskFilter === "todo" ? "primary" : "secondary"} onPress={() => setTaskFilter("todo")} />
        <AppButton label="已完成" accessibilityLabel="筛选已完成新人任务" variant={taskFilter === "done" ? "primary" : "secondary"} onPress={() => setTaskFilter("done")} />
        <AppButton label="任务顺序" accessibilityLabel="新人任务按任务顺序排序" variant={taskSort === "order" ? "primary" : "secondary"} onPress={() => setTaskSort("order")} />
        <AppButton label="未完成优先" accessibilityLabel="新人任务按未完成优先排序" variant={taskSort === "status" ? "primary" : "secondary"} onPress={() => setTaskSort("status")} />
      </View>

      <View style={styles.controlSummary}>
        <Text style={styles.activeControls}>{activeControlsText}</Text>
        <AppButton label="重置" accessibilityLabel="重置新人专区筛选和排序" variant="secondary" disabled={!hasActiveControls} onPress={resetControls} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>新人资料</Text>
        {contentItems.length === 0 ? (
          <EmptyState title="没有匹配的新人资料" description="换个关键词或排序方式，或点重置恢复全部资料。" />
        ) : (
          contentItems.map((item) => (
            <Card key={item.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`查看新人资料 ${item.title}`}
                onPress={() => router.push(`/newcomer/${item.id}` as Href)}
                style={({ pressed }) => [pressed ? styles.pressed : null]}
              >
                <View style={styles.cardBody}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.summary}>{item.summary}</Text>
                  <Text style={styles.meta}>
                    {item.category} · {item.publishedAt}
                  </Text>
                </View>
              </Pressable>
            </Card>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>我的新人任务</Text>
        {taskItems.length === 0 ? (
          <EmptyState
            title="没有匹配的新人任务"
            description="换个任务状态或排序方式，或点重置恢复全部任务。"
          />
        ) : (
          taskItems.map((task) => (
            <Card key={task.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`查看新人任务 ${task.title}`}
                onPress={() =>
                  router.push(`/me/newcomer-tasks/${task.id}` as Href)
                }
                style={({ pressed }) => [pressed ? styles.pressed : null]}
              >
                <View style={styles.cardBody}>
                  <Text style={styles.title}>{task.title}</Text>
                  <Text style={styles.summary}>{task.description}</Text>
                  <Text style={styles.meta}>
                    排序 {task.sort_order} ·{" "}
                    {task.completed ? "已完成" : "未完成"}
                  </Text>
                </View>
              </Pressable>
              {task.completed ? (
                <AppButton
                  label="已完成"
                  variant="secondary"
                  disabled
                  onPress={() => undefined}
                />
              ) : (
                <AppButton
                  label="标记完成"
                  accessibilityLabel={`完成任务 ${task.title}`}
                  loading={
                    completeMutation.isPending &&
                    completeMutation.variables?.id === task.id
                  }
                  onPress={() => completeMutation.mutate(task)}
                />
              )}
            </Card>
          ))
        )}
      </View>
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
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
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
  pressed: {
    opacity: 0.85,
  },
});
