import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ErrorState } from "@/components/StateViews";
import { useAuth } from "@/auth/AuthProvider";
import { isApiError } from "@/api/errors";
import { colors, typography } from "@/theme/tokens";
import type { Role } from "@/types/domain";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(role: Role) {
    setError(null);
    setLoadingRole(role);

    try {
      await signIn(role);
      router.replace("/(tabs)");
    } catch (caught) {
      setError(isApiError(caught) ? caught.message : "登录失败，请稍后重试");
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <Screen reserveMenuSpace={false}>
      <PageHeader title="ProjectM" subtitle="公司内部移动门户" />
      <Card>
        <Text style={styles.title}>选择一个 mock 账号登录</Text>
        <Text style={styles.body}>当前阶段使用 mock transport，接口响应保持真实 envelope 形状。</Text>
        <AppButton
          label="普通用户登录"
          loading={loadingRole === "user"}
          disabled={loadingRole !== null}
          onPress={() => void handleLogin("user")}
        />
        <AppButton
          label="超级用户登录"
          variant="secondary"
          loading={loadingRole === "super_user"}
          disabled={loadingRole !== null}
          onPress={() => void handleLogin("super_user")}
        />
      </Card>
      {error ? <ErrorState message={error} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  body: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  }
});
