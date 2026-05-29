import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text } from "react-native";
import { getAdminRoles } from "@/api/admin";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { goBackOrHome } from "@/navigation/backNavigation";
import { colors, typography } from "@/theme/tokens";
import type { Role } from "@/types/domain";

const roleBoundaries: Record<Role, { label: string; summary: string }> = {
  user: {
    label: "普通用户",
    summary: "普通员工可访问首页、资讯、文档、培训和个人中心，不能进入 Admin Console。"
  },
  super_user: {
    label: "超级用户",
    summary: "超级用户可进入 Admin Console，执行单条后台管理操作并查看只读权限边界。"
  }
};

export default function AdminRolesScreen() {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["mobile", "admin", "roles"],
    queryFn: getAdminRoles
  });

  if (isLoading) {
    return <LoadingState label="正在加载角色权限..." />;
  }

  if (error) {
    return <ErrorState message="角色权限加载失败" retrying={isFetching} onRetry={() => refetch()} />;
  }

  const roles = data ?? [];

  return (
    <Screen>
      <PageHeader title="角色权限" subtitle="移动端只读展示当前应用角色和权限边界，角色分配仍在用户管理中按单个用户完成。" />
      {roles.length ? (
        roles.map((role) => {
          const boundary = roleBoundaries[role];
          return (
            <Card key={role}>
              <Text style={styles.title}>{role}</Text>
              <Text style={styles.meta}>{boundary.label}</Text>
              <Text style={styles.summary}>{boundary.summary}</Text>
            </Card>
          );
        })
      ) : (
        <EmptyState title="暂无角色" description="当前没有可展示的应用角色。" />
      )}
      <AppButton label="返回" variant="secondary" onPress={goBackOrHome} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  meta: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  summary: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  }
});
