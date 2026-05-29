import { StyleSheet, Text } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { goBackOrHome } from "@/navigation/backNavigation";
import { moduleRoutesByKey } from "@/navigation/moduleRoutes";
import { colors, typography } from "@/theme/tokens";
import type { ModuleKey } from "@/types/domain";

type ModulePlaceholderScreenProps = {
  moduleKey: ModuleKey;
};

export function ModulePlaceholderScreen({ moduleKey }: ModulePlaceholderScreenProps) {
  const moduleRoute = moduleRoutesByKey[moduleKey];

  return (
    <Screen>
      <PageHeader title={moduleRoute.title} subtitle={moduleRoute.summary} />

      <Card>
        <Text style={styles.sectionTitle}>当前骨架</Text>
        <Text style={styles.body}>{moduleRoute.primaryState}</Text>
      </Card>

      {moduleRoute.complianceNote ? (
        <Card style={styles.complianceCard}>
          <Text style={styles.sectionTitle}>合规边界</Text>
          <Text style={styles.body}>{moduleRoute.complianceNote}</Text>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.sectionTitle}>后续注入内容</Text>
        <Text style={styles.body}>{moduleRoute.nextDetail}</Text>
      </Card>

      <AppButton label="返回首页" variant="secondary" onPress={goBackOrHome} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  body: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  },
  complianceCard: {
    borderColor: colors.warning
  }
});
