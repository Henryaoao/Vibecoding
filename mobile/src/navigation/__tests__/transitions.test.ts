import { describe, expect, it } from "@jest/globals";
import { rootStackScreenOptions } from "../transitions";

describe("rootStackScreenOptions", () => {
  it("uses a reverse slide when returning to the auth flow after logout", () => {
    expect(rootStackScreenOptions.auth).toMatchObject({
      animation: "slide_from_left"
    });
  });

  it("keeps the main app entering from the normal forward direction after login", () => {
    expect(rootStackScreenOptions.tabs).toMatchObject({
      animation: "slide_from_right"
    });
  });
});
