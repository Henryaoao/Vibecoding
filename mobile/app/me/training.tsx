import { router, type Href } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { listMyTrainingProgress } from "@/api/me";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, spacing, typography } from "@/theme/tokens";

export default function TrainingProgressScreen() {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "me", "training-progress"],
    queryFn: listMyTrainingProgress
  });

  if (isLoading) {
    return <LoadingState label="正在加载我的培训进度..." />;
  }

  if (error) {
    return <ErrorState message="我的培训进度加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  const progressItems = data ?? [];

  return (
    <Screen>
      <PageHeader title="我的培训进度" subtitle="查看当前账号的课程学习进度和必修状态。" />

      {progressItems.length === 0 ? (
        <EmptyState title="暂无培训进度" description="开始课程学习后会显示在这里。" />
      ) : (
        progressItems.map((item) => (
          <Card key={item.courseId}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`查看课程 ${item.title}`}
              onPress={() => router.push(`/training/${item.courseId}` as Href)}
              style={({ pressed }) => [pressed ? styles.pressed : null]}
            >
              <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.summary}>{item.required ? "必修课程" : "选修课程"}</Text>
                <Text style={styles.meta}>进度 {item.progressPercent}% · {item.completed ? "已完成" : "未完成"}</Text>
                <Text style={styles.meta}>
                  最近学习：{item.lastLearnedAt}
                  {item.completedAt ? ` · 完成：${item.completedAt}` : ""}
                </Text>
              </View>
            </Pressable>
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
