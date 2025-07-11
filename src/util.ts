import {BASE_URL, OUTFILE_ROOT, PAGE_SUFFIX_RE} from "./constants";
import path from "node:path";
import {build} from "esbuild";
import {SiteMapURL} from "./types";

export function generateURL(path: string) {
    return new URL(path, BASE_URL).toString();
}

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

export function parameterizePath(
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