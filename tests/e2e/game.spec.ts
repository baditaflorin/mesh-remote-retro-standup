import { expect, test } from "@playwright/test";
import { openTwoPeers } from "@baditaflorin/mesh-common/testing";

test("a shared timebox and submitted update reach another peer", async ({ browser, baseURL }) => {
  const { a, b, cleanup } = await openTwoPeers(browser, baseURL ?? "", {
    storagePrefix: "mesh-remote-retro-standup",
  });

  try {
    await a.getByLabel("Display name").fill("Alice");
    await b.getByLabel("Display name").fill("Bob");

    await a.getByRole("button", { name: "Start one-minute timebox" }).click();
    await expect(a.getByText("time left")).toBeVisible();
    await expect(b.getByText("time left")).toBeVisible();

    await a.getByLabel("Yesterday").fill("Shipped the release");
    await a.getByLabel("Today").fill("Verify the rollout");
    await a.getByRole("button", { name: "Save my update" }).click();

    await expect(b.getByText("Alice")).toBeVisible();
    await expect(b.getByText("Yesterday — Shipped the release")).toBeVisible();
    await expect(b.getByText("Today — Verify the rollout")).toBeVisible();
  } finally {
    await cleanup();
  }
});
