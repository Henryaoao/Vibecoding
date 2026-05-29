import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { colors, spacing, typography } from "@/theme/tokens";

export type AdminActionConfirmationProps = {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminActionConfirmation({
  title,
  message,
  confirmLabel,
  confirmVariant = "primary",
  loading,
  onCancel,
  onConfirm
}: AdminActionConfirmationProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        <AppButton label="取消" variant="secondary" onPress={onCancel} disabled={loading} />
        <AppButton label={confirmLabel} variant={confirmVariant} onPress={onConfirm} loading={loading} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.warning,
    backgroundColor: colors.surface
  },
  title: {
    color: colors.warning,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  message: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22
  },
  actions: {
    gap: spacing.sm
  }
});
