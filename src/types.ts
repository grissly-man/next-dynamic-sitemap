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
  changefreq?: ChangeFreq;
  priority?: number;
  lastmod?: string;
};

export enum ChangeFreq {
  NEVER = "never",
  YEARLY = "yearly",
  MONTHLY = "monthly",
  WEEKLY = "weekly",
  DAILY = "daily",
  HOURLY = "hourly",
  ALWAYS = "always",
}
