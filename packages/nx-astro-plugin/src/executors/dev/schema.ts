export interface DevExecutorSchema {
  root: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  port: number;
  host: string;
  open: boolean;
  verbose: boolean;
}
