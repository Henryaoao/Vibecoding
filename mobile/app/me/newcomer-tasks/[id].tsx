import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StyleSheet, Text } from "react-native";
import { completeMyNewcomerTask, getMyNewcomerTask } from "@/api/newcomer";
import { ApiError } from "@/api/errors";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, typography } from "@/theme/tokens";

export default function MyNewcomerTaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const taskId = Array.isArray(id) ? id[0] : id;
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["mobile", "me", "newcomer-tasks", taskId],
    queryFn: () => {
      if (!taskId) {
        throw new Error("Newcomer task id is required");
      }
      return getMyNewcomerTask(taskId);
    },
    enabled: Boolean(taskId)
  });

  const completeMutation = useMutation({
    mutationFn: () => {
      if (!taskId) {
        throw new Error("Newcomer task id is required");
      }
      return completeMyNewcomerTask(taskId);
    },
    onSuccess: async (task) => {
      queryClient.setQueryData(["mobile", "me", "newcomer-tasks", taskId], task);
      await queryClient.invalidateQueries({ queryKey: ["mobile", "me", "newcomer-tasks"] });
    }
  });

  if (query.isLoading) {
    return <LoadingState label="正在加载新人任务详情..." />;
  }

  if (query.error instanceof ApiError && query.error.status === 404) {
    return <EmptyState title="新人任务不存在" description="该任务可能已禁用或不属于当前用户。" />;
  }

  if (query.error) {
    return <ErrorState message="新人任务详情加载失败，请稍后重试" retrying={query.isFetching} onRetry={() => query.refetch()} />;
  }

  if (!query.data) {
    return <EmptyState title="新人任务不存在" description="该任务可能已禁用或不属于当前用户。" />;
  }

  const task = query.data;

  return (
    <Screen>
      <PageHeader title="新人任务详情" subtitle="只可完成当前账号自己的启用新人任务。" />

      <Card>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.meta}>排序 {task.sort_order} · {task.completed ? "已完成" : "未完成"}</Text>
        <Text style={styles.body}>{task.description}</Text>
        {task.completed_at ? <Text style={styles.meta}>完成时间：{task.completed_at}</Text> : null}
      </Card>

      {task.completed ? (
        <AppButton label="已完成" variant="secondary" disabled onPress={() => undefined} />
      ) : (
        <AppButton label="标记完成" loading={completeMutation.isPending} onPress={() => completeMutation.mutate()} />
      )}
      {completeMutation.isError ? <Text style={styles.error}>任务完成状态保存失败，请稍后重试。</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  body: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: "700"
  }
});
