import { readdir, stat } from "fs/promises";
import path from "node:path";
import { generateURL, parameterizePath, shouldExcludeURL } from "./util";
import { SiteMapURL } from "./types";
import { bundlePage } from "./build";
import { Config } from "./config";

const PAGE_RE_TEXT = "page.[tj]sx?$";
const PAGE_RE_SUFFIX_TEXT = `/?${PAGE_RE_TEXT}`;

const PAGE_RE = new RegExp(PAGE_RE_TEXT);
const PAGE_SUFFIX_RE = new RegExp(PAGE_RE_SUFFIX_TEXT);
const ROUTE_GROUP_RE = /\(.+?\)\//g;

async function introspectPage(
  root: string,
  page: string,
  config?: Config,
): Promise<SiteMapURL[]> {
  const pagePath = path.join(root, page);
  let pageURLPath = page
    .replace(ROUTE_GROUP_RE, "")
    .replace(PAGE_SUFFIX_RE, "");

  if (!pageURLPath.startsWith("/")) {
    pageURLPath = `/${pageURLPath}`;
  }

  const pageStats = await stat(path.join(process.cwd(), pagePath));
  const lastmod = new Date(pageStats.mtime).toISOString();

  if (/\[/.test(pagePath)) {
    const bundle = await bundlePage(pagePath, config);
    if (
      "generateStaticParams" in bundle &&
      typeof bundle.generateStaticParams === "function"
    ) {
      const result: Record<string, any>[] = await bundle.generateStaticParams();
      return result
        .map((params) => parameterizePath(pageURLPath, lastmod, params, config))
        .filter((f) => !!f);
    }
  }

  if (shouldExcludeURL(pageURLPath, config?.exclude)) {
    return [];
  }

  return [
    {
      loc: generateURL(pageURLPath),
      lastmod,
      priority: !pageURLPath || pageURLPath === "/" ? 1 : 0.8, // home page gets higher priority
    },
  ];
}

export async function recurseAppDir(root: string, config?: Config) {
  const contents = await readdir(path.join(process.cwd(), root), {
    recursive: true,
  });
  const pages = contents.filter((page) => PAGE_RE.test(page));
  const metadata = await Promise.all(
    pages.map(async (page) => introspectPage(root, page, config)),
  );
  const metadataFlattened: SiteMapURL[] = [];

  metadata.forEach((page) => {
    metadataFlattened.push(...page);
  });

  return metadataFlattened;
}
