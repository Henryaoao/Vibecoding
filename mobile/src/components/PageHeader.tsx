import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.panelSheen} pointerEvents="none" />
      <Text style={styles.eyebrow}>PROJECTM / EMPLOYEE DASHBOARD</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.statusRail}>
        <View style={styles.statusPixel} />
        <Text style={styles.statusText}>Cloud</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    overflow: "hidden",
    gap: spacing.md,
    backgroundColor: colors.wall,
    borderColor: colors.outline,
    borderWidth: 4,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 0.75,
    shadowRadius: 0,
    elevation: 8
  },
  panelSheen: {
    ...StyleSheet.absoluteFill,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderColor: colors.panelSheen
  },
  eyebrow: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 18
  },
  title: {
    fontSize: typography.title,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.text,
    textShadowColor: colors.wallStripe,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 22,
    color: colors.textMuted,
    fontWeight: "700"
  },
  statusRail: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.field,
    borderColor: colors.outline,
    borderWidth: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.72,
    shadowRadius: 0,
    elevation: 4
  },
  statusPixel: {
    width: 12,
    height: 12,
    backgroundColor: colors.success,
    shadowColor: colors.outline,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0
  },
  statusText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "900"
  }
});
