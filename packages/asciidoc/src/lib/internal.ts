import asciidoctor from 'asciidoctor';
import { z } from 'astro/zod';
import { loadConfig } from 'c12';
import glob from 'fast-glob';
import {
  bundledLanguages,
  bundledThemes,
  createHighlighter,
  type BundledTheme,
} from 'shiki';
import slugify from 'slugify';

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

const asciidocGlobalVariablesSchema = z
  .object({
    sourceHighlighter: z
      .literal('highlight.js')
      .default('highlight.js')
      .optional(),
    // ! The prop names must be written like this every capital generates
    // ! a new dash when it comes to attributes.
    highlightjsTheme: z.enum([
      'a11y-dark',
      'a11y-light',
      'agate',
      'an-old-hope',
      'androidstudio',
      'arduino-light',
      'arta',
      'ascetic',
      'atelier-cave-dark',
      'atelier-cave-light',
      'atelier-dune-dark',
      'atelier-dune-light',
      'atelier-estuary-dark',
      'atelier-estuary-light',
      'atelier-forest-dark',
      'atelier-forest-light',
      'atelier-heath-dark',
      'atelier-heath-light',
      'atelier-lakeside-dark',
      'atelier-lakeside-light',
      'atelier-plateau-dark',
      'atelier-plateau-light',
      'atelier-savanna-dark',
      'atelier-savanna-light',
      'atelier-seaside-dark',
      'atelier-seaside-light',
      'atelier-sulphurpool-dark',
      'atelier-sulphurpool-light',
      'atom-one-dark',
      'atom-one-dark-reasonable',
      'atom-one-light',
      'brown-paper',
      'codepen-embed',
      'color-brewer',
      'darcula',
      'dark',
      'default',
      'docco',
      'far',
      'foundation',
      'github',
      'github-dark',
      'github-dark-dimmed',
      'gml',
      'googlecode',
      'gradient-dark',
      'gradient-light',
      'grayscale',
      'hybrid',
      'idea',
      'ir-black',
      'isbl-editor-dark',
      'isbl-editor-light',
      'kimbie-dark',
      'kimbie-light',
      'lightfair',
      'lioshi',
      'magula',
      'mono-blue',
      'monokai',
      'monokai-sublime',
      'night-owl',
      'nnfx-dark',
      'nnfx-light',
      'nord',
      'obsidian',
      'panda-syntax-dark',
      'panda-syntax-light',
      'paraiso-dark',
      'paraiso-light',
      'pojoaque',
      'purebasic',
      'qtcreator-dark',
      'qtcreator-light',
      'rainbow',
      'routeros',
      'school-book',
      'shades-of-purple',
      'solarized-dark',
      'solarized-light',
      'srcery',
      'stackoverflow-dark',
      'stackoverflow-light',
      'sunburst',
      'tomorrow-night-blue',
      'tomorrow-night-bright',
      'vs',
      'vs2015',
      'xcode',
      'xt256',
      'zenburn',
    ])
      .default("github")
      .optional(),
    highlightjsLanguages: z
      .enum([
        '1c',
        'abnf',
        'accesslog',
        'actionscript',
        'ada',
        'angelscript',
        'apache',
        'applescript',
        'arcade',
        'arduino',
        'armasm',
        'asciidoc',
        'aspectj',
        'autohotkey',
        'autoit',
        'avrasm',
        'awk',
        'axapta',
        'bash',
        'basic',
        'bnf',
        'brainfuck',
        'c',
        'cal',
        'capnproto',
        'ceylon',
        'clean',
        'clojure',
        'cmake',
        'coffeescript',
        'coq',
        'cos',
        'cpp',
        'crmsh',
        'crystal',
        'csharp',
        'csp',
        'css',
        'd',
        'dart',
        'delphi',
        'diff',
        'django',
        'dns',
        'dockerfile',
        'dos',
        'dsconfig',
        'dts',
        'dust',
        'dylan',
        'ebnf',
        'elixir',
        'elm',
        'erlang',
        'excel',
        'extempore',
        'fsharp',
        'fix',
        'flix',
        'fortran',
        'func',
        'gcode',
        'gams',
        'gauss',
        'gdscript',
        'gherkin',
        'glimmer',
        'gn',
        'go',
        'gf',
        'golo',
        'gradle',
        'graphql',
        'groovy',
        'gsql',
        'html',
        'http',
        'haml',
        'handlebars',
        'haskell',
        'haxe',
        'hlsl',
        'hy',
        'ini',
        'inform7',
        'irpf90',
        'iptables',
        'json',
        'jsonata',
        'java',
        'javascript',
        'jolie',
        'julia',
        'julia-repl',
        'kotlin',
        'latex',
        'leaf',
        'lean',
        'lasso',
        'less',
        'ldif',
        'liquid',
        'lisp',
        'livecodeserver',
        'livescript',
        'lookml',
        'lua',
        'luau',
        'macaulay2',
        'makefile',
        'markdown',
        'mathematica',
        'matlab',
        'maxima',
        'mel',
        'mercury',
        'metapost',
        'mips',
        'mint',
        'mirth',
        'mirc',
        'mizar',
        'mkb',
        'mlir',
        'mojolicious',
        'monkey',
        'moonscript',
        'motoko',
        'n1ql',
        'nsis',
        'never',
        'nginx',
        'nim',
        'nix',
        'oak',
        'ocl',
        'ocaml',
        'objectivec',
        'odin',
        'glsl',
        'openscad',
        'ruleslanguage',
        'oxygene',
        'pf',
        'php',
        'papyrus',
        'parser3',
        'perl',
        'phix',
        'pine',
        'plaintext',
        'pony',
        'pgsql',
        'poweron',
        'powershell',
        'processing',
        'prolog',
        'properties',
        'protobuf',
        'puppet',
        'python',
        'profile',
        'python-repl',
        'qsharp',
        'k',
        'qml',
        'r',
        'reasonml',
        'rib',
        'roboconf',
        'routeros',
        'rsl',
        'ruleslanguage',
        'rust',
        'sas',
        'scala',
        'scheme',
        'scilab',
        'scss',
        'shell',
        'smali',
        'smalltalk',
        'sml',
        'sqf',
        'sql',
        'stan',
        'stata',
        'step21',
        'stylus',
        'subunit',
        'swift',
        'taggerscript',
        'yaml',
        'tap',
        'tcl',
        'terraform',
        'thrift',
        'tp',
        'twig',
        'typescript',
        'vala',
        'vbnet',
        'vbscript',
        'vhdl',
        'vim',
        'wasm',
        'wren',
        'x86asm',
        'xl',
        'xquery',
        'zephir',
      ])
      .array()
      .default([
        'html',
        'css',
        'javascript',
        'typescript',
        'markdown',
        'bash',
        'shell',
        'yaml',
        'json',
        'plaintext',
      ])
      .optional(),
  })
  .or(
    z.object({
      sourceHighlighter: z.literal('shiki'),
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
        }),
    }),
  )
  .and(commonAttributes);

export const asciidocConfigObjectSchema = z
  .object({
    attributes: asciidocGlobalVariablesSchema.optional(),
    blocks: z
      .record(
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
        inline: z
          .record(
            z.string(),
            z.object({
              context: z.enum(['quoted', 'anchor']),
              render: renderSchema,
            }),
          )
          .optional(),

        block: z
          .record(
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

export const transformObjectKeysIntoDashedCase = (
  input: Record<string, any>,
) => {
  const toDashedCase = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [toDashedCase(key), value]),
  );
};

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

const processor = asciidoctor();

export const registerShiki = async (
  processor: ReturnType<typeof asciidoctor>,
  themeOptions: {
    light: BundledTheme;
    dark: BundledTheme;
    dim?: BundledTheme;
  },
) => {
  const themes = [themeOptions.light, themeOptions.dark];

  if (themeOptions.dim) {
    themes.push(themeOptions.dim);
  }

  const highlighter = await createHighlighter({
    themes,
    langs: Object.keys(bundledLanguages),
  });

  processor.SyntaxHighlighter.register('shiki', {
    highlight(_, source, lang) {
      return highlighter.codeToHtml(source, {
        lang,
        cssVariablePrefix: '--faa-shiki-',
        defaultColor: 'light',
        themes: themeOptions,
      });
    },
  });
};

export const createForAstroRegistryAsciidocFromConfig = (
  blocks: z.infer<typeof asciidocConfigObjectSchema>['blocks'],
  macros: z.infer<typeof asciidocConfigObjectSchema>['macros'],
) => {
  const registry = processor.Extensions.create('forastro/asciidoc');

  if (blocks) {
    for (const [name, { context, render }] of Object.entries(blocks)) {
      registry.block(name, function () {
        this.process(function (parent, reader, attributes) {
          this.createBlock(
            parent,
            context,
            render(reader.getString(), attributes),
            attributes,
          );
        });
      });
    }

    if (macros?.inline) {
      for (const [name, { context, render }] of Object.entries(macros.inline)) {
        registry.inlineMacro(name, function () {
          this.process(function (parent, target, attributes) {
            this.createInline(parent, context, render(target, attributes));
          });
        });
      }
    }

    if (macros?.block) {
      for (const [name, { context, render }] of Object.entries(macros.block)) {
        registry.blockMacro(name, function () {
          this.process(function (parent, target, attributes) {
            this.createBlock(
              parent,
              context,
              render(target, attributes),
              attributes,
            );
          });
        });
      }
    }
  }

  return registry;
};

export const transformAsciidocFilesIntoAsciidocDocuments = async (
  content_folder_path: string,
  config_folder_path: string,
) => {

  const paths = await getAsciidocPaths(content_folder_path);

  const { attributes, blocks, macros } =
    await loadAsciidocConfig(config_folder_path);

  const extensionRegistry = createForAstroRegistryAsciidocFromConfig(
    blocks,
    macros,
  );

  return paths.map((path) =>
    processor.loadFile(`${content_folder_path}/${path}`, {
      attributes,
      extension_registry: extensionRegistry,
    }),
  );
};

export const generateSlug = (string: string) =>
  slugify(string, {
    lower: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });

