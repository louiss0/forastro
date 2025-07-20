export interface CheckExecutorSchema {
  root: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  watch: boolean;
  verbose: boolean;
}
