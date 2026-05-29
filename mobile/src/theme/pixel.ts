import type { ModuleKey } from "@/types/domain";

export const pixelColors = {
  ink: "#4f415b",
  inkDeep: "#342b40",
  outline: "#75647f",
  shadow: "#9a7f94",
  wall: "#f3d8df",
  wallStripe: "#f2c2cf",
  floor: "#cbbddd",
  floorTileA: "#f4d5ab",
  floorTileB: "#d1bfd5",
  panel: "#fff0dc",
  panelPink: "#f8d6de",
  panelLavender: "#d9c9ee",
  field: "#fff8ea",
  rose: "#ee8fac",
  roseDeep: "#cf6688",
  blue: "#9fc3df",
  mint: "#b9ddcf",
  gold: "#f6c96f",
  danger: "#f28798",
  white: "#fffaf1",
  finance: "#eeb37c",
  documents: "#bbaee1",
  training: "#a9d8c7",
  heroTitle: "#5b4a71",
  heroTitleShadow: "#f6c5d0",
  wallGrid: "rgba(79, 65, 91, 0.12)",
  panelSheen: "rgba(255, 250, 241, 0.28)",
  menuBackdrop: "rgba(79, 65, 91, 0.46)"
};

export const pixelModuleCodes: Record<ModuleKey, string> = {
  briefs: "BR",
  announcements: "AN",
  "forum-hot": "FO",
  newcomer: "NW",
  finance: "FN",
  documents: "DC",
  training: "TR"
};

export const pixelModuleAccents: Record<ModuleKey, string> = {
  briefs: pixelColors.rose,
  announcements: pixelColors.gold,
  "forum-hot": pixelColors.blue,
  newcomer: pixelColors.mint,
  finance: pixelColors.finance,
  documents: pixelColors.documents,
  training: pixelColors.training
};
