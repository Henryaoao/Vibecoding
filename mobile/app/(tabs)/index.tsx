import { router, type Href } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getHomeSummary } from "@/api/home";
import { getProfileSummary } from "@/api/me";
import { useAuth } from "@/auth/AuthProvider";
import { MobileMenu } from "@/components/MobileMenu";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { moduleRoutesByKey } from "@/navigation/moduleRoutes";
import { pixelColors, pixelModuleAccents, pixelModuleCodes } from "@/theme/pixel";
import { spacing } from "@/theme/tokens";

export default function HomeScreen() {
  const { user } = useAuth();
  const { data, error, isFetching, isLoading, refetch } = useQuery({ queryKey: ["mobile", "home"], queryFn: getHomeSummary });
  const { data: profile } = useQuery({ queryKey: ["mobile", "profile"], queryFn: getProfileSummary });
  const showNewcomerOnHome = profile?.preferences.showNewcomerOnHome ?? true;

  if (isLoading) {
    return <LoadingState label="正在加载首页..." />;
  }

  if (error) {
    return <ErrorState message="首页加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  if (!data) {
    return <EmptyState title="暂无首页内容" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wallGrid} pointerEvents="none" />
      <View style={styles.floor} pointerEvents="none">
        {Array.from({ length: 36 }).map((_, index) => (
          <View key={index} style={[styles.floorTile, index % 2 ? styles.floorTileAlt : null]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <MobileMenu />
          <View style={styles.brandPlate}>
            <Text style={styles.brandTitle}>CBCX PROJECTM</Text>
            <Text style={styles.brandSub}>Company Portal RPG</Text>
          </View>
        </View>

        <View style={styles.heroPanel}>
          <View style={styles.panelSheen} pointerEvents="none" />
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>PROJECTM / EMPLOYEE DASHBOARD</Text>
            <Text style={styles.heroTitle}>今日公司简报</Text>
            <Text style={styles.heroText}>你好，{user?.name ?? "同事"}。7 个栏目像任务面板一样集中呈现，优先查看今日简报，再处理公告、热帖、文档与培训。</Text>
          </View>
          <View style={styles.heroActions}>
            <View style={styles.cloudStatus}>
              <View style={[styles.statusPixel, isFetching ? styles.statusPixelBusy : null]} />
              <Text style={styles.cloudText}>{isFetching ? "正在刷新" : "Cloud"}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="重新加载首页内容"
              onPress={() => refetch()}
              disabled={isFetching}
              style={({ pressed }) => [styles.syncButton, pressed ? styles.buttonPressed : null, isFetching ? styles.disabled : null]}
            >
              <Text style={styles.syncText}>重新加载</Text>
            </Pressable>
          </View>
          <PixelCloud />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`查看${data.dailyBrief.title}`}
          onPress={() => router.push(moduleRoutesByKey.briefs.href as Href)}
          style={({ pressed }) => [pressed ? styles.cardPressed : null]}
        >
          <View style={[styles.pixelCard, styles.primaryCard, { borderTopColor: pixelModuleAccents.briefs }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.sectionLabel}>QUEST</Text>
                <Text style={styles.cardTitle}>{data.dailyBrief.title}</Text>
              </View>
              <Text style={styles.badge}>{data.dailyBrief.briefDate}</Text>
            </View>
            {data.dailyBrief.highlights.map((item) => (
              <View key={item} style={styles.highlightRow}>
                <View style={styles.highlightBullet} />
                <Text style={styles.highlight}>{item}</Text>
              </View>
            ))}
            <View style={styles.cardAction}>
              <Text style={styles.cardActionText}>查看详情</Text>
            </View>
            <PixelDots accent={pixelModuleAccents.briefs} />
          </View>
        </Pressable>

        <View style={styles.sectionTitle}>
          <View style={styles.titleDot} />
          <Text style={styles.sectionTitleText}>7 个栏目</Text>
          <View style={styles.titleDot} />
        </View>

        <View style={styles.moduleList}>
          {data.modules
            .filter((module) => module.enabled && (module.key !== "newcomer" || showNewcomerOnHome))
            .map((module) => {
              const moduleRoute = moduleRoutesByKey[module.key];
              const accent = pixelModuleAccents[module.key];

              return (
                <Pressable
                  key={module.key}
                  accessibilityRole="button"
                  accessibilityLabel={`打开${module.title}`}
                  onPress={() => router.push(moduleRoute.href as Href)}
                  style={({ pressed }) => [styles.menuItemWrap, pressed ? styles.buttonPressed : null]}
                >
                  <View style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: accent }]}>
                      <Text style={styles.menuIconText}>{pixelModuleCodes[module.key]}</Text>
                    </View>
                    <View style={styles.menuText}>
                      <Text style={styles.menuTitle}>{module.title}</Text>
                      <Text style={styles.menuSubtitle}>{module.subtitle}</Text>
                    </View>
                    <Text style={styles.menuCount}>{module.count}</Text>
                  </View>
                </Pressable>
              );
            })}
        </View>

        <View style={styles.sectionTitle}>
          <View style={styles.titleDot} />
          <Text style={styles.sectionTitleText}>最新内容</Text>
          <View style={styles.titleDot} />
        </View>

        <View style={styles.summaryGrid}>
          {data.modules
            .filter((module) => module.enabled && module.key !== "briefs" && (module.key !== "newcomer" || showNewcomerOnHome))
            .slice(0, 4)
            .map((module) => {
              const moduleRoute = moduleRoutesByKey[module.key];
              const accent = pixelModuleAccents[module.key];

              return (
                <Pressable
                  key={`summary-${module.key}`}
                  accessibilityRole="button"
                  accessibilityLabel={`查看${module.title}`}
                  onPress={() => router.push(moduleRoute.href as Href)}
                  style={({ pressed }) => [pressed ? styles.cardPressed : null]}
                >
                  <View style={[styles.pixelCard, styles.summaryCard, { borderTopColor: accent }]}>
                    <View style={styles.pixelMosaic}>
                      <View style={[styles.mosaicBlock, { backgroundColor: accent }]} />
                      <View style={[styles.mosaicBlock, { backgroundColor: pixelColors.blue }]} />
                      <View style={[styles.mosaicBlock, { backgroundColor: pixelColors.gold }]} />
                      <View style={[styles.mosaicBlock, { backgroundColor: pixelColors.mint }]} />
                    </View>
                    <Text style={styles.sectionLabel}>{pixelModuleCodes[module.key]}</Text>
                    <Text style={styles.summaryTitle}>
                      {pixelModuleCodes[module.key]} · {module.title}
                    </Text>
                    <Text style={styles.summaryText}>{module.subtitle}</Text>
                    {module.key === "finance" ? <Text style={styles.financeNote}>非投资建议</Text> : null}
                    <PixelDots accent={accent} />
                  </View>
                </Pressable>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PixelCloud() {
  return (
    <View style={styles.pixelCloud} pointerEvents="none">
      <View style={styles.cloudBlockTop} />
      <View style={styles.cloudBlockBody} />
      <View style={styles.cloudEyeLeft} />
      <View style={styles.cloudEyeRight} />
      <View style={styles.cloudMouth} />
      <View style={styles.cloudGold} />
    </View>
  );
}

function PixelDots({ accent }: { accent: string }) {
  return (
    <View style={styles.pixelDots} pointerEvents="none">
      <View style={[styles.pixelDot, { backgroundColor: accent }]} />
      <View style={[styles.pixelDot, { backgroundColor: pixelColors.gold }]} />
      <View style={[styles.pixelDot, { backgroundColor: pixelColors.rose }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: pixelColors.wall
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
    minHeight: 320,
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0.48
  },
  floorTile: {
    width: "16.666%",
    height: 54,
    backgroundColor: pixelColors.floorTileA
  },
  floorTileAlt: {
    backgroundColor: pixelColors.floorTileB
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 84,
    gap: spacing.lg
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  brandPlate: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    backgroundColor: pixelColors.panel,
    borderColor: pixelColors.outline,
    borderWidth: 4,
    paddingHorizontal: spacing.md,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.65,
    shadowRadius: 0,
    elevation: 4
  },
  brandTitle: {
    color: pixelColors.ink,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18
  },
  brandSub: {
    color: pixelColors.roseDeep,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 16
  },
  heroPanel: {
    position: "relative",
    minHeight: 292,
    overflow: "hidden",
    backgroundColor: pixelColors.wallStripe,
    borderColor: pixelColors.outline,
    borderWidth: 4,
    padding: spacing.lg,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 0.75,
    shadowRadius: 0,
    elevation: 8
  },
  panelSheen: {
    ...StyleSheet.absoluteFill,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderColor: pixelColors.panelSheen
  },
  heroCopy: {
    position: "relative",
    zIndex: 1,
    paddingRight: 68
  },
  eyebrow: {
    color: pixelColors.roseDeep,
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 18,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: pixelColors.heroTitle,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 42,
    marginTop: spacing.md,
    textShadowColor: pixelColors.heroTitleShadow,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0
  },
  heroText: {
    color: pixelColors.ink,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 24,
    marginTop: spacing.md
  },
  heroActions: {
    position: "relative",
    zIndex: 1,
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  cloudStatus: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: pixelColors.field,
    borderColor: pixelColors.outline,
    borderWidth: 3,
    paddingHorizontal: spacing.md,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.72,
    shadowRadius: 0,
    elevation: 4
  },
  statusPixel: {
    width: 12,
    height: 12,
    backgroundColor: pixelColors.mint,
    shadowColor: pixelColors.outline,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0
  },
  statusPixelBusy: {
    backgroundColor: pixelColors.gold
  },
  cloudText: {
    color: pixelColors.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  syncButton: {
    minHeight: 46,
    alignSelf: "flex-start",
    justifyContent: "center",
    backgroundColor: pixelColors.gold,
    borderColor: pixelColors.outline,
    borderWidth: 3,
    paddingHorizontal: spacing.md,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.72,
    shadowRadius: 0,
    elevation: 4
  },
  syncText: {
    color: pixelColors.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  disabled: {
    opacity: 0.7
  },
  pixelCloud: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 100,
    height: 84
  },
  cloudBlockTop: {
    position: "absolute",
    top: 8,
    left: 28,
    width: 50,
    height: 14,
    backgroundColor: pixelColors.white
  },
  cloudBlockBody: {
    position: "absolute",
    top: 22,
    left: 14,
    width: 72,
    height: 38,
    backgroundColor: pixelColors.white
  },
  cloudEyeLeft: {
    position: "absolute",
    top: 34,
    left: 34,
    width: 8,
    height: 8,
    backgroundColor: pixelColors.ink
  },
  cloudEyeRight: {
    position: "absolute",
    top: 34,
    left: 66,
    width: 8,
    height: 8,
    backgroundColor: pixelColors.ink
  },
  cloudMouth: {
    position: "absolute",
    top: 50,
    left: 44,
    width: 22,
    height: 8,
    backgroundColor: pixelColors.rose
  },
  cloudGold: {
    position: "absolute",
    top: 68,
    left: 36,
    width: 36,
    height: 10,
    backgroundColor: pixelColors.gold
  },
  pixelCard: {
    position: "relative",
    overflow: "hidden",
    minHeight: 164,
    backgroundColor: pixelColors.panel,
    borderColor: pixelColors.outline,
    borderTopWidth: 6,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
    elevation: 7
  },
  primaryCard: {
    minHeight: 240
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md
  },
  sectionLabel: {
    color: pixelColors.roseDeep,
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 18,
    textTransform: "uppercase"
  },
  cardTitle: {
    color: pixelColors.inkDeep,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: spacing.xs
  },
  badge: {
    minHeight: 28,
    borderColor: pixelColors.outline,
    borderWidth: 3,
    backgroundColor: pixelColors.field,
    color: pixelColors.ink,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  highlightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  highlightBullet: {
    width: 10,
    height: 10,
    marginTop: 7,
    backgroundColor: pixelColors.gold,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0
  },
  highlight: {
    flex: 1,
    color: pixelColors.ink,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 24
  },
  cardAction: {
    minHeight: 44,
    alignSelf: "flex-start",
    justifyContent: "center",
    backgroundColor: pixelColors.gold,
    borderColor: pixelColors.outline,
    borderWidth: 3,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.72,
    shadowRadius: 0,
    elevation: 4
  },
  cardActionText: {
    color: pixelColors.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  sectionTitle: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: pixelColors.panelPink,
    borderColor: pixelColors.outline,
    borderWidth: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
    elevation: 5
  },
  titleDot: {
    width: 12,
    height: 12,
    backgroundColor: pixelColors.gold,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0
  },
  sectionTitleText: {
    color: pixelColors.ink,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 20
  },
  moduleList: {
    gap: spacing.md
  },
  menuItemWrap: {
    minHeight: 64
  },
  menuItem: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: pixelColors.panel,
    borderColor: pixelColors.outline,
    borderWidth: 3,
    padding: spacing.md,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.72,
    shadowRadius: 0,
    elevation: 4
  },
  menuIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderColor: pixelColors.outline,
    borderWidth: 3
  },
  menuIconText: {
    color: pixelColors.ink,
    fontSize: 8,
    fontWeight: "900"
  },
  menuText: {
    flex: 1,
    minWidth: 0
  },
  menuTitle: {
    color: pixelColors.ink,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 22
  },
  menuSubtitle: {
    color: pixelColors.ink,
    opacity: 0.75,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18
  },
  menuCount: {
    minWidth: 32,
    textAlign: "right",
    color: pixelColors.roseDeep,
    fontSize: 15,
    fontWeight: "900"
  },
  summaryGrid: {
    gap: spacing.md
  },
  summaryCard: {
    minHeight: 186,
    paddingTop: 52
  },
  pixelMosaic: {
    position: "absolute",
    top: spacing.md,
    left: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    width: 44,
    gap: 6
  },
  mosaicBlock: {
    width: 16,
    height: 16
  },
  summaryTitle: {
    color: pixelColors.inkDeep,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 26
  },
  summaryText: {
    color: pixelColors.ink,
    opacity: 0.75,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 22
  },
  financeNote: {
    alignSelf: "flex-start",
    minHeight: 28,
    borderColor: pixelColors.outline,
    borderWidth: 3,
    backgroundColor: pixelColors.gold,
    color: pixelColors.ink,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  pixelDots: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: "row",
    gap: 6
  },
  pixelDot: {
    width: 10,
    height: 10
  },
  buttonPressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
    opacity: 0.92
  },
  cardPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    opacity: 0.95
  }
});
