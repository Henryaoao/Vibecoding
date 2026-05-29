import { router } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { colors, typography } from "@/theme/tokens";

export default function ForbiddenScreen() {
  return (
    <Screen>
      <PageHeader title="403" subtitle="当前账号没有访问该页面的权限。" />
      <Card>
        <Text style={styles.title}>权限边界已生效</Text>
        <Text style={styles.body}>当前页面需要更高权限或暂未开放。真正权限仍由后端接口返回 403。</Text>
        <AppButton label="返回首页" onPress={() => router.replace("/(tabs)")} />
      </Card>
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
