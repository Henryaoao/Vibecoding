import { describe, expect, it } from "@jest/globals";
import fs from "node:fs";
import path from "node:path";
import { moduleRoutes } from "../moduleRoutes";

const appRoot = path.resolve(__dirname, "../../../app");

function routeFileForHref(href: string) {
  const routePath = href.replace(/^\//, "");
  return path.join(appRoot, `${routePath}.tsx`);
}

describe("moduleRoutes", () => {
  it("covers the seven mobile user portal modules", () => {
    expect(moduleRoutes.map((module) => module.key)).toEqual([
      "briefs",
      "announcements",
      "forum-hot",
      "newcomer",
      "finance",
      "documents",
      "training"
    ]);
  });

  it("keeps detail routes reachable from the mobile shell", () => {
    expect(moduleRoutes.map((module) => module.href)).toEqual([
      "/modules/briefs",
      "/modules/announcements",
      "/modules/forum-hot",
      "/modules/newcomer",
      "/modules/finance",
      "/(tabs)/documents",
      "/(tabs)/training"
    ]);
  });

  it("points every menu module href at an implemented Expo route file", () => {
    for (const module of moduleRoutes) {
      expect(fs.existsSync(routeFileForHref(module.href))).toBe(true);
    }
  });

  it("keeps the finance module inside the no investment advice boundary", () => {
    const financeModule = moduleRoutes.find((module) => module.key === "finance");

    expect(financeModule?.complianceNote).toContain("不构成投资建议");
    expect(financeModule?.complianceNote).toContain("不提供股票推荐");
    expect(financeModule?.complianceNote).toContain("不提供买卖建议");
  });
});
