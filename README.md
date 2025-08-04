# 🗺️ next-dynamic-sitemap

A zero-config dynamic sitemap generator for **Next.js** apps using the **App Router** or **Pages Router** — with full support for `generateStaticParams` and `getStaticPaths`. Automatically includes `lastModified` data from your static param functions.

---

## ✨ Features

- ✅ Works with both **App Router** (`generateStaticParams`) and **Pages Router** (`getStaticPaths`)
- 🕰️ Supports custom `lastModified` dates per route
- 🗂️ Outputs to `public/sitemap.xml` automatically
- 🔧 Configurable via `.env` (via [`dotenv-flow`](https://www.npmjs.com/package/dotenv-flow))
- 🧠 Smart enough to skip dynamic routes without params

---

## 📦 Installation

```bash
npm install next-dynamic-sitemap
```

---

## 🚀 Usage

You can invoke the generator manually:

```bash
npx sitemap-gen
```

Or add it to your Next.js build step:

```json
{
  "scripts": {
    "build": "sitemap-gen && next build"
  }
}
```

---

## 🛠️ Example: App Router

```ts
// app/projects/[slug]/page.tsx

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
    lastModified: new Date(project.updatedAt),
  }));
}
```

---

## 📄 Output

The sitemap will be generated at:

```
public/sitemap.xml
```

---

## 🌐 Required Environment Variable

Set the base URL of your site via an env file (`.env`, `.env.local`, etc.):

```
SITEMAP_GEN_BASE_URL=https://example.com
```

This is used to fully qualify URLs in the sitemap.

---

## CLI Options

Run npx `sitemap-gen` --help to see available options:

```
Usage: sitemap-gen [options]

Options:
-c, --config <path>  Path to a custom config file (e.g. sitemap-gen.config.js)
-h, --help           Display CLI usage help
```

---

## Configuration

You can optionally supply a configuration, if you need to overload default behaviors such as esbuild options.

### Example: `sitemap-gen.config.js`

```js
/** @type {import('sitemap-gen').Config} */

const config = {
  esbuild: {
    loader: {
      ".css": "css",
    },
    // ... any other esbuild options
  },
};

export default config;
```

### Usage

Pass the config to the CLI using `-c` or `--config`:

```
npx sitemap-gen -c ./sitemap-gen.config.js
```

If no config is provided, `sitemap-gen` will use sensible defaults.

---

## 🧪 Works With

- ✅ Static Routes
- ✅ Dynamic Routes with `generateStaticParams` or `getStaticPaths`
- ✅ Catch-all / Optional Catch-all routes (as long as they’re statically generated)
- ⚠️ **Does not** include server-only or client-only routes that aren’t statically known at build time

---

## 💡 Tips

- Want custom priority, changefreq, or more? That’s coming soon — or open an issue/PR!

---

## 🐛 Bugs? Ideas?

[Open an issue](https://github.com/grissly-man/next-dynamic-sitemap/issues) or send a PR — contributions welcome!
