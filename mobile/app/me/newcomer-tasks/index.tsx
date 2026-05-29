import { router, type Href } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { completeMyNewcomerTask, listMyNewcomerTasks } from "@/api/newcomer";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, spacing, typography } from "@/theme/tokens";
import type { MyNewcomerTaskItem } from "@/types/domain";

export default function MyNewcomerTasksScreen() {
  const queryClient = useQueryClient();
  const queryKey = ["mobile", "me", "newcomer-tasks"];
  const { data, error, isFetching, isLoading, refetch } = useQuery({ queryKey, queryFn: listMyNewcomerTasks });
  const completeMutation = useMutation({
    mutationFn: (task: MyNewcomerTaskItem) => completeMyNewcomerTask(task.id),
    onSuccess: async (task) => {
      queryClient.setQueryData<MyNewcomerTaskItem[]>(queryKey, (current) =>
        current?.map((candidate) => (candidate.id === task.id ? task : candidate))
      );
      queryClient.setQueryData(["mobile", "me", "newcomer-tasks", task.id], task);
      await queryClient.invalidateQueries({ queryKey });
    }
  });

  if (isLoading) {
    return <LoadingState label="正在加载我的新人任务..." />;
  }

  if (error) {
    return <ErrorState message="我的新人任务加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  const tasks = data ?? [];

  return (
    <Screen>
      <PageHeader title="我的新人任务" subtitle="只展示当前账号可完成的启用任务，按排序升序排列。" />

      {tasks.length === 0 ? (
        <EmptyState title="暂无新人任务" description="当前没有已启用的新人任务。" />
      ) : (
        tasks.map((task) => (
          <Card key={task.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`查看新人任务 ${task.title}`}
              onPress={() => router.push(`/me/newcomer-tasks/${task.id}` as Href)}
              style={({ pressed }) => [pressed ? styles.pressed : null]}
            >
              <View style={styles.cardBody}>
                <Text style={styles.title}>{task.title}</Text>
                <Text style={styles.summary}>{task.description}</Text>
                <Text style={styles.meta}>排序 {task.sort_order} · {task.completed ? "已完成" : "未完成"}</Text>
              </View>
            </Pressable>
            {task.completed ? (
              <AppButton label="已完成" variant="secondary" disabled onPress={() => undefined} />
            ) : (
              <AppButton
                label="标记完成"
                accessibilityLabel={`完成任务 ${task.title}`}
                loading={completeMutation.isPending && completeMutation.variables?.id === task.id}
                onPress={() => completeMutation.mutate(task)}
              />
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  summary: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  pressed: {
    opacity: 0.85
  }
});
