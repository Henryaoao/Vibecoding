import { describe, expect, it } from "@jest/globals";
import { readFileSync } from "node:fs";
import path from "node:path";
import { endpoints } from "../endpoints";

const forbiddenTrackingTokens = [
  ["recent", "views"].join("_"),
  ["browsing", "history"].join("_"),
  ["view", "history"].join("_"),
  ["reading", "history"].join("_")
];

function readSource(relativePath: string) {
  return readFileSync(path.join(__dirname, "../..", relativePath), "utf8");
}

describe("privacy tracking boundaries", () => {
  it("does not expose browsing-history or recent-view API endpoints", () => {
    const serializedEndpoints = JSON.stringify(endpoints);

    for (const token of forbiddenTrackingTokens) {
      expect(serializedEndpoints).not.toContain(token);
    }
  });

  it("does not add browsing-history or recent-view fields to mobile domain/mock data", () => {
    const source = [
      readSource("types/domain.ts"),
      readSource("api/mock/data.ts"),
      readSource("api/mock/transport.ts")
    ].join("\n");

    for (const token of forbiddenTrackingTokens) {
      expect(source).not.toContain(token);
    }
  });
});
