import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { colors, spacing, typography } from "@/theme/tokens";

type ModuleListStatusProps = {
  label: string;
  count: number;
  activeSummary?: string;
  onReset?: () => void;
};

export function ModuleListStatus({ label, count, activeSummary, onReset }: ModuleListStatusProps) {
  return (
    <View style={styles.statusPanel}>
      <View style={styles.countRail}>
        <View style={styles.pixelDot} />
        <Text style={styles.countText}>
          {label} · {count} 条
        </Text>
        <View style={styles.pixelDot} />
      </View>
      {activeSummary ? <Text style={styles.activeSummary}>{activeSummary}</Text> : null}
      {onReset ? (
        <AppButton
          label="清除筛选"
          accessibilityLabel={`清除${label}筛选`}
          variant="secondary"
          onPress={onReset}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  statusPanel: {
    gap: spacing.sm
  },
  countRail: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.outline,
    borderWidth: 3,
    paddingHorizontal: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.72,
    shadowRadius: 0,
    elevation: 4
  },
  pixelDot: {
    width: 10,
    height: 10,
    backgroundColor: colors.primary,
    borderColor: colors.outline,
    borderWidth: 2
  },
  countText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  activeSummary: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 22
  }
});
