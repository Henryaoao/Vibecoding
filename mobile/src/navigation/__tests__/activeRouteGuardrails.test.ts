import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "@jest/globals";

const appRoot = path.resolve(__dirname, "../../../app");
const srcRoot = path.resolve(__dirname, "../..");

const protectedStacks = ["modules", "me", "briefs", "announcements", "forum-hot", "newcomer", "finance", "documents", "training"];
const activeDetailScreens = [
  "announcements/[id]",
  "briefs/[id]",
  "forum-hot/[id]",
  "newcomer/[id]",
  "finance/[id]",
  "documents/[id]",
  "training/[id]"
];
const parkedRouteNames = ["admin", "notifications", "favorites", "downloads"];
const activeUiRoots = [appRoot, path.join(srcRoot, "components"), path.join(srcRoot, "navigation"), path.join(srcRoot, "screens")];
const parkedFeaturePattern = /Admin Console|通知偏好|我的收藏|下载记录|浏览历史|最近浏览|阅读记录|expo-notifications|push notification|notification preferences/i;

function walkFiles(root: string): string[] {
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") {
        return [];
      }
      return walkFiles(entryPath);
    }
    return entry.isFile() ? [entryPath] : [];
  });
}

describe("active mobile route guardrails", () => {
  it("wraps every active stack outside tabs in the protected mobile menu shell", () => {
    for (const stack of protectedStacks) {
      const layout = path.join(appRoot, stack, "_layout.tsx");
      expect(fs.existsSync(layout)).toBe(true);
      expect(fs.readFileSync(layout, "utf8")).toContain("ProtectedStackLayout");
    }
  });

  it("does not keep parked notification runtime dependency active", () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../package.json"), "utf8"));
    const packageLock = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../package-lock.json"), "utf8"));

    expect(packageJson.dependencies ?? {}).not.toHaveProperty("expo-notifications");
    expect(packageJson.devDependencies ?? {}).not.toHaveProperty("expo-notifications");
    expect(packageLock.packages ?? {}).not.toHaveProperty("node_modules/expo-notifications");
  });

  it("keeps active detail routes registered in the root stack", () => {
    const rootLayout = fs.readFileSync(path.join(appRoot, "_layout.tsx"), "utf8");

    for (const screen of activeDetailScreens) {
      expect(rootLayout).toContain(`name="${screen}"`);
    }
  });

  it("does not restore parked route files", () => {
    const appFiles = walkFiles(appRoot).map((file) => path.relative(appRoot, file));

    for (const parkedRoute of parkedRouteNames) {
      expect(appFiles.some((file) => file.split(path.sep).includes(parkedRoute))).toBe(false);
    }
  });

  it("does not rewire parked favorite helpers into active UI", () => {
    const activeUi = activeUiRoots.flatMap(walkFiles).filter((file) => /\.(ts|tsx)$/.test(file));

    for (const file of activeUi) {
      const source = fs.readFileSync(file, "utf8");
      expect(source).not.toMatch(/toggle[A-Za-z]+Favorite/);
      expect(source).not.toMatch(/加入收藏|已收藏|我的收藏/);
    }
  });

  it("does not expose parked feature copy or imports in active UI shells", () => {
    const activeUi = activeUiRoots.flatMap(walkFiles).filter((file) => /\.(ts|tsx)$/.test(file) && !file.includes(`${path.sep}__tests__${path.sep}`));

    for (const file of activeUi) {
      const source = fs.readFileSync(file, "utf8");
      expect(source).not.toMatch(parkedFeaturePattern);
    }
  });
});
