import {SiteMapURL} from "./types";
import {readdir, stat} from "fs/promises";
import path from "node:path";
import {bundlePage, generateURL, parameterizePath} from "./util";
import {PAGE_SUFFIX_RE} from "./constants";

const API_PATH_RE = /^api\//;
const META_PATH_RE = /^_[A-z0-9]+\.[tj]sx?$/;

type StaticPaths = {
    paths: Params[];
}

type Params = {
    params: Record<string, string>
}

async function introspectPage(root: string, page: string): Promise<SiteMapURL[]> {
    const pagePath = path.join(root, page);
    const pageURLPath = page.replace(PAGE_SUFFIX_RE, "");
    const pageStats = await stat(path.join(process.cwd(), pagePath));
    const lastmod = new Date(pageStats.mtime).toISOString();

    if (/\[/.test(pagePath)) {
        const bundle = await bundlePage(pagePath);
        if (
            "getStaticPaths" in bundle &&
            typeof bundle.getStaticPaths === "function"
        ) {
            const result: StaticPaths = await bundle.getStaticPaths();
            return result.paths.map((params) =>
                parameterizePath(pageURLPath, lastmod, params.params),
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

export async function recursePagesDir(root: string): Promise<SiteMapURL[]> {
    const contents = await readdir(path.join(process.cwd(), root), {
        recursive: true,
    });
    const pages = contents
        .filter(p => !API_PATH_RE.test(p))
        .filter(p => !META_PATH_RE.test(p))
        .filter(p => PAGE_SUFFIX_RE.test(p));

    const metadata = await Promise.all(
        pages.map((page) => introspectPage(root, page)),
    );
    const metadataFlattened: SiteMapURL[] = [];

    metadata.forEach((page) => {
        metadataFlattened.push(...page);
    });

    return metadataFlattened;
}