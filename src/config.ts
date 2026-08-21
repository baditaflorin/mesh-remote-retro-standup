import { createMeshConfig } from "@baditaflorin/mesh-common";

export const config = createMeshConfig({
  appName: "mesh-remote-retro-standup",
  description: "A browser-local shared standup board with one update per peer.",
  accentHex: "#e879f9",
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
});
