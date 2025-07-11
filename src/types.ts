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
