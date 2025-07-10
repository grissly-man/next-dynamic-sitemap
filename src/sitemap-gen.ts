#!/usr/bin/env node

import path from "node:path";
import { readdir, stat, rm, writeFile, mkdir } from "fs/promises";
import { build } from "esbuild";
import { Builder } from "xml2js";
import { config as configureDotEnv } from "dotenv-flow";

configureDotEnv();

const PAGES = "pages";
const APP = "app";
const SRC = "src";

const PAGE_RE_TEXT = "page.[tj]sx?$";
const PAGE_RE_SUFFIX_TEXT = `/?${PAGE_RE_TEXT}`;

const PAGE_RE = new RegExp(PAGE_RE_TEXT);
const PAGE_SUFFIX_RE = new RegExp(PAGE_RE_SUFFIX_TEXT);

const OUTFILE_ROOT = path.join(process.cwd(), ".sitemap-gen-tmp");

const BASE_URL = new URL(process.env.SITEMAP_GEN_BASE_URL!);

export type SiteMap = {
  urlset: SiteMapURLSet;
};

export type SiteMapURLSet = {
  $: {
    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9";
  };
  url: SiteMapURL[];
};

export type SiteMapURL = {
  loc: string;
  changefreq?: "hourly";
  priority?: number;
  lastmod?: string;
};

function generateURL(path: string) {
  return new URL(path, BASE_URL).toString();
}

async function dirExists(page: string) {
  try {
    await stat(path.join(page));
    return true;
  } catch (error) {
    return false;
  }
}

async function bundlePage(page: string) {
  const outfile = path.join(OUTFILE_ROOT, page.replace(PAGE_RE, "page.cjs"));
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

function parameterizePath(
  pagePath: string,
  pageURLPath: string,
  params: Record<string, any>,
): SiteMapURL {
  let parameterizedPath = pagePath;
  let lastmod = pageURLPath;

  for (let key in params) {
    const param = params[key];
    if (typeof param === "string") {
      const replaceValue = new RegExp(`\\[${key}]`, "g");
      parameterizedPath = parameterizedPath.replace(replaceValue, param);
    }
  }

  if (params.lastModified instanceof Date) {
    lastmod = params.lastModified.toISOString();
  }

  return {
    loc: generateURL(parameterizedPath),
    lastmod,
    priority: 0.4, // generated pages are lower priority than static pages
  };
}

async function introspectPage(
  root: string,
  page: string,
): Promise<SiteMapURL[]> {
  const pagePath = path.join(root, page);
  const pageURLPath = page.replace(PAGE_SUFFIX_RE, "");
  const pageStats = await stat(path.join(process.cwd(), pagePath));
  const lastmod = new Date(pageStats.mtime).toISOString();

  if (/\[/.test(pagePath)) {
    const bundle = await bundlePage(pagePath);
    if (
      "generateStaticParams" in bundle &&
      typeof bundle.generateStaticParams === "function"
    ) {
      const result: Record<string, any>[] = await bundle.generateStaticParams();
      return result.map((params) =>
        parameterizePath(pageURLPath, lastmod, params),
      );
    }
  }

  return [
    {
      loc: generateURL(pageURLPath),
      lastmod,
      priority: pageURLPath ? 0.8 : 1, // home page gets higher priority
    },
  ];
}

async function recurseAppDir(root: string) {
  const contents = await readdir(path.join(process.cwd(), root), {
    recursive: true,
  });
  const pages = contents.filter((page) => PAGE_RE.test(page));
  const metadata = await Promise.all(
    pages.map(async (page) => introspectPage(root, page)),
  );
  const metadataFlattened: SiteMapURL[] = [];

  metadata.forEach((page) => {
    metadataFlattened.push(...page);
  });

  return metadataFlattened;
}

async function generateSitemapPublic() {
  await mkdir(OUTFILE_ROOT, { recursive: true });
  const dir = process.cwd();
  const pagesSrcDir = path.join(SRC, APP);
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
    const segmentUrls = await recurseAppDir(appDir);
    urls.push(...segmentUrls);
  }

  if (hasSrcRootApp) {
    const segmentUrls = await recurseAppDir(appSrcDir);
    urls.push(...segmentUrls);
  }

  const map: SiteMap = {
    urlset: {
      $: {
        xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
      },
      url: urls,
    },
  };

  const builder = new Builder();
  const xmlMap = builder.buildObject(map);

  await writeFile(path.join(dir, "public/sitemap.xml"), xmlMap);
}

generateSitemapPublic()
  .then(() => console.log("Generated sitemap public"))
  .finally(async () => {
    await rm(OUTFILE_ROOT, { recursive: true });
  });
