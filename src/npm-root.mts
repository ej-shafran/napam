/// <reference types="zx/globals" />

export async function npmRoot() {
  let packageJson: { scripts: Record<string, string> } | null = null;
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

  return { packageJson, dir };
}
