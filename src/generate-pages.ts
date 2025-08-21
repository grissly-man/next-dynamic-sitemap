import { SiteMapURL } from "./types";
import { readdir, stat } from "fs/promises";
import path from "node:path";
import { generateURL, parameterizePath, shouldExcludeURL } from "./util";
import { PAGE_SUFFIX_RE } from "./constants";
import { bundlePage } from "./build";
import { Config } from "./config";

const API_PATH_RE = /^api\//;
const META_PATH_RE = /^_[A-z0-9]+\.[tj]sx?$/;

type StaticPaths = {
  paths: Params[];
};

type Params = {
  params: Record<string, string>;
};

async function introspectPage(
  root: string,
  page: string,
  config?: Config,
): Promise<SiteMapURL[]> {
  const pagePath = path.join(root, page);
  let pageURLPath = page.replace(PAGE_SUFFIX_RE, "");
  if (!pageURLPath.startsWith("/")) {
    pageURLPath = `/${pageURLPath}`;
  }
  const pageStats = await stat(path.join(process.cwd(), pagePath));
  const lastmod = new Date(pageStats.mtime).toISOString();

  if (/\[/.test(pagePath)) {
    const bundle = await bundlePage(pagePath, config);
    if (
      "getStaticPaths" in bundle &&
      typeof bundle.getStaticPaths === "function"
    ) {
      const result: StaticPaths = await bundle.getStaticPaths();
      return result.paths
        .map((params) =>
          parameterizePath(pageURLPath, lastmod, params.params, config),
        )
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

export async function recursePagesDir(
  root: string,
  config?: Config,
): Promise<SiteMapURL[]> {
  const contents = await readdir(path.join(process.cwd(), root), {
    recursive: true,
  });
  const pages = contents
    .filter((p) => !API_PATH_RE.test(p))
    .filter((p) => !META_PATH_RE.test(p))
    .filter((p) => PAGE_SUFFIX_RE.test(p));

  const metadata = await Promise.all(
    pages.map((page) => introspectPage(root, page, config)),
  );
  const metadataFlattened: SiteMapURL[] = [];

  metadata.forEach((page) => {
    metadataFlattened.push(...page);
  });

  return metadataFlattened;
}
