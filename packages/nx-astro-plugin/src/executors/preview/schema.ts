export interface PreviewExecutorSchema {
  root: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  port: number;
  host: string;
  open: boolean;
  verbose: boolean;
}
