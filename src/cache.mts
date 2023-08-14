/// <reference types="zx/globals" />

const SCRIPT_NAMES = ["start:dev", "dev", "start"];
const cacheDir = path.join(os.homedir(), ".napam");
const cacheFile = path.join(cacheDir, "script-name.json");

export async function getCache(dir: string) {
  let cache: Record<string, string[]>;

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
      cache = { [dir]: [], GLOBALS: SCRIPT_NAMES };
      await saveCache(cache);
    } else {
      throw chalk.red(`something went wrong while reading ${cacheFile}...`);
    }
  }

  return cache;
}

export async function saveCache(cache: Record<string, string[]>) {
  await fs.ensureDir(cacheDir);
  await fs.writeJson(cacheFile, cache);
}
