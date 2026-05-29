import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function AppButton({ label, onPress, variant = "primary", disabled, loading, style, accessibilityLabel }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !disabled && !loading ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style
      ]}
    >
      {loading ? <ActivityIndicator color={colors.text} /> : null}
      <Text style={[styles.label, variant !== "primary" ? styles.secondaryLabel : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderColor: colors.outline,
    borderWidth: 3,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.72,
    shadowRadius: 0,
    elevation: 4
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.panelLavender
  },
  danger: {
    backgroundColor: colors.wallStripe
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 2, height: 2 },
    elevation: 2
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  secondaryLabel: {
    color: colors.text
  }
});
