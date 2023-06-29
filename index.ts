#!/usr/bin/env zx

import "zx/globals";

const SCRIPT_NAMES = ["start:dev", "dev", "start"];

$.verbose = false;

let packageJson = null;
const startDir = process.cwd();

let dir = startDir;
let prevDir;

do {
  try {
    const pathName = path.join(dir, "package.json");
    packageJson = await fs.readJson(pathName);
  } catch (err) {
    if (err && (err as any).code !== "ENOENT") throw err;
  }
  prevDir = dir;
  dir = path.resolve(dir, "..");
} while (prevDir !== dir);

if (!packageJson)
  throw chalk.red(`package.json not found in ${startDir} and its ancestors`);

if (!packageJson.scripts)
  throw chalk.red("package.json file does not have any scripts");

for (const scriptName of SCRIPT_NAMES) {
  if (packageJson.scripts[scriptName]) {
    // reset colors and output
    // so that the code is shown running
    $.verbose = true;
    $.env.FORCE_COLOR = "3";

    // pipe stdin into the script so it can be cancelled and the like
    await $`npm run ${scriptName} </dev/stdin`;

    process.exit(0);
  }
}

throw chalk.red("no `start` like script found...");
