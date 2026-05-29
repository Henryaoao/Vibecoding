import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { getAdminDashboard } from "@/api/admin";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { goBackOrHome } from "@/navigation/backNavigation";
import { colors, typography } from "@/theme/tokens";

export default function AdminDashboardScreen() {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "admin", "dashboard"],
    queryFn: getAdminDashboard
  });

  if (isLoading) {
    return <LoadingState label="正在加载 Admin Dashboard..." />;
  }

  if (error) {
    return <ErrorState message="Admin Dashboard 加载失败" retrying={isFetching} onRetry={() => refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title="Admin Console" subtitle="移动端后台骨架：开放单条用户、内容、文档、课程、新人任务、分类、标签、首页栏目配置和只读审计日志入口。" />
      <Card>
        <Text style={styles.title}>指标摘要</Text>
        <Text style={styles.metric}>内容数量：{data?.contentCount ?? 0}</Text>
        <Text style={styles.metric}>待发布数量：{data?.pendingPublishCount ?? 0}</Text>
        <Text style={styles.metric}>阅读量：{data?.readCount ?? 0}</Text>
        <Text style={styles.metric}>文档下载量：{data?.documentDownloadCount ?? 0}</Text>
        <Text style={styles.metric}>培训完成率：{data?.trainingCompletionRate ?? 0}%</Text>
      </Card>
      <Card>
        <Text style={styles.title}>最近操作</Text>
        {data?.recentActions.map((action) => (
          <Text key={action} style={styles.meta}>
            {action}
          </Text>
        ))}
      </Card>
      <AppButton label="进入用户管理" onPress={() => router.push("/admin/users" as Href)} />
      <AppButton label="进入标签管理" onPress={() => router.push("/admin/tags" as Href)} />
      <AppButton label="进入分类管理" onPress={() => router.push("/admin/categories" as Href)} />
      <AppButton label="进入内容管理" onPress={() => router.push("/admin/contents" as Href)} />
      <AppButton label="进入文档管理" onPress={() => router.push("/admin/documents" as Href)} />
      <AppButton label="进入课程管理" onPress={() => router.push("/admin/courses" as Href)} />
      <AppButton label="进入新人任务管理" onPress={() => router.push("/admin/newcomer-tasks" as Href)} />
      <AppButton label="进入首页栏目配置" onPress={() => router.push("/admin/portal-config" as Href)} />
      <AppButton label="角色权限" onPress={() => router.push("/admin/roles" as Href)} />
      <AppButton label="查看审计日志" onPress={() => router.push("/admin/audit-logs" as Href)} />
      <AppButton label="返回首页" variant="secondary" onPress={goBackOrHome} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  metric: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  }
});
