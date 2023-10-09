import type { AstroIntegration } from 'astro';

import remarkHTMLDirectives from './lib';
import remarkDirective from 'remark-directive';

export default (config: Parameters<typeof remarkHTMLDirectives>[0]): AstroIntegration => {
    return {
        name: "@forastro/remark-html-directives-integration",
        hooks: {

            "astro:config:setup"({ updateConfig, logger, }) {

                logger.info("Adding remark-directive and the local library remarkHTMLDirectives to remark")

                updateConfig({
                    markdown: {
                        remarkPlugins: [
                            remarkDirective,
                            remarkHTMLDirectives(config)
                        ]
                    }
                })

            },
            "astro:config:done"({ logger }) {

                logger.info(`The integration is now finished. 
                    You can now use remark html directives in astro now.
                    `)

            },

        }
    };
} 
