/// <reference types="zx/globals" />

export async function prompt(prompt: string) {
  $.verbose = false;

  echo(`${prompt} (Y/n)`);
  const { stdout } = await $`read -n1 -r ans; echo "$ans"`;
  echo("\r ");
  $.verbose = true;
  return stdout.toLowerCase()[0] === "y";
}
