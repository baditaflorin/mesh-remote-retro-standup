import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMockRoom } from "@baditaflorin/mesh-common/testing";
import { Feature, isValidUpdate } from "../../src/Feature";
import { config } from "../../src/config";
describe("standup", () => {
  it("validates complete updates", () => {
    expect(
      isValidUpdate({
        yesterday: "Shipped work",
        today: "Review work",
        blocker: "",
        submittedAt: 1,
      }),
    ).toBe(true);
    expect(isValidUpdate({ yesterday: "x", today: "ok", blocker: "", submittedAt: 1 })).toBe(false);
  });
  it("renders timebox", () => {
    render(<Feature room={createMockRoom()} config={config} />);
    expect(
      screen.getByRole("heading", { name: "Clear updates. No standup drag." }),
    ).toBeInTheDocument();
  });
});
