/** @type {import('sitemap-gen').Config} */

const config = {
  exclude: ["/exclude-me", /^\/secret\//],
};

export default config;
