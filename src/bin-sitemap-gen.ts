#!/usr/bin/env node

import { config as configureDotEnv } from "dotenv-flow";

configureDotEnv();

import { Command } from "commander";
import { rm } from "fs/promises";
import { OUTFILE_ROOT } from "./constants";
import { generateSitemapPublic } from "./sitemap-gen";
import { Config } from "./config";
import path from "node:path";

const program = new Command();

program
  .option("-c, --config <path>", "path to config file")
  .parse(process.argv);

const options = program.opts();

const configPath =
  options.config && path.resolve(process.cwd(), options.config);

const configPromise: Promise<{ default: Config } | undefined> =
  (configPath && import(configPath)) || Promise.resolve();

configPromise
  .then(async (config) => {
    await generateSitemapPublic(config?.default);
    console.log("Generated sitemap public");
  })
  .finally(async () => {
    await rm(OUTFILE_ROOT, { recursive: true });
  });
