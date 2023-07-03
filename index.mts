#!/usr/bin/env zx

/// <reference types="zx/globals" />

// reset colors for output
$.env.FORCE_COLOR = "3";

async function getChar() {
  $.verbose = false;
  const { stdout } = await $`read -n1 -r ans; echo "$ans"`;
  echo("\r ");
  $.verbose = true;
  return stdout;
}

let packageJson = null;
const startDir = process.cwd();

let dir = startDir;
let prevDir;

do {
  try {
    const pathName = path.join(dir, "package.json");
    packageJson = await fs.readJson(pathName);
    break;
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

const SCRIPT_NAMES = ["start:dev", "dev", "start"];
const cacheDir = path.join(os.homedir(), ".napam");
const cacheFile = path.join(cacheDir, "script-name.json");

let cache;
try {
  cache = await fs.readJson(cacheFile);
  if (!cache[dir]) {
    cache[dir] = [];
  }
  if (!cache.GLOBALS) {
    cache.GLOBALS = SCRIPT_NAMES;
  }
} catch (err) {
  if (err && (err as any).code === "ENOENT") {
    echo(
      `this seems to be your first time using ${chalk.blueBright(
        "napam"
      )} - welcome!`
    );
    echo(
      `saving a starting cache of script names to ${chalk.blueBright(
        cacheFile
      )}...\n`
    );
    await fs.ensureDir(cacheDir);
    cache = { [dir]: [], GLOBALS: SCRIPT_NAMES };
    await fs.writeJson(cacheFile, cache);
  } else {
    throw chalk.red(`something went wrong while reading ${cacheFile}...`);
  }
}

const scriptNames = [...new Set([...cache[dir], ...cache.GLOBALS])];

for (const scriptName of scriptNames) {
  if (packageJson.scripts[scriptName]) {
    // pipe stdin into the script so it can be cancelled and the like
    await $`npm run ${scriptName} <&${process.stdin.fd}`;

    process.exit(0);
  }
}

echo(`no ${chalk.blueBright("start")}-like script found.`);
echo(`availble scripts are:`);
for (const scriptName in packageJson.scripts) {
  echo(`\t${chalk.blueBright(scriptName)}`);
}
echo(`\ndoes this package have a ${chalk.blueBright("start")} script? (Y/n)`);
const hasScript = await getChar();

if (hasScript.toLowerCase()[0] !== "y") {
  throw chalk.red("no start script found...");
}

const scriptName = await question(
  `please enter this package's ${chalk.blueBright("start")} script:\n`
);
await $`npm run ${scriptName} <&${process.stdin.fd}`;

echo(`\nshould ${chalk.blueBright(scriptName)} be saved globally? (Y/n)`);
const saveGlobally = await getChar();
if (saveGlobally.toLowerCase()[0] !== "y") {
  echo(`saving ${chalk.blueBright(scriptName)} to directory cache...`);
  cache[dir].unshift(scriptName);
} else {
  echo(`saving ${chalk.blueBright(scriptName)} to globals cache...`);
  cache.GLOBALS.unshift(scriptName);
}

await fs.writeJson(cacheFile, cache);

process.exit(0);
