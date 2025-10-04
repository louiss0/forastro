import { execa } from 'execa';

export async function run(cmd: string, args: string[], cwd: string) {
  const child = execa(cmd, args, { cwd, stdio: 'inherit' });
  await child;
}

export async function tryRun(cmd: string, args: string[], cwd: string): Promise<boolean> {
  try {
    await run(cmd, args, cwd);
    return true;
  } catch {
    return false;
  }
}