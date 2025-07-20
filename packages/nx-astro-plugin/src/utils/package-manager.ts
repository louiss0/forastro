export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export function getPackageManagerExecCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'npm':
      return 'npx';
    case 'yarn':
      return 'yarn';
    case 'pnpm':
      return 'pnpm';
    case 'bun':
      return 'bunx';
    default:
      throw new Error(`Unsupported package manager: ${packageManager}`);
  }
}

export function getPackageManagerInstallCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'npm':
      return 'npm install';
    case 'yarn':
      return 'yarn install';
    case 'pnpm':
      return 'pnpm install';
    case 'bun':
      return 'bun install';
    default:
      throw new Error(`Unsupported package manager: ${packageManager}`);
  }
}

export function getPackageManagerAddCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'npm':
      return 'npm install';
    case 'yarn':
      return 'yarn add';
    case 'pnpm':
      return 'pnpm add';
    case 'bun':
      return 'bun add';
    default:
      throw new Error(`Unsupported package manager: ${packageManager}`);
  }
}
