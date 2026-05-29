import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";

export function PixelTextInput(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.textMuted} {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: {
    minHeight: 48,
    backgroundColor: colors.field,
    borderColor: colors.outline,
    borderWidth: 3,
    borderRadius: 0,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.56,
    shadowRadius: 0,
    elevation: 3
  }
});
