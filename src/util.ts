import { BASE_URL } from "./constants";
import { SiteMap, SiteMapURL } from "./types";
import { Builder } from "xml2js";

export function generateURL(path: string) {
  return new URL(path, BASE_URL).toString();
}

export function generateXMLSitemap(urls: SiteMapURL[]): string {
  const map: SiteMap = {
    urlset: {
      $: {
        xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
      },
      url: urls,
    },
  };

  const builder = new Builder();
  return builder.buildObject(map);
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
