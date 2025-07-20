export interface InitGeneratorSchema {
  name: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm';
  directory?: string;
  tags?: string;
  skipFormat?: boolean;
}
