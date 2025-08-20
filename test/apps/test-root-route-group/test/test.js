#!/usr/bin/env node

const assert = require("assert");
const path = require("path");
const { readFile, writeFile } = require("fs/promises");

function normalizeTimeStamps(xml) {
  return xml.replace(/<lastmod>.*?<\/lastmod>/g, "");
}

async function test() {
  const [actual, expected] = await Promise.all([
    readFile(path.join(process.cwd(), "public/sitemap.xml")),
    readFile(path.join(__dirname, "snapshot/sitemap.xml")),
  ]);

  await writeFile(path.join(__dirname, "snapshot/actual.xml"), actual);

  assert.equal(
    normalizeTimeStamps(actual.toString()),
    normalizeTimeStamps(expected.toString()),
  );
}

test();
