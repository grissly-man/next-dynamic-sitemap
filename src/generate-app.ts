import { readdir, stat } from "fs/promises";
import path from "node:path";
import { generateURL, parameterizePath } from "./util";
import { SiteMapURL } from "./types";
import { bundlePage } from "./build";

const PAGE_RE_TEXT = "page.[tj]sx?$";
const PAGE_RE_SUFFIX_TEXT = `/?${PAGE_RE_TEXT}`;

const PAGE_RE = new RegExp(PAGE_RE_TEXT);
const PAGE_SUFFIX_RE = new RegExp(PAGE_RE_SUFFIX_TEXT);

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

export async function recurseAppDir(root: string) {
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
