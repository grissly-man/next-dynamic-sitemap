import { BASE_URL } from "./constants";
import { ChangeFreq, SiteMap, SiteMapURL } from "./types";
import { Builder } from "xml2js";
import { orderBy } from "lodash";

export function generateURL(path: string) {
  return new URL(path, BASE_URL).toString();
}

function getChangeFreqRanking(changeFreq?: ChangeFreq) {
  switch (changeFreq) {
    case ChangeFreq.NEVER:
      return 0;
    case ChangeFreq.YEARLY:
      return 1;
    case ChangeFreq.MONTHLY:
      return 2;
    case ChangeFreq.WEEKLY:
      return 3;
    case ChangeFreq.DAILY:
      return 4;
    case ChangeFreq.HOURLY:
      return 5;
    case ChangeFreq.ALWAYS:
      return 6;
  }

  return 0;
}

export function generateXMLSitemap(urls: SiteMapURL[]): string {
  const urlMap: { [key: string]: SiteMapURL } = {};

  for (const url of urls) {
    if (!urlMap[url.loc]) {
      urlMap[url.loc] = url;
      continue;
    }

    const existing = urlMap[url.loc];

    if (
      !existing.lastmod ||
      new Date(existing.lastmod) < new Date(url.lastmod || 0)
    ) {
      existing.lastmod = url.lastmod;
    }

    if (!existing.priority || existing.priority < (url.priority || 0)) {
      existing.priority = url.priority;
    }

    if (
      getChangeFreqRanking(existing.changefreq) <
      getChangeFreqRanking(url.changefreq)
    ) {
      existing.changefreq = url.changefreq;
    }
  }

  const dedupedUrls = orderBy(
    Object.values(urlMap),
    ["priority", "loc", "lastmod"],
    ["desc", "asc", "desc"],
  );

  const map: SiteMap = {
    urlset: {
      $: {
        xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
      },
      url: dedupedUrls,
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
