import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const generatedParent = path.join(
  workspaceRoot,
  `.tmp-generated-app-${process.pid}`,
);
const generatedDirectory = path.join(
  generatedParent,
  `generated-${process.pid}`,
);
const relativeGeneratedDirectory = path
  .relative(workspaceRoot, generatedDirectory)
  .replaceAll(path.sep, '/');
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const commandEnvironment = { ...process.env, NX_DAEMON: 'false' };

function quoteWindowsArgument(argument) {
  if (!/[\s"&|<>^]/.test(argument)) return argument;
  return `"${argument.replaceAll('"', '\\"')}"`;
}

function runPnpm(arguments_) {
  const command =
    process.platform === 'win32'
      ? (process.env.ComSpec ?? 'cmd.exe')
      : pnpmCommand;
  const commandArguments =
    process.platform === 'win32'
      ? [
          '/d',
          '/s',
          '/c',
          [pnpmCommand, ...arguments_].map(quoteWindowsArgument).join(' '),
        ]
      : arguments_;

  execFileSync(command, commandArguments, {
    cwd: workspaceRoot,
    env: commandEnvironment,
    stdio: 'inherit',
    timeout: 120_000,
  });
}

try {
  runPnpm([
    'nx',
    'g',
    '@forastro/nx-astro-plugin:app',
    `--name=generated-${process.pid}`,
    `--directory=${path.posix.dirname(relativeGeneratedDirectory)}`,
    '--skipInstall',
    '--no-interactive',
  ]);
  runPnpm(['exec', 'astro', 'check', '--root', relativeGeneratedDirectory]);
  console.log(
    `Verified generated Astro project: ${relativeGeneratedDirectory}`,
  );
} finally {
  fs.rmSync(generatedParent, { recursive: true, force: true });
}
