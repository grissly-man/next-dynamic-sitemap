import path from "node:path";
import { OUTFILE_ROOT, PAGE_SUFFIX_RE } from "./constants";
import { build } from "esbuild";

export async function bundlePage(page: string) {
  const outfile = path.join(OUTFILE_ROOT, page.replace(PAGE_SUFFIX_RE, ".cjs"));
  await build({
    entryPoints: [path.join(process.cwd(), page)],
    outfile,
    platform: "node",
    bundle: true,
    format: "cjs",
    sourcemap: false,
  });
  return import(outfile);
}
