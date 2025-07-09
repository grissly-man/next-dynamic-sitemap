import * as path from "node:path";
import * as fs from "node:fs/promises";
import {Builder} from "xml2js"
import { NextResponse } from 'next/server'

const rscFileRegex = /\.rsc$/;

const DEFAULT_EXCLUDE = ["/index", "/_not-found"];

export type SiteMap = {
    urlset: SiteMapURLSet;
}

export type SiteMapURLSet = {
    $: {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
    },
    url: SiteMapURL[]
}

export type SiteMapURL = {
    loc: string;
    changefreq?: "hourly";
    priority?: number;
    lastmod?: string;
}

export type GeneratorOptions = {
    fileRoot?: string;
    include?: string[];
    exclude?: string[];
    pathOptions?: {
        [path: string]: Omit<SiteMapURL, "loc">
    }
}

async function crawlFilesystem(dirName: string): Promise<string[]> {
    const contents = await fs.readdir(dirName, {withFileTypes: true});
    const directories = contents.filter(c => c.isDirectory());
    const resources: string[] = contents.filter(c => c.isFile() && rscFileRegex.test(c.name)).map(c => path.join(dirName, c.name.replace(rscFileRegex, "")));
    const recursiveResources = await Promise.all(directories.map(d => crawlFilesystem(path.join(dirName, d.name))));

    for (let page of recursiveResources) {
        resources.push(...page);
    }

    return resources;
}

export async function generateSitemap(baseHref: string, options?: GeneratorOptions) {
    const appDir = path.join(options?.fileRoot || process.cwd(), 'app');
    const exclude = new Set(options?.exclude || DEFAULT_EXCLUDE);
    options?.include?.forEach((i) => {
        if (exclude.has(i)) {
            exclude.delete(i);
        }
    });
    const resources = await crawlFilesystem(appDir);
    const urls: SiteMapURL[] = resources.map(resource => {
        return resource.replace(appDir, "")
    }).filter(path => {
        return !exclude.has(path);
    }).map(path => {
        const pathOptions = options?.pathOptions && options.pathOptions[path];
        const url: SiteMapURL = {
            loc: new URL(path, baseHref).toString(),
            ...pathOptions
        }

        return url;
    });

    const map: SiteMap = {
        urlset: {
            $: {
                xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9"
            },
            url: urls
        }
    }

    const builder = new Builder();
    return builder.buildObject(map);
}

export function SiteMap(baseHref: string, options?: GeneratorOptions) {
    return {
        revalidate: 10,
        GET: async () => {
            const sitemap = await generateSitemap(baseHref, options)

            return new NextResponse(sitemap, {
                headers: {
                    'Content-Type': 'application/xml',
                },
            })
        }
    }}