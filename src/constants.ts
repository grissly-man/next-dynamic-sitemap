import path from "node:path";

export const OUTFILE_ROOT = path.join(process.cwd(), ".sitemap-gen-tmp");
export const PUBLIC_DIR = path.join(process.cwd(), "public");
export const BASE_URL = new URL(process.env.SITEMAP_GEN_BASE_URL!);
export const PAGE_SUFFIX_RE = /(?:\/?index)?.[tj]sx?$/;