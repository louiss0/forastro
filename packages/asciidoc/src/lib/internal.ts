import { z } from 'astro/zod';
import { loadConfig } from 'c12';
import glob from 'fast-glob';
import {
  bundledLanguages,
  createHighlighter,
  bundledThemes,
  type BundledTheme,
} from 'shiki';
import slugify from 'slugify';
import prismjs from "prismjs"
import loadLanguages from "prismjs/components/index.js"
import asciidoctor from 'asciidoctor';


const getAsciidocPathsSchema = z.function(
  z.tuple([
    z
      .string()
      .regex(
        /[\w/]+/m,
        "Don't pass in an empty string pass in a value with forward slashes and words instead",
      ),
  ]),
  z.promise(z.string().array()),
);

export const getAsciidocPaths = getAsciidocPathsSchema.implement(
  async (folderName: string) => {
    return await glob('**/*.{adoc,asciidoc}', {
      cwd: folderName,
    });
  },
);

const renderSchema = z.function(
  z.tuple([
    z.string(),
    z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  ]),
  z.string(),
);

const commonAttributes = z.object({
  author: z
    .string()
    .regex(
      /[A-Z][a-z]+\s+[A-Z][a-z]+/,
      "The author's name must be a name and last name both capitalized with a space in between",
    )
    .optional(),
  email: z.string().email().optional(),
  backend: z.string().optional(),
  filetype: z.boolean().optional(),
  localdir: z.string().optional(),
  localdate: z.string().date().optional(),
  localdatetime: z.string().datetime().optional(),
  localtime: z.string().time().optional(),
  localyear: z.number().int().optional(),
  attributeMissing: z.enum(['drop', 'drop-line', 'skip', 'warn']).optional(),
  attributeUndefined: z.enum(['drop', 'drop-line']).optional(),
  experimental: z.boolean().optional(),
  appendixCaption: z.string().optional(),
  appendixNumber: z.string().optional(),
  appendixRefsig: z.string().optional(),
  cautionCaption: z.string().optional(),
  cautionNumber: z.string().optional(),
  cautionRefsig: z.string().optional(),
  cautionSignifier: z.string().optional(),
  exampleCaption: z.string().optional(),
  exampleNumber: z.string().optional(),
  figureCaption: z.string().optional(),
  figureNumber: z.number().optional(),
  footnoteNumber: z.number().optional(),
  importantCaption: z.string().optional(),
  lastUpdateLabel: z.string().optional(),
  listingCaption: z.string().optional(),
  listingNumber: z.number().optional(),
  noteCaption: z.string().optional(),
  partRefsig: z.string().optional(),
  partSignifier: z.string().optional(),
  prefaceTitle: z.string().optional(),
  tableCaption: z.string().optional(),
  tableNumber: z.string().optional(),
  tipCaption: z.string().optional(),
  tocTitle: z.string().optional(),
  untitledLabel: z.string().optional(),
  warningCaption: z.string().optional(),
  appName: z.string().optional(),
  idprefix: z.string().optional(),
  idseparator: z.string().optional(),
  leveloffset: z
    .enum(['0', '1', '2', '3', '4', '5'])
    .transform((input) => parseInt(input))
    .optional(),
  partnums: z.boolean().optional(),
  setanchors: z.boolean().optional(),
  sectids: z.boolean().optional(),
  sectlinks: z.boolean().optional(),
  sectnums: z.boolean().optional(),
  sectnumlevels: z
    .enum(['0', '1', '2', '3', '4', '5'])
    .transform((input) => parseInt(input))
    .optional(),
  titleSeparator: z.string().optional(),
  toc: z
    .enum(['auto', 'left', 'right', 'macro', 'preamble'])
    .or(z.literal(true))
    .optional(),
  toclevels: z
    .enum(['1', '2', '3', '4', '5'])
    .transform((input) => parseInt(input))
    .optional(),
  fragment: z.boolean().optional(),
  stylesheet: z.string().optional(),
});

const bundledThemeNames = Object.keys(bundledThemes) as unknown as Array<
  keyof typeof bundledThemes
>;

const BundledLanguageNamesSchema = z.enum([
  bundledThemeNames[0]!,
  ...bundledThemeNames.slice(1),
]);

const PrismLanguagesSchema = z.enum([
  'markup',
  'css',
  'clike',
  'javascript',
  'abap',
  'actionscript',
  'ada',
  'apacheconf',
  'apl',
  'applescript',
  'arduino',
  'arff',
  'asciidoc',
  'asm6502',
  'aspnet',
  'autohotkey',
  'autoit',
  'bash',
  'basic',
  'batch',
  'bison',
  'brainfuck',
  'bro',
  'c',
  'csharp',
  'cpp',
  'coffeescript',
  'clojure',
  'crystal',
  'csp',
  'css-extras',
  'd',
  'dart',
  'diff',
  'django',
  'docker',
  'eiffel',
  'elixir',
  'elm',
  'erb',
  'erlang',
  'fsharp',
  'flow',
  'fortran',
  'gedcom',
  'gherkin',
  'git',
  'glsl',
  'gml',
  'go',
  'graphql',
  'groovy',
  'haml',
  'handlebars',
  'haskell',
  'haxe',
  'http',
  'hpkp',
  'hsts',
  'ichigojam',
  'icon',
  'inform7',
  'ini',
  'io',
  'j',
  'java',
  'jolie',
  'json',
  'julia',
  'keyman',
  'kotlin',
  'latex',
  'less',
  'liquid',
  'lisp',
  'livescript',
  'lolcode',
  'lua',
  'makefile',
  'markdown',
  'markup-templating',
  'matlab',
  'mel',
  'mizar',
  'monkey',
  'n4js',
  'nasm',
  'nginx',
  'nim',
  'nix',
  'nsis',
  'objectivec',
  'ocaml',
  'opencl',
  'oz',
  'parigp',
  'parser',
  'pascal',
  'perl',
  'php',
  'php-extras',
  'plsql',
  'plaintext',
  'powershell',
  'processing',
  'prolog',
  'properties',
  'protobuf',
  'pug',
  'puppet',
  'pure',
  'python',
  'q',
  'qore',
  'r',
  'jsx',
  'tsx',
  'renpy',
  'reason',
  'rest',
  'rip',
  'roboconf',
  'ruby',
  'rust',
  'sas',
  'sass',
  'scss',
  'scala',
  'scheme',
  'smalltalk',
  'smarty',
  'sql',
  'soy',
  'stylus',
  'swift',
  'tap',
  'tcl',
  'textile',
  'tt2',
  'twig',
  'typescript',
  'vbnet',
  'velocity',
  'verilog',
  'vhdl',
  'vim',
  'visual-basic',
  'wasm',
  'wiki',
  'xeora',
  'xojo',
  'xquery',
  'yaml',
]).array();

export type PrismLanguages = z.infer<typeof PrismLanguagesSchema>


const sourceHighlighterPrismSchema = z.object({
  sourceHighlighter: z.literal("prism").optional(),
  prismLanguages: PrismLanguagesSchema
    .optional()
    .default(
      [
        'markup',
        'css',
        'javascript',
        'typescript',
        'markdown',
        'yaml',
        'json',
        'jsx',
        'tsx',
        'asciidoc',
        'bash',
        'php',
        'git'
      ]
    )
});
const sourceHighlighterShikiSchema = z.object({
  sourceHighlighter: z.literal('shiki').optional(),
  shikiTheme: z
    .object({
      light: BundledLanguageNamesSchema,
      dark: BundledLanguageNamesSchema,
      dim: BundledLanguageNamesSchema.optional(),
    })

    .refine(({ light, dark }) => light !== dark, {
      path: ['shikiTheme.dark', 'shikiTheme.light'],
      message: `The light theme and dark theme must be different from each other`,
    })
    .superRefine(({ light, dark, dim }, ctx) => {
      if (light === dim) {
        ctx.addIssue({
          path: ['shikiTheme.light', 'shikiTheme.dim'],
          code: 'custom',
          message: 'The light theme must not be equal to the light theme',
        });
      }

      if (dark === dim) {
        ctx.addIssue({
          path: ['shikiTheme.dark', 'shikiTheme.dim'],
          code: 'custom',
          message: 'The light theme must not be equal to the light theme',
        });
      }
    })
    .optional(),
});
export const asciidocConfigObjectSchema = z
  .object({
    attributes: z.union([
      sourceHighlighterPrismSchema,
      sourceHighlighterShikiSchema,
    ])
      .and(commonAttributes)
      .optional()
      .default({
        sourceHighlighter: "shiki",
        shikiTheme: {
          dark: "github-light",
          light: "github-dark",
          dim: 'github-dark-dimmed',
        }
      }),
    blocks: z.record(
      z.string(),
      z.object({
        context: z.enum([
          'example',
          'listing',
          'literal',
          'pass',
          'quote',
          'sidebar',
        ]),
        render: renderSchema,
      }),
    )
      .optional(),

    macros: z
      .object({
        inline: z.record(
          z.string(),
          z.object({
            context: z.enum(['quoted', 'anchor']),
            render: renderSchema,
          }),
        )
          .optional(),

        block: z.record(
          z.string(),
          z.object({
            context: z.enum([
              'example',
              'listing',
              'literal',
              'pass',
              'quote',
              'sidebar',
            ]),
            render: renderSchema,
          }),
        )
          .optional(),
      })
      .optional(),
  })
  .strict();


export const loadAsciidocConfig = async (cwd: string) => {

  const { config, configFile } = await loadConfig<
    z.infer<typeof asciidocConfigObjectSchema>
  >({
    cwd,
    name: 'asciidoc',
    omit$Keys: true,
  });

  if (Object.keys(config).length === 0) {
    return config;
  }

  z.string()
    .regex(
      /asciidoc.config.m(?:ts|js)/,
      'The asciidoc config file must be a mts or mjs file',
    )
    .parse(configFile);

  return asciidocConfigObjectSchema.parse(config);
};

type AsciidocConfigObjectSchema = z.infer<typeof asciidocConfigObjectSchema>;

export class AsciidocProcessorController {

  #processor = asciidoctor()

  static #instance: AsciidocProcessorController | undefined

  constructor () {

    if (AsciidocProcessorController.#instance) {

      return AsciidocProcessorController.#instance

    }

    AsciidocProcessorController.#instance = this

  }

  registerPrism_JS(languages: PrismLanguages) {

    loadLanguages(languages)

    this.#processor.SyntaxHighlighter.register("prism", {
      initialize(name, backend, opts) {
        this.$$name = "prism"
        this.super(name, backend, opts)
      },
      format(parent, target) {

        return `<pre class="${this.$$name} language-${target}">${parent.getContent()}</pre>`
      },
      handlesHighlighting: () => true,
      highlight(_, source, lang = 'plaintext') {

        return prismjs.highlight(source, prismjs.languages[lang]!, lang)

      },
    })



  }

  async registerShiki(
    themeOptions: {
      light: BundledTheme;
      dark: BundledTheme;
      dim?: BundledTheme;
    },
  ) {

    const highlighter = await createHighlighter({
      themes: themeOptions.dim
        ? [themeOptions.light, themeOptions.dark, themeOptions.dim]
        : [themeOptions.light, themeOptions.dark,],
      langs: Object.keys(bundledLanguages),
    });


    this.#processor.SyntaxHighlighter.register('shiki', {
      initialize(name, backend, opts) {
        this.super(name, backend, opts)
        this.$$name = "shiki"
      },
      handlesHighlighting: () => true,
      highlight(_, source, lang,) {

        return highlighter.codeToHtml(source, {
          lang,
          cssVariablePrefix: '--faa-shiki-',
          defaultColor: 'light',
          themes: themeOptions,
        })


      },
    });
  };

  registerBlocksAndMacrosFromConfig = (
    blocks: AsciidocConfigObjectSchema['blocks'],
    macros: AsciidocConfigObjectSchema['macros'],
  ) => {

    this.#processor.Extensions.register(function () {

      if (blocks) {
        for (const [name, { context, render }] of Object.entries(blocks)) {

          this.block(name, function () {
            this.process(function (parent, reader, attributes) {
              return this.createBlock(
                parent,
                context,
                render(reader.getString(), attributes),
                attributes,
              );
            });
          });
        }
      }

      if (macros?.inline) {
        for (const [name, { context, render }] of Object.entries(macros.inline)) {
          this.inlineMacro(name, function () {

            this.process(function (parent, target, attributes) {
              return this.createInline(parent, context, render(target, attributes));
            });
          });
        }
      }



      if (macros?.block) {

        for (const [name, { context, render }] of Object.entries(macros.block)) {
          this.blockMacro(name, function () {

            this.process(function (parent, target, attributes) {

              return this.createBlock(
                parent,
                context,
                render(target, attributes),
                attributes,
              );
            });
          });
        }
      }

    })


  };


  loadFileWithAttributes(
    path: string,
    attributes: AsciidocConfigObjectSchema['attributes'] | undefined
  ) {

    return this.#processor.loadFile(path, {
      attributes:
        attributes && Object.fromEntries(
          Object.entries(attributes).map(
            ([key, value]) =>
              [toDashedCase(key), value]
          ),
        ),
      safe: 10,
      catalog_assets: true,
    });

    function toDashedCase(key: string): string {
      return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    }
  }



}


export const generateSlug = (string: string) =>
  slugify(string, {
    lower: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });

