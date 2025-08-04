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
    loader: {
      '.woff': 'file',
      '.woff2': 'file',
      '.ttf': 'file',
      '.eot': 'file',

      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.gif': 'file',
      '.webp': 'file',
      '.avif': 'file',
      '.ico': 'file',

      '.svg': 'file',   // raw import only, not React components
      '.txt': 'text',
      '.md': 'text',
      '.csv': 'text',
      '.tsv': 'text',

      '.mp3': 'file',
      '.wav': 'file',
      '.ogg': 'file',
      '.flac': 'file',

      '.mp4': 'file',
      '.webm': 'file',
      '.mov': 'file',

      '.css': 'file',  // only if you want styles; omit if styles cause side effects you want to avoid
    }
  });
  return import(outfile);
}
