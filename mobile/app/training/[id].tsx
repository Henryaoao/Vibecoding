import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";
import { completeCourse, getCourse, updateCourseProgress } from "@/api/courses";
import { ApiError } from "@/api/errors";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { goBackOrTraining } from "@/navigation/backNavigation";
import { colors, radius, spacing, typography } from "@/theme/tokens";

export default function TrainingDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const courseId = Array.isArray(id) ? id[0] : id;
  const queryClient = useQueryClient();
  const courseQuery = useQuery({
    queryKey: ["mobile", "courses", courseId],
    queryFn: () => {
      if (!courseId) {
        throw new Error("Course id is required");
      }
      return getCourse(courseId);
    },
    enabled: Boolean(courseId)
  });

  const invalidateCourseData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["mobile", "courses"] }),
      queryClient.invalidateQueries({ queryKey: ["mobile", "profile"] })
    ]);
  };

  const progressMutation = useMutation({
    mutationFn: () => {
      if (!courseId) {
        throw new Error("Course id is required");
      }
      return updateCourseProgress(courseId, { progressPercent: Math.max(courseQuery.data?.progressPercent ?? 0, 75) });
    },
    onSuccess: async (course) => {
      queryClient.setQueryData(["mobile", "courses", courseId], course);
      await invalidateCourseData();
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => {
      if (!courseId) {
        throw new Error("Course id is required");
      }
      return completeCourse(courseId);
    },
    onSuccess: async (course) => {
      queryClient.setQueryData(["mobile", "courses", courseId], course);
      await invalidateCourseData();
    }
  });

  if (courseQuery.isLoading) {
    return <LoadingState label="正在加载课程详情..." />;
  }

  if (courseQuery.error instanceof ApiError && courseQuery.error.status === 404) {
    return <EmptyState title="课程不存在" description="该课程可能已下架或你没有访问权限。" />;
  }

  if (courseQuery.error) {
    return <ErrorState message="课程详情加载失败，请稍后重试" retrying={courseQuery.isFetching} onRetry={() => courseQuery.refetch()} />;
  }

  if (!courseQuery.data) {
    return <EmptyState title="课程不存在" description="该课程可能已下架或你没有访问权限。" />;
  }

  const course = courseQuery.data;

  return (
    <Screen>
      <PageHeader title="课程详情" subtitle="课程进度只更新当前登录用户自己的学习记录。" />

      <Card>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.badge}>{course.required ? "必修课程" : "选修课程"}</Text>
        <Text style={styles.meta}>{course.category}</Text>
        <Text style={styles.summary}>{course.summary}</Text>
        <Text style={styles.meta}>{course.description}</Text>
        <Text style={styles.meta}>课程资源：{course.resourceUrl}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>学习进度</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${course.progressPercent}%` }]} />
        </View>
        <Text style={styles.meta}>当前进度 {course.progressPercent}%</Text>
        <Text style={course.completed ? styles.completed : styles.incomplete}>{course.completed ? "已完成" : "尚未完成"}</Text>
        {course.completedAt ? <Text style={styles.meta}>完成时间 {course.completedAt}</Text> : null}
        <View style={styles.actions}>
          <AppButton
            label={course.progressPercent >= 75 ? "保持当前进度" : "更新到 75%"}
            variant="secondary"
            loading={progressMutation.isPending}
            disabled={course.completed || course.progressPercent >= 75}
            onPress={() => progressMutation.mutate()}
          />
          <AppButton
            label={course.completed ? "已标记完成" : "标记完成"}
            loading={completeMutation.isPending}
            disabled={course.completed}
            onPress={() => completeMutation.mutate()}
          />
        </View>
        {progressMutation.isError ? <Text style={styles.denied}>进度更新失败，请稍后重试。</Text> : null}
        {completeMutation.isError ? <Text style={styles.denied}>课程完成状态保存失败，请稍后重试。</Text> : null}
      </Card>

      <AppButton label="返回培训中心" variant="secondary" onPress={goBackOrTraining} />
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
  badge: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "800"
  },
  summary: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden"
  },
  progressBar: {
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.primary
  },
  completed: {
    color: colors.success,
    fontSize: typography.body,
    fontWeight: "700"
  },
  incomplete: {
    color: colors.warning,
    fontSize: typography.body,
    fontWeight: "700"
  },
  denied: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: "700"
  },
  actions: {
    gap: spacing.sm
  }
});
