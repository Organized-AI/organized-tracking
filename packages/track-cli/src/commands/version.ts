// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { registerCommand } from "../registry.js";

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../package.json", import.meta.url)), "utf8"),
) as { version: string };

registerCommand("version", "show", async () => {
  console.log(pkg.version);
});
