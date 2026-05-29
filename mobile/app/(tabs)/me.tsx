import { router, type Href } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StyleSheet, Text } from "react-native";
import { getProfileSummary, updateProfilePreferences } from "@/api/me";
import { useAuth } from "@/auth/AuthProvider";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { colors, typography } from "@/theme/tokens";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { data, error, isFetching, isLoading, refetch } = useQuery({ queryKey: ["mobile", "profile"], queryFn: getProfileSummary });
  const showNewcomerOnHome = data?.preferences.showNewcomerOnHome ?? true;
  const preferenceMutation = useMutation({
    mutationFn: (nextValue: boolean) => updateProfilePreferences({ showNewcomerOnHome: nextValue }),
    onSuccess: async (nextProfile) => {
      queryClient.setQueryData(["mobile", "profile"], nextProfile);
      await queryClient.invalidateQueries({ queryKey: ["mobile", "home"] });
    }
  });

  if (isLoading) {
    return <LoadingState label="正在加载个人中心..." />;
  }

  if (error) {
    return <ErrorState message="个人中心加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title="个人中心" subtitle={`${user?.department ?? ""} · ${user?.email ?? ""}`} />
      <Card>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.meta}>角色：{user?.roles.join(", ")}</Text>
      </Card>
      <Card>
        <Text style={styles.title}>我的数据</Text>
        <Text style={styles.meta}>培训进度：{data?.trainingProgressPercent ?? 0}%</Text>
        <Text style={styles.meta}>
          新人任务：{data?.newcomerTasksDone ?? 0}/{data?.newcomerTasksTotal ?? 0}
        </Text>
      </Card>
      <Card>
        <Text style={styles.title}>个人偏好</Text>
        <Text style={styles.meta}>首页显示新人专区：{showNewcomerOnHome ? "已开启" : "已隐藏"}</Text>
        <AppButton
          label={showNewcomerOnHome ? "隐藏首页新人专区" : "显示首页新人专区"}
          variant="secondary"
          loading={preferenceMutation.isPending}
          onPress={() => preferenceMutation.mutate(!showNewcomerOnHome)}
        />
      </Card>
      <AppButton label="培训进度" variant="secondary" onPress={() => router.push("/me/training" as Href)} />
      <AppButton label="查看我的新人任务" variant="secondary" onPress={() => router.push("/me/newcomer-tasks" as Href)} />
      <AppButton label="退出登录" variant="danger" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900"
  },
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  }
});
