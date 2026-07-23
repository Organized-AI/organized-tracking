#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Organized AI

import { run } from "../dist/index.js";

const exitCode = await run(process.argv.slice(2));
process.exit(exitCode);
