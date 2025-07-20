import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'nx run astro-nx:dev',
        production: 'nx run astro-nx:preview',
      },
      ciWebServerCommand: 'nx run astro-nx:preview',
    }),
    baseUrl: 'http://localhost:4321',
    specPattern: 'src/**/*.cy.ts',
  },
});
