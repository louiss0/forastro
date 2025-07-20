export interface MigrateGeneratorSchema {
  name: string;
  directory?: string;
  skipFormat?: boolean;
  convertScripts?: boolean;
}
