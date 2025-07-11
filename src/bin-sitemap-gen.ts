#!/usr/bin/env node

import { config as configureDotEnv } from "dotenv-flow";

configureDotEnv();

import { rm } from "fs/promises";
import { OUTFILE_ROOT } from "./constants";
import { generateSitemapPublic } from "./sitemap-gen";

generateSitemapPublic()
  .then(() => console.log("Generated sitemap public"))
  .finally(async () => {
    await rm(OUTFILE_ROOT, { recursive: true });
  });
