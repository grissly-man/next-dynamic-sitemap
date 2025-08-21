import { BuildOptions } from "esbuild";

export type Config = {
  esbuild?: BuildOptions;
  exclude?: (string | RegExp)[];
};
