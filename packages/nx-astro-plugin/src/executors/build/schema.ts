export interface BuildExecutorSchema {
  root: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  outputPath: string;
  verbose: boolean;
}
