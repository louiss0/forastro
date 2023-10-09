import type { AstroIntegration } from 'astro';

import remarkHTMLDirectives from './lib';
import remarkDirective from 'remark-directive';

export default (config: Parameters<typeof remarkHTMLDirectives>[0]): AstroIntegration => {
    return {
        name: "@forastro/remark-html-directives-integration",
        hooks: {
            "astro:config:setup"({ updateConfig }) {


                updateConfig({
                    markdown: {
                        remarkPlugins: [
                            remarkDirective,
                            remarkHTMLDirectives(config)
                        ]
                    }
                })

            },
        }
    };
} 
