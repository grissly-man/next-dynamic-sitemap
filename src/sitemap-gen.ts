import path from "node:path";
import { mkdir, stat, writeFile } from "fs/promises";
import { recurseAppDir } from "./generate-app";
import { OUTFILE_ROOT, PUBLIC_DIR } from "./constants";
import { SiteMapURL } from "./types";
import { recursePagesDir } from "./generate-pages";
import { generateXMLSitemap } from "./util";
import { Config } from "./config";

const PAGES = "pages";
const APP = "app";
const SRC = "src";

async function dirExists(page: string) {
  try {
    await stat(path.join(page));
    return true;
  } catch (error) {
    return false;
  }
}

export async function generateSitemapPublic(config?: Config) {
  await Promise.all([
    mkdir(OUTFILE_ROOT, { recursive: true }),
    mkdir(PUBLIC_DIR, { recursive: true }),
  ]);
  const dir = process.cwd();
  const pagesSrcDir = path.join(SRC, PAGES);
  const appSrcDir = path.join(SRC, APP);
  const pagesDir = path.join(PAGES);
  const appDir = path.join(APP);

  const pagesSrcDirFull = path.join(dir, pagesSrcDir);
  const appSrcDirFull = path.join(dir, appSrcDir);
  const pagesDirFull = path.join(dir, pagesDir);
  const appDirFull = path.join(dir, appDir);

  const urls: SiteMapURL[] = [];

  const [hasSrcRootPages, hasSrcRootApp, hasNonSrcRootPages, hasNonSrcRootApp] =
    await Promise.all([
      dirExists(pagesSrcDirFull),
      dirExists(appSrcDirFull),
      dirExists(pagesDirFull),
      dirExists(appDirFull),
    ]);

  if (hasNonSrcRootApp) {
    const segmentUrls = await recurseAppDir(appDir, config);
    urls.push(...segmentUrls);
  }

  if (hasSrcRootApp) {
    const segmentUrls = await recurseAppDir(appSrcDir, config);
    urls.push(...segmentUrls);
  }

  if (hasNonSrcRootPages) {
    const segmentUrls = await recursePagesDir(pagesDir, config);
    urls.push(...segmentUrls);
  }

  if (hasSrcRootPages) {
    const segmentUrls = await recursePagesDir(pagesSrcDir, config);
    urls.push(...segmentUrls);
  }

  const xmlMap = generateXMLSitemap(urls);
  await writeFile(path.join(dir, "public/sitemap.xml"), xmlMap);
}
