import { execa } from 'execa';

/**
 * Executes a command with inherited stdio.
 *
 * Runs a shell command using execa with stdio set to 'inherit', which means
 * the command's output is directly shown to the user. This function throws
 * if the command exits with a non-zero status code.
 *
 * @param cmd - Command to execute (e.g., 'npm', 'git', 'astro')
 * @param args - Array of command arguments
 * @param cwd - Working directory for command execution
 * @throws Error if command fails or exits with non-zero code
 *
 * @example
 * // Run npm install in a specific directory
 * await run('npm', ['install'], '/workspace/apps/my-site');
 *
 * @example
 * // Run astro build
 * await run('astro', ['build', '--config', 'astro.config.ts'], projectRoot);
 */
export async function run(cmd: string, args: string[], cwd: string) {
  const child = execa(cmd, args, { cwd, stdio: 'inherit' });
  await child;
}

/**
 * Attempts to execute a command, returning success status.
 *
 * Similar to `run()` but catches errors and returns a boolean indicating
 * whether the command succeeded. This is useful for checking if a command
 * is available or for non-critical operations where failures should be handled
 * gracefully without throwing.
 *
 * @param cmd - Command to execute (e.g., 'pnpm', 'git', 'astro')
 * @param args - Array of command arguments
 * @param cwd - Working directory for command execution
 * @returns Promise resolving to true if command succeeded, false if it failed
 *
 * @example
 * // Check if pnpm is available
 * const hasPnpm = await tryRun('pnpm', ['--version'], process.cwd());
 * if (hasPnpm) {
 *   console.log('pnpm is installed');
 * }
 *
 * @example
 * // Try to run an optional command
 * const formatted = await tryRun('prettier', ['--write', 'src'], projectRoot);
 * if (!formatted) {
 *   console.log('Prettier formatting skipped');
 * }
 */
export async function tryRun(cmd: string, args: string[], cwd: string): Promise<boolean> {
  try {
    await run(cmd, args, cwd);
    return true;
  } catch {
    return false;
  }
}