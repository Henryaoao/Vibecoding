import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StyleSheet, Switch, Text, View } from "react-native";
import { getNotificationSettings, updateNotificationSettings } from "@/api/notifications";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { goBackOrProfile } from "@/navigation/backNavigation";
import { createExpoPushRegistrationProviders, registerExpoPushTokenIfAllowed } from "@/notifications/pushRegistration";
import type { PushRegistrationProviders } from "@/notifications/pushRegistration";
import { colors, spacing, typography } from "@/theme/tokens";
import type { ModuleKey, NotificationSettings } from "@/types/domain";

const preferenceItems: Array<{ key: ModuleKey; label: string; description: string }> = [
  { key: "briefs", label: "今日公司简报", description: "每天重点信息与办公提醒" },
  { key: "announcements", label: "公司公告墙", description: "制度更新、通知与公告" },
  { key: "forum-hot", label: "员工论坛热帖", description: "内部论坛热门讨论" },
  { key: "newcomer", label: "新人专区", description: "入职任务和新人材料" },
  { key: "finance", label: "财经轻资讯", description: "仅信息阅读，不构成投资建议" },
  { key: "documents", label: "文档中心", description: "文档更新和权限变更" },
  { key: "training", label: "培训中心", description: "课程提醒和学习进度" }
];

const queryKey = ["mobile", "notification-settings"] as const;

type NotificationSettingsScreenProps = {
  createPushRegistrationProviders?: () => PushRegistrationProviders;
};

export default function NotificationSettingsScreen({
  createPushRegistrationProviders = createExpoPushRegistrationProviders
}: NotificationSettingsScreenProps = {}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: getNotificationSettings
  });

  const updateMutation = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (nextSettings) => {
      queryClient.setQueryData(queryKey, nextSettings);
    }
  });

  const registerMutation = useMutation({
    mutationFn: () => registerExpoPushTokenIfAllowed(createPushRegistrationProviders()),
    onSuccess: (result) => {
      if (result.status === "registered") {
        setMessage(`设备已注册：${result.device.platform}`);
        return;
      }

      setMessage("未开启通知权限，主流程不受影响");
    },
    onError: () => {
      setMessage("设备注册失败，请稍后重试");
    }
  });

  if (isLoading) {
    return <LoadingState label="正在加载通知偏好..." />;
  }

  if (error || !data) {
    return <ErrorState message="通知偏好加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  function handlePreferenceChange(settings: NotificationSettings, key: ModuleKey, enabled: boolean) {
    const nextSettings = {
      ...settings,
      [key]: enabled
    };
    const item = preferenceItems.find((preference) => preference.key === key);

    setMessage(item ? `${item.label}通知已${enabled ? "开启" : "关闭"}` : null);
    updateMutation.mutate(nextSettings);
  }

  return (
    <Screen>
      <PageHeader title="通知偏好" subtitle="管理移动端推送入口；真实系统推送将在开发构建与真机阶段验证。" />

      <Card>
        <Text style={styles.sectionTitle}>模块通知</Text>
        {preferenceItems.map((item) => (
          <View key={item.key} style={styles.preferenceRow}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>{item.label}</Text>
              <Text style={styles.preferenceDescription}>{item.description}</Text>
            </View>
            <Switch
              accessibilityLabel={`${item.label}通知`}
              value={data[item.key]}
              onValueChange={(enabled) => handlePreferenceChange(data, item.key, enabled)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
              disabled={updateMutation.isPending}
            />
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>当前设备</Text>
        <Text style={styles.preferenceDescription}>
          使用真实 Expo 推送注册通道；测试仍可注入确定性 provider，真机权限将在开发构建中弹出。
        </Text>
        <AppButton
          label="注册当前设备"
          onPress={() => registerMutation.mutate()}
          loading={registerMutation.isPending}
          disabled={registerMutation.isPending}
        />
      </Card>

      {message ? <Text style={styles.statusMessage}>{message}</Text> : null}
      <AppButton label="返回个人中心" variant="secondary" onPress={goBackOrProfile} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  preferenceRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingTop: spacing.md
  },
  preferenceText: {
    flex: 1,
    gap: spacing.xs
  },
  preferenceTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700"
  },
  preferenceDescription: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  },
  statusMessage: {
    color: colors.success,
    fontSize: typography.body,
    fontWeight: "700"
  }
});
