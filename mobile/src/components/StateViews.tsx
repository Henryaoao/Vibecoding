import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { pixelColors } from "@/theme/pixel";
import { colors, spacing, typography } from "@/theme/tokens";

export function LoadingState({ label = "正在加载..." }: { label?: string }) {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={pixelColors.roseDeep} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.state}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.muted}>{description}</Text> : null}
    </View>
  );
}

type ErrorStateProps = {
  message: string;
  requestId?: string;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
};

export function ErrorState({ message, requestId, onRetry, retryLabel = "重试", retrying }: ErrorStateProps) {
  return (
    <View style={styles.state}>
      <Text style={styles.error}>{message}</Text>
      {requestId ? <Text style={styles.muted}>Request ID: {requestId}</Text> : null}
      {onRetry ? <AppButton label={retryLabel} variant="secondary" loading={retrying} onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    margin: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderColor: colors.outline,
    borderWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.72,
    shadowRadius: 0,
    elevation: 6
  },
  title: {
    fontSize: typography.sectionTitle,
    fontWeight: "900",
    color: colors.text
  },
  muted: {
    color: pixelColors.ink,
    fontSize: typography.body,
    textAlign: "center"
  },
  error: {
    color: pixelColors.danger,
    fontSize: typography.body,
    fontWeight: "900",
    textAlign: "center"
  }
});
