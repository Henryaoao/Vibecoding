import { PropsWithChildren } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { goBackOrHome } from "@/navigation/backNavigation";
import { pixelColors } from "@/theme/pixel";
import { spacing } from "@/theme/tokens";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  style?: ViewStyle;
  /** Show the protected page navigation affordance inside page content. */
  reserveMenuSpace?: boolean;
}>;

export function Screen({ children, scroll = true, style, reserveMenuSpace = true }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.container, styles.staticContent, style]}>
        <PixelBackdrop />
        {reserveMenuSpace ? <BackButton /> : null}
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PixelBackdrop />
      <ScrollView
        testID="pixel-screen-scroll"
        contentContainerStyle={[styles.content, style]}
      >
        {reserveMenuSpace ? <BackButton /> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function BackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="返回上一页"
      onPress={goBackOrHome}
      style={({ pressed }) => [styles.backButton, pressed ? styles.backButtonPressed : null]}
    >
      <Text style={styles.backIcon}>{"<"}</Text>
      <Text style={styles.backLabel}>返回</Text>
    </Pressable>
  );
}

function PixelBackdrop() {
  return (
    <>
      <View style={styles.wallGrid} pointerEvents="none" />
      <View style={styles.floor} pointerEvents="none">
        {Array.from({ length: 24 }).map((_, index) => (
          <View key={index} style={[styles.floorTile, index % 2 ? styles.floorTileAlt : null]} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pixelColors.wall
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl + 56,
    gap: spacing.lg
  },
  staticContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 56,
    gap: spacing.lg
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: pixelColors.panelPink,
    borderColor: pixelColors.outline,
    borderWidth: 4,
    paddingHorizontal: spacing.md,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12
  },
  backButtonPressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
    opacity: 0.92
  },
  backIcon: {
    color: pixelColors.ink,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22
  },
  backLabel: {
    color: pixelColors.ink,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20
  },
  wallGrid: {
    ...StyleSheet.absoluteFill,
    backgroundColor: pixelColors.wall,
    borderColor: pixelColors.wallGrid,
    borderWidth: 2
  },
  floor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 300,
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0.42
  },
  floorTile: {
    width: "16.666%",
    height: 54,
    backgroundColor: pixelColors.floorTileA
  },
  floorTileAlt: {
    backgroundColor: pixelColors.floorTileB
  }
});
