import { useMemo, useState } from "react";
import { router, type Href } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PixelTextInput } from "@/components/PixelTextInput";
import { listCourses } from "@/api/courses";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ModuleListStatus } from "@/components/ModuleListControls";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { colors, radius, typography } from "@/theme/tokens";

type CourseFilter = "all" | "required" | "optional" | "incomplete" | "completed";
type CourseSort = "progressDesc" | "progressAsc";

export default function TrainingScreen() {
  const [keyword, setKeyword] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<CourseFilter>("all");
  const [sortBy, setSortBy] = useState<CourseSort>("progressDesc");
  const { data, error, isFetching, isLoading, refetch } = useQuery({ queryKey: ["mobile", "courses"], queryFn: listCourses });

  const filteredCourses = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return (data ?? [])
      .filter((course) => {
        const matchesKeyword = normalizedKeyword
          ? `${course.title} ${course.required ? "必修" : "选修"} ${course.completed ? "已完成" : "未完成"}`.toLowerCase().includes(normalizedKeyword)
          : true;
        const matchesFilter =
          selectedFilter === "all" ||
          (selectedFilter === "required" && course.required) ||
          (selectedFilter === "optional" && !course.required) ||
          (selectedFilter === "completed" && course.completed) ||
          (selectedFilter === "incomplete" && !course.completed);
        return matchesKeyword && matchesFilter;
      })
      .sort((left, right) =>
        sortBy === "progressDesc"
          ? right.progressPercent - left.progressPercent
          : left.progressPercent - right.progressPercent
      );
  }, [data, keyword, selectedFilter, sortBy]);

  const trimmedKeyword = keyword.trim();
  const activeSummary = [
    trimmedKeyword ? `关键词：${trimmedKeyword}` : null,
    selectedFilter === "required" ? "必修" : null,
    selectedFilter === "optional" ? "选修" : null,
    selectedFilter === "completed" ? "已完成" : null,
    selectedFilter === "incomplete" ? "未完成" : null,
    sortBy === "progressAsc" ? "进度从低到高" : null
  ].filter(Boolean);
  const hasActiveFilters = Boolean(trimmedKeyword || selectedFilter !== "all" || sortBy !== "progressDesc");

  if (isLoading) {
    return <LoadingState label="正在加载培训..." />;
  }

  if (error) {
    return <ErrorState message="培训中心加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title="培训中心" subtitle="查看课程详情，更新学习进度并标记完成。" />
      <PixelTextInput
        accessibilityLabel="搜索课程"
        value={keyword}
        onChangeText={setKeyword}
        placeholder="搜索课程或必修/选修"
      />
      <View style={styles.filterGroup}>
        <Text style={styles.filterTitle}>课程筛选</Text>
        <View style={styles.filters}>
          <AppButton label="全部" variant={selectedFilter === "all" ? "primary" : "secondary"} onPress={() => setSelectedFilter("all")} />
          <AppButton label="必修" variant={selectedFilter === "required" ? "primary" : "secondary"} onPress={() => setSelectedFilter("required")} />
          <AppButton label="选修" variant={selectedFilter === "optional" ? "primary" : "secondary"} onPress={() => setSelectedFilter("optional")} />
          <AppButton label="未完成" variant={selectedFilter === "incomplete" ? "primary" : "secondary"} onPress={() => setSelectedFilter("incomplete")} />
          <AppButton label="已完成" variant={selectedFilter === "completed" ? "primary" : "secondary"} onPress={() => setSelectedFilter("completed")} />
        </View>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterTitle}>排序</Text>
        <View style={styles.filters}>
          <AppButton label="进度高优先" variant={sortBy === "progressDesc" ? "primary" : "secondary"} onPress={() => setSortBy("progressDesc")} />
          <AppButton label="进度低优先" variant={sortBy === "progressAsc" ? "primary" : "secondary"} onPress={() => setSortBy("progressAsc")} />
        </View>
      </View>
      <ModuleListStatus
        label="培训中心"
        count={filteredCourses.length}
        activeSummary={activeSummary.length ? `当前筛选：${activeSummary.join(" / ")}` : "当前筛选：全部课程 · 进度高优先"}
        onReset={
          hasActiveFilters
            ? () => {
                setKeyword("");
                setSelectedFilter("all");
                setSortBy("progressDesc");
              }
            : undefined
        }
      />
      {filteredCourses.length === 0 ? (
        <EmptyState title="暂无课程" description="换个关键词再试试，或等待课程发布。" />
      ) : (
        filteredCourses.map((course) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`查看课程 ${course.title}`}
            key={course.id}
            onPress={() => router.push(`/training/${course.id}` as Href)}
            style={({ pressed }) => [pressed ? styles.pressed : null]}
          >
            <Card>
              <Text style={styles.title}>{course.title}</Text>
              <Text style={styles.meta}>{course.required ? "必修课程" : "选修课程"}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${course.progressPercent}%` }]} />
              </View>
              <Text style={styles.meta}>已完成 {course.progressPercent}%</Text>
              <Text style={course.completed ? styles.completed : styles.incomplete}>
                {course.completed ? "已完成" : "尚未完成"}
              </Text>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterGroup: {
    gap: 8
  },
  filterTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body
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
  pressed: {
    opacity: 0.85
  }
});
