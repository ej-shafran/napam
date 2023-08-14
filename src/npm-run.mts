/// <reference types="zx/globals" />

export async function npmRun(scriptName: string) {
  // pipe stdin into the script so it can be cancelled and the like
  await $`npm run ${scriptName} <&${process.stdin.fd}`;
}
