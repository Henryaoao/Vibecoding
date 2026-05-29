import { router, type Href, usePathname } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { moduleRoutes } from "@/navigation/moduleRoutes";
import { pixelColors } from "@/theme/pixel";
import { spacing } from "@/theme/tokens";

const menuItems = [
  { label: "首页", href: "/(tabs)" },
  ...moduleRoutes.map((module) => ({ label: module.title, href: module.href })),
  { label: "个人中心", href: "/(tabs)/me" }
];

function normalizePath(href: string) {
  const withoutGroup = href.replace(/^\/\(tabs\)/, "");
  return withoutGroup.length === 0 ? "/" : withoutGroup;
}

function isActiveMenuItem(href: string, pathname: string) {
  const normalizedHref = normalizePath(href);

  if (normalizedHref === "/") {
    return pathname === "/";
  }

  if (normalizedHref.startsWith("/modules/")) {
    const modulePath = normalizedHref.replace("/modules", "");
    return pathname === modulePath || pathname.startsWith(`${modulePath}/`);
  }

  return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
}

function isCurrentRoute(href: string, pathname: string) {
  return normalizePath(href) === pathname;
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = typeof usePathname === "function" ? usePathname() : "/";

  const navigateTo = (href: string) => {
    setOpen(false);
    if (isCurrentRoute(href, pathname)) {
      return;
    }
    router.push(href as Href);
  };

  return (
    <View pointerEvents="box-none" style={[styles.menuHost, open ? styles.menuHostOpen : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? "关闭菜单" : "打开菜单"}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.menuButton, pressed ? styles.pressed : null]}
      >
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
      </Pressable>

      {open ? (
        <>
          <Pressable accessibilityLabel="关闭菜单遮罩" onPress={() => setOpen(false)} style={styles.backdrop} />
          <View style={styles.panel}>
            <ScrollView contentContainerStyle={styles.items}>
              {menuItems.map((item, index) => {
                const active = isActiveMenuItem(item.href, pathname);
                return (
                  <Pressable
                    key={`${item.href}-${item.label}`}
                    accessibilityRole="button"
                    accessibilityLabel={`打开${item.label}`}
                    accessibilityState={{ selected: active }}
                    onPress={() => navigateTo(item.href)}
                    style={({ pressed }) => [
                      styles.item,
                      index % 2 ? styles.itemAlt : null,
                      active ? styles.itemActive : null,
                      pressed ? styles.itemPressed : null
                    ]}
                  >
                    <Text style={[styles.itemMarker, active ? styles.itemMarkerActive : null]}>{">"}</Text>
                    <Text style={[styles.itemLabel, active ? styles.itemLabelActive : null]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  menuHost: {
    alignSelf: "flex-start"
  },
  menuHostOpen: {
    zIndex: 100
  },
  menuButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: pixelColors.panelPink,
    borderColor: pixelColors.outline,
    borderWidth: 4,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12
  },
  menuLine: {
    width: 24,
    height: 4,
    backgroundColor: pixelColors.ink
  },
  pressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
    opacity: 0.92
  },
  backdrop: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -4000,
    zIndex: 101,
    backgroundColor: pixelColors.menuBackdrop
  },
  panel: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 14,
    zIndex: 103,
    width: 324,
    maxWidth: 360,
    maxHeight: 560,
    backgroundColor: pixelColors.panel,
    borderColor: pixelColors.outline,
    borderWidth: 4,
    padding: spacing.lg,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 14
  },
  items: {
    gap: spacing.sm
  },
  item: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: pixelColors.field,
    borderColor: pixelColors.outline,
    borderWidth: 3,
    paddingHorizontal: spacing.md,
    shadowColor: pixelColors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
    elevation: 4
  },
  itemAlt: {
    backgroundColor: pixelColors.white
  },
  itemActive: {
    backgroundColor: pixelColors.ink
  },
  itemPressed: {
    backgroundColor: pixelColors.gold,
    transform: [{ translateX: 2 }, { translateY: 2 }]
  },
  itemMarker: {
    color: pixelColors.gold,
    fontSize: 16,
    fontWeight: "900"
  },
  itemMarkerActive: {
    color: pixelColors.gold
  },
  itemLabel: {
    flex: 1,
    color: pixelColors.ink,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20
  },
  itemLabelActive: {
    color: pixelColors.white
  }
});
