#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const {readFile} = require("fs/promises");

async function test() {
  const [actual, expected] = await Promise.all([
    readFile(path.join(process.cwd(), "public/sitemap.xml")),
    readFile(path.join(__dirname, "snapshot/sitemap.xml")),
  ]);

  assert.equal(actual.toString(), expected.toString());
}

test()