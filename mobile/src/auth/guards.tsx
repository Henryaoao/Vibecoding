import { PropsWithChildren } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "./AuthProvider";
import type { Role } from "@/types/domain";
import { colors, spacing, typography } from "@/theme/tokens";

function RestoringState() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.text}>正在恢复登录状态...</Text>
    </View>
  );
}

export function RequireAuth({ children }: PropsWithChildren) {
  const { user, isRestoring } = useAuth();

  if (isRestoring) {
    return <RestoringState />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}

export function RequireRole({ roles, children }: PropsWithChildren<{ roles: Role[] }>) {
  const { user, isRestoring, hasRole } = useAuth();

  if (isRestoring) {
    return <RestoringState />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasRole(roles)) {
    return <Redirect href="/forbidden" />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.background
  },
  text: {
    fontSize: typography.body,
    color: colors.textMuted
  }
});
