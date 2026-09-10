import * as astro_loaders from 'astro/loaders';
import { z } from 'astro/zod';

declare const asciidocConfigObjectSchema: z.ZodObject<
  {
    attributes: z.ZodDefault<
      z.ZodOptional<
        z.ZodIntersection<
          z.ZodUnion<
            readonly [
              z.ZodObject<
                {
                  sourceHighlighter: z.ZodOptional<z.ZodLiteral<'prism'>>;
                  prismLanguages: z.ZodDefault<
                    z.ZodOptional<
                      z.ZodArray<
                        z.ZodEnum<{
                          rest: 'rest';
                          markup: 'markup';
                          css: 'css';
                          clike: 'clike';
                          javascript: 'javascript';
                          abap: 'abap';
                          actionscript: 'actionscript';
                          ada: 'ada';
                          apacheconf: 'apacheconf';
                          apl: 'apl';
                          applescript: 'applescript';
                          arduino: 'arduino';
                          arff: 'arff';
                          asciidoc: 'asciidoc';
                          asm6502: 'asm6502';
                          aspnet: 'aspnet';
                          autohotkey: 'autohotkey';
                          autoit: 'autoit';
                          bash: 'bash';
                          basic: 'basic';
                          batch: 'batch';
                          bison: 'bison';
                          brainfuck: 'brainfuck';
                          bro: 'bro';
                          c: 'c';
                          csharp: 'csharp';
                          cpp: 'cpp';
                          coffeescript: 'coffeescript';
                          clojure: 'clojure';
                          crystal: 'crystal';
                          csp: 'csp';
                          'css-extras': 'css-extras';
                          d: 'd';
                          dart: 'dart';
                          diff: 'diff';
                          django: 'django';
                          docker: 'docker';
                          eiffel: 'eiffel';
                          elixir: 'elixir';
                          elm: 'elm';
                          erb: 'erb';
                          erlang: 'erlang';
                          fsharp: 'fsharp';
                          flow: 'flow';
                          fortran: 'fortran';
                          gedcom: 'gedcom';
                          gherkin: 'gherkin';
                          git: 'git';
                          glsl: 'glsl';
                          gml: 'gml';
                          go: 'go';
                          graphql: 'graphql';
                          groovy: 'groovy';
                          haml: 'haml';
                          handlebars: 'handlebars';
                          haskell: 'haskell';
                          haxe: 'haxe';
                          http: 'http';
                          hpkp: 'hpkp';
                          hsts: 'hsts';
                          ichigojam: 'ichigojam';
                          icon: 'icon';
                          inform7: 'inform7';
                          ini: 'ini';
                          io: 'io';
                          j: 'j';
                          java: 'java';
                          jolie: 'jolie';
                          json: 'json';
                          julia: 'julia';
                          keyman: 'keyman';
                          kotlin: 'kotlin';
                          latex: 'latex';
                          less: 'less';
                          liquid: 'liquid';
                          lisp: 'lisp';
                          livescript: 'livescript';
                          lolcode: 'lolcode';
                          lua: 'lua';
                          makefile: 'makefile';
                          markdown: 'markdown';
                          'markup-templating': 'markup-templating';
                          matlab: 'matlab';
                          mel: 'mel';
                          mizar: 'mizar';
                          monkey: 'monkey';
                          n4js: 'n4js';
                          nasm: 'nasm';
                          nginx: 'nginx';
                          nim: 'nim';
                          nix: 'nix';
                          nsis: 'nsis';
                          objectivec: 'objectivec';
                          ocaml: 'ocaml';
                          opencl: 'opencl';
                          oz: 'oz';
                          parigp: 'parigp';
                          parser: 'parser';
                          pascal: 'pascal';
                          perl: 'perl';
                          php: 'php';
                          'php-extras': 'php-extras';
                          plsql: 'plsql';
                          plaintext: 'plaintext';
                          powershell: 'powershell';
                          processing: 'processing';
                          prolog: 'prolog';
                          properties: 'properties';
                          protobuf: 'protobuf';
                          pug: 'pug';
                          puppet: 'puppet';
                          pure: 'pure';
                          python: 'python';
                          q: 'q';
                          qore: 'qore';
                          r: 'r';
                          jsx: 'jsx';
                          tsx: 'tsx';
                          renpy: 'renpy';
                          reason: 'reason';
                          rip: 'rip';
                          roboconf: 'roboconf';
                          ruby: 'ruby';
                          rust: 'rust';
                          sas: 'sas';
                          sass: 'sass';
                          scss: 'scss';
                          scala: 'scala';
                          scheme: 'scheme';
                          smalltalk: 'smalltalk';
                          smarty: 'smarty';
                          sql: 'sql';
                          soy: 'soy';
                          stylus: 'stylus';
                          swift: 'swift';
                          tap: 'tap';
                          tcl: 'tcl';
                          textile: 'textile';
                          tt2: 'tt2';
                          twig: 'twig';
                          typescript: 'typescript';
                          vbnet: 'vbnet';
                          velocity: 'velocity';
                          verilog: 'verilog';
                          vhdl: 'vhdl';
                          vim: 'vim';
                          'visual-basic': 'visual-basic';
                          wasm: 'wasm';
                          wiki: 'wiki';
                          xeora: 'xeora';
                          xojo: 'xojo';
                          xquery: 'xquery';
                          yaml: 'yaml';
                        }>
                      >
                    >
                  >;
                },
                z.core.$strip
              >,
              z.ZodObject<
                {
                  sourceHighlighter: z.ZodOptional<z.ZodLiteral<'shiki'>>;
                  shikiTheme: z.ZodOptional<
                    z.ZodObject<
                      {
                        light: z.ZodEnum<{
                          andromeeda: 'andromeeda';
                          'aurora-x': 'aurora-x';
                          'ayu-dark': 'ayu-dark';
                          'catppuccin-frappe': 'catppuccin-frappe';
                          'catppuccin-latte': 'catppuccin-latte';
                          'catppuccin-macchiato': 'catppuccin-macchiato';
                          'catppuccin-mocha': 'catppuccin-mocha';
                          'dark-plus': 'dark-plus';
                          dracula: 'dracula';
                          'dracula-soft': 'dracula-soft';
                          'everforest-dark': 'everforest-dark';
                          'everforest-light': 'everforest-light';
                          'github-dark': 'github-dark';
                          'github-dark-default': 'github-dark-default';
                          'github-dark-dimmed': 'github-dark-dimmed';
                          'github-dark-high-contrast': 'github-dark-high-contrast';
                          'github-light': 'github-light';
                          'github-light-default': 'github-light-default';
                          'github-light-high-contrast': 'github-light-high-contrast';
                          'gruvbox-dark-hard': 'gruvbox-dark-hard';
                          'gruvbox-dark-medium': 'gruvbox-dark-medium';
                          'gruvbox-dark-soft': 'gruvbox-dark-soft';
                          'gruvbox-light-hard': 'gruvbox-light-hard';
                          'gruvbox-light-medium': 'gruvbox-light-medium';
                          'gruvbox-light-soft': 'gruvbox-light-soft';
                          houston: 'houston';
                          'kanagawa-dragon': 'kanagawa-dragon';
                          'kanagawa-lotus': 'kanagawa-lotus';
                          'kanagawa-wave': 'kanagawa-wave';
                          laserwave: 'laserwave';
                          'light-plus': 'light-plus';
                          'material-theme': 'material-theme';
                          'material-theme-darker': 'material-theme-darker';
                          'material-theme-lighter': 'material-theme-lighter';
                          'material-theme-ocean': 'material-theme-ocean';
                          'material-theme-palenight': 'material-theme-palenight';
                          'min-dark': 'min-dark';
                          'min-light': 'min-light';
                          monokai: 'monokai';
                          'night-owl': 'night-owl';
                          nord: 'nord';
                          'one-dark-pro': 'one-dark-pro';
                          'one-light': 'one-light';
                          plastic: 'plastic';
                          poimandres: 'poimandres';
                          red: 'red';
                          'rose-pine': 'rose-pine';
                          'rose-pine-dawn': 'rose-pine-dawn';
                          'rose-pine-moon': 'rose-pine-moon';
                          'slack-dark': 'slack-dark';
                          'slack-ochin': 'slack-ochin';
                          'snazzy-light': 'snazzy-light';
                          'solarized-dark': 'solarized-dark';
                          'solarized-light': 'solarized-light';
                          'synthwave-84': 'synthwave-84';
                          'tokyo-night': 'tokyo-night';
                          vesper: 'vesper';
                          'vitesse-black': 'vitesse-black';
                          'vitesse-dark': 'vitesse-dark';
                          'vitesse-light': 'vitesse-light';
                        }>;
                        dark: z.ZodEnum<{
                          andromeeda: 'andromeeda';
                          'aurora-x': 'aurora-x';
                          'ayu-dark': 'ayu-dark';
                          'catppuccin-frappe': 'catppuccin-frappe';
                          'catppuccin-latte': 'catppuccin-latte';
                          'catppuccin-macchiato': 'catppuccin-macchiato';
                          'catppuccin-mocha': 'catppuccin-mocha';
                          'dark-plus': 'dark-plus';
                          dracula: 'dracula';
                          'dracula-soft': 'dracula-soft';
                          'everforest-dark': 'everforest-dark';
                          'everforest-light': 'everforest-light';
                          'github-dark': 'github-dark';
                          'github-dark-default': 'github-dark-default';
                          'github-dark-dimmed': 'github-dark-dimmed';
                          'github-dark-high-contrast': 'github-dark-high-contrast';
                          'github-light': 'github-light';
                          'github-light-default': 'github-light-default';
                          'github-light-high-contrast': 'github-light-high-contrast';
                          'gruvbox-dark-hard': 'gruvbox-dark-hard';
                          'gruvbox-dark-medium': 'gruvbox-dark-medium';
                          'gruvbox-dark-soft': 'gruvbox-dark-soft';
                          'gruvbox-light-hard': 'gruvbox-light-hard';
                          'gruvbox-light-medium': 'gruvbox-light-medium';
                          'gruvbox-light-soft': 'gruvbox-light-soft';
                          houston: 'houston';
                          'kanagawa-dragon': 'kanagawa-dragon';
                          'kanagawa-lotus': 'kanagawa-lotus';
                          'kanagawa-wave': 'kanagawa-wave';
                          laserwave: 'laserwave';
                          'light-plus': 'light-plus';
                          'material-theme': 'material-theme';
                          'material-theme-darker': 'material-theme-darker';
                          'material-theme-lighter': 'material-theme-lighter';
                          'material-theme-ocean': 'material-theme-ocean';
                          'material-theme-palenight': 'material-theme-palenight';
                          'min-dark': 'min-dark';
                          'min-light': 'min-light';
                          monokai: 'monokai';
                          'night-owl': 'night-owl';
                          nord: 'nord';
                          'one-dark-pro': 'one-dark-pro';
                          'one-light': 'one-light';
                          plastic: 'plastic';
                          poimandres: 'poimandres';
                          red: 'red';
                          'rose-pine': 'rose-pine';
                          'rose-pine-dawn': 'rose-pine-dawn';
                          'rose-pine-moon': 'rose-pine-moon';
                          'slack-dark': 'slack-dark';
                          'slack-ochin': 'slack-ochin';
                          'snazzy-light': 'snazzy-light';
                          'solarized-dark': 'solarized-dark';
                          'solarized-light': 'solarized-light';
                          'synthwave-84': 'synthwave-84';
                          'tokyo-night': 'tokyo-night';
                          vesper: 'vesper';
                          'vitesse-black': 'vitesse-black';
                          'vitesse-dark': 'vitesse-dark';
                          'vitesse-light': 'vitesse-light';
                        }>;
                        dim: z.ZodOptional<
                          z.ZodEnum<{
                            andromeeda: 'andromeeda';
                            'aurora-x': 'aurora-x';
                            'ayu-dark': 'ayu-dark';
                            'catppuccin-frappe': 'catppuccin-frappe';
                            'catppuccin-latte': 'catppuccin-latte';
                            'catppuccin-macchiato': 'catppuccin-macchiato';
                            'catppuccin-mocha': 'catppuccin-mocha';
                            'dark-plus': 'dark-plus';
                            dracula: 'dracula';
                            'dracula-soft': 'dracula-soft';
                            'everforest-dark': 'everforest-dark';
                            'everforest-light': 'everforest-light';
                            'github-dark': 'github-dark';
                            'github-dark-default': 'github-dark-default';
                            'github-dark-dimmed': 'github-dark-dimmed';
                            'github-dark-high-contrast': 'github-dark-high-contrast';
                            'github-light': 'github-light';
                            'github-light-default': 'github-light-default';
                            'github-light-high-contrast': 'github-light-high-contrast';
                            'gruvbox-dark-hard': 'gruvbox-dark-hard';
                            'gruvbox-dark-medium': 'gruvbox-dark-medium';
                            'gruvbox-dark-soft': 'gruvbox-dark-soft';
                            'gruvbox-light-hard': 'gruvbox-light-hard';
                            'gruvbox-light-medium': 'gruvbox-light-medium';
                            'gruvbox-light-soft': 'gruvbox-light-soft';
                            houston: 'houston';
                            'kanagawa-dragon': 'kanagawa-dragon';
                            'kanagawa-lotus': 'kanagawa-lotus';
                            'kanagawa-wave': 'kanagawa-wave';
                            laserwave: 'laserwave';
                            'light-plus': 'light-plus';
                            'material-theme': 'material-theme';
                            'material-theme-darker': 'material-theme-darker';
                            'material-theme-lighter': 'material-theme-lighter';
                            'material-theme-ocean': 'material-theme-ocean';
                            'material-theme-palenight': 'material-theme-palenight';
                            'min-dark': 'min-dark';
                            'min-light': 'min-light';
                            monokai: 'monokai';
                            'night-owl': 'night-owl';
                            nord: 'nord';
                            'one-dark-pro': 'one-dark-pro';
                            'one-light': 'one-light';
                            plastic: 'plastic';
                            poimandres: 'poimandres';
                            red: 'red';
                            'rose-pine': 'rose-pine';
                            'rose-pine-dawn': 'rose-pine-dawn';
                            'rose-pine-moon': 'rose-pine-moon';
                            'slack-dark': 'slack-dark';
                            'slack-ochin': 'slack-ochin';
                            'snazzy-light': 'snazzy-light';
                            'solarized-dark': 'solarized-dark';
                            'solarized-light': 'solarized-light';
                            'synthwave-84': 'synthwave-84';
                            'tokyo-night': 'tokyo-night';
                            vesper: 'vesper';
                            'vitesse-black': 'vitesse-black';
                            'vitesse-dark': 'vitesse-dark';
                            'vitesse-light': 'vitesse-light';
                          }>
                        >;
                      },
                      z.core.$strip
                    >
                  >;
                },
                z.core.$strip
              >,
            ]
          >,
          z.ZodObject<
            {
              author: z.ZodOptional<z.ZodOptional<z.ZodString>>;
              email: z.ZodOptional<z.ZodString>;
              backend: z.ZodOptional<z.ZodString>;
              filetype: z.ZodOptional<z.ZodBoolean>;
              localdir: z.ZodOptional<z.ZodString>;
              localdate: z.ZodOptional<z.ZodString>;
              localdatetime: z.ZodOptional<z.ZodString>;
              localtime: z.ZodOptional<z.ZodString>;
              localyear: z.ZodOptional<z.ZodNumber>;
              attributeMissing: z.ZodOptional<
                z.ZodEnum<{
                  drop: 'drop';
                  'drop-line': 'drop-line';
                  skip: 'skip';
                  warn: 'warn';
                }>
              >;
              attributeUndefined: z.ZodOptional<
                z.ZodEnum<{
                  drop: 'drop';
                  'drop-line': 'drop-line';
                }>
              >;
              experimental: z.ZodOptional<z.ZodBoolean>;
              appendixCaption: z.ZodOptional<z.ZodString>;
              appendixNumber: z.ZodOptional<z.ZodString>;
              appendixRefsig: z.ZodOptional<z.ZodString>;
              cautionCaption: z.ZodOptional<z.ZodString>;
              cautionNumber: z.ZodOptional<z.ZodString>;
              cautionRefsig: z.ZodOptional<z.ZodString>;
              cautionSignifier: z.ZodOptional<z.ZodString>;
              exampleCaption: z.ZodOptional<z.ZodString>;
              exampleNumber: z.ZodOptional<z.ZodString>;
              figureCaption: z.ZodOptional<z.ZodString>;
              figureNumber: z.ZodOptional<z.ZodNumber>;
              footnoteNumber: z.ZodOptional<z.ZodNumber>;
              importantCaption: z.ZodOptional<z.ZodString>;
              lastUpdateLabel: z.ZodOptional<z.ZodString>;
              listingCaption: z.ZodOptional<z.ZodString>;
              listingNumber: z.ZodOptional<z.ZodNumber>;
              noteCaption: z.ZodOptional<z.ZodString>;
              partRefsig: z.ZodOptional<z.ZodString>;
              partSignifier: z.ZodOptional<z.ZodString>;
              prefaceTitle: z.ZodOptional<z.ZodString>;
              tableCaption: z.ZodOptional<z.ZodString>;
              tableNumber: z.ZodOptional<z.ZodString>;
              tipCaption: z.ZodOptional<z.ZodString>;
              tocTitle: z.ZodOptional<z.ZodString>;
              untitledLabel: z.ZodOptional<z.ZodString>;
              warningCaption: z.ZodOptional<z.ZodString>;
              appName: z.ZodOptional<z.ZodString>;
              idprefix: z.ZodOptional<z.ZodString>;
              idseparator: z.ZodOptional<z.ZodString>;
              leveloffset: z.ZodOptional<
                z.ZodPipe<
                  z.ZodEnum<{
                    0: '0';
                    1: '1';
                    2: '2';
                    3: '3';
                    4: '4';
                    5: '5';
                  }>,
                  z.ZodTransform<number, '0' | '1' | '2' | '3' | '4' | '5'>
                >
              >;
              partnums: z.ZodOptional<z.ZodBoolean>;
              setanchors: z.ZodOptional<z.ZodBoolean>;
              sectids: z.ZodOptional<z.ZodBoolean>;
              sectlinks: z.ZodOptional<z.ZodBoolean>;
              sectnums: z.ZodOptional<z.ZodBoolean>;
              sectnumlevels: z.ZodOptional<
                z.ZodPipe<
                  z.ZodEnum<{
                    0: '0';
                    1: '1';
                    2: '2';
                    3: '3';
                    4: '4';
                    5: '5';
                  }>,
                  z.ZodTransform<number, '0' | '1' | '2' | '3' | '4' | '5'>
                >
              >;
              titleSeparator: z.ZodOptional<z.ZodString>;
              toc: z.ZodOptional<
                z.ZodUnion<
                  [
                    z.ZodEnum<{
                      auto: 'auto';
                      left: 'left';
                      right: 'right';
                      macro: 'macro';
                      preamble: 'preamble';
                    }>,
                    z.ZodLiteral<true>,
                  ]
                >
              >;
              toclevels: z.ZodOptional<
                z.ZodPipe<
                  z.ZodEnum<{
                    1: '1';
                    2: '2';
                    3: '3';
                    4: '4';
                    5: '5';
                  }>,
                  z.ZodTransform<number, '1' | '2' | '3' | '4' | '5'>
                >
              >;
              fragment: z.ZodOptional<z.ZodBoolean>;
              stylesheet: z.ZodOptional<z.ZodString>;
            },
            z.core.$strip
          >
        >
      >
    >;
    blocks: z.ZodOptional<
      z.ZodRecord<
        z.ZodString,
        z.ZodObject<
          {
            context: z.ZodEnum<{
              literal: 'literal';
              example: 'example';
              listing: 'listing';
              pass: 'pass';
              quote: 'quote';
              sidebar: 'sidebar';
            }>;
            render: z.ZodFunction<
              z.ZodTuple<
                readonly [
                  z.ZodString,
                  z.ZodRecord<
                    z.ZodString,
                    z.ZodUnion<
                      readonly [z.ZodString, z.ZodNumber, z.ZodBoolean]
                    >
                  >,
                ],
                null
              >,
              z.ZodString
            >;
          },
          z.core.$strip
        >
      >
    >;
    macros: z.ZodOptional<
      z.ZodObject<
        {
          inline: z.ZodOptional<
            z.ZodRecord<
              z.ZodString,
              z.ZodObject<
                {
                  context: z.ZodEnum<{
                    quoted: 'quoted';
                    anchor: 'anchor';
                  }>;
                  render: z.ZodFunction<
                    z.ZodTuple<
                      readonly [
                        z.ZodString,
                        z.ZodRecord<
                          z.ZodString,
                          z.ZodUnion<
                            readonly [z.ZodString, z.ZodNumber, z.ZodBoolean]
                          >
                        >,
                      ],
                      null
                    >,
                    z.ZodString
                  >;
                },
                z.core.$strip
              >
            >
          >;
          block: z.ZodOptional<
            z.ZodRecord<
              z.ZodString,
              z.ZodObject<
                {
                  context: z.ZodEnum<{
                    literal: 'literal';
                    example: 'example';
                    listing: 'listing';
                    pass: 'pass';
                    quote: 'quote';
                    sidebar: 'sidebar';
                  }>;
                  render: z.ZodFunction<
                    z.ZodTuple<
                      readonly [
                        z.ZodString,
                        z.ZodRecord<
                          z.ZodString,
                          z.ZodUnion<
                            readonly [z.ZodString, z.ZodNumber, z.ZodBoolean]
                          >
                        >,
                      ],
                      null
                    >,
                    z.ZodString
                  >;
                },
                z.core.$strip
              >
            >
          >;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strict
>;

type AsciidocConfigObject = z.infer<typeof asciidocConfigObjectSchema>;
type DocumentAttributes = Record<string, unknown>;
/**
 * Normalizes AsciiDoc attributes prior to schema validation.
 *
 * Transformations:
 * - Empty strings ("") → true (common AsciiDoc pattern for boolean attributes)
 * - Strings matching CSV pattern → string[] (comma-split, trimmed, empties removed)
 * - Convert dash-case/snake_case keys → camelCase keys
 *
 * The CSV pattern matches:
 * - Single token + comma: "foo," or "foo,   " → ["foo"]
 * - Multiple tokens with spaces: "foo, bar, baz," → ["foo", "bar", "baz"]
 * - Does NOT match "foo,bar" (no space after comma)
 *
 * Key conversion examples:
 * - "user-name" → "userName"
 * - "api_key" → "apiKey"
 * - "simple" → "simple" (no change)
 *
 * @param input - Raw attributes from document.getAttributes()
 * @returns New object with normalized attribute values and camelCase keys (non-mutating)
 */
declare function normalizeAsciiDocAttributes(
  input: DocumentAttributes,
): DocumentAttributes;
declare function asciidocLoader(contentFolderName: string): {
  name: string;
  load(context: astro_loaders.LoaderContext): Promise<void>;
};

declare const asciidocBaseSchema: z.ZodPipe<
  z.ZodObject<
    {
      doctitle: z.ZodString;
      docdate: z.ZodString;
      email: z.ZodString;
      localdate: z.ZodString;
      author: z.ZodString;
      authors: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
      createdAt: z.ZodString;
      description: z.ZodString;
    },
    z.core.$strip
  >,
  z.ZodTransform<
    {
      email: string;
      localdate: string;
      author: string;
      authors: string | string[];
      createdAt: string;
      description: string;
      title: string;
      updatedAt: string;
    },
    {
      doctitle: string;
      docdate: string;
      email: string;
      localdate: string;
      author: string;
      authors: string | string[];
      createdAt: string;
      description: string;
    }
  >
>;
type AsciidocBaseSchema = z.infer<typeof asciidocBaseSchema>;
declare const ASCIIDOC_POST_STAGE: z.ZodEnum<{
  draft: 'draft';
  published: 'published';
  editing: 'editing';
}>;
type AsciidocPostStage = z.infer<typeof ASCIIDOC_POST_STAGE>;
declare const asciidocDraftSchema: z.ZodIntersection<
  z.ZodPipe<
    z.ZodObject<
      {
        doctitle: z.ZodString;
        docdate: z.ZodString;
        email: z.ZodString;
        localdate: z.ZodString;
        author: z.ZodString;
        authors: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
        createdAt: z.ZodString;
        description: z.ZodString;
      },
      z.core.$strip
    >,
    z.ZodTransform<
      {
        email: string;
        localdate: string;
        author: string;
        authors: string | string[];
        createdAt: string;
        description: string;
        title: string;
        updatedAt: string;
      },
      {
        doctitle: string;
        docdate: string;
        email: string;
        localdate: string;
        author: string;
        authors: string | string[];
        createdAt: string;
        description: string;
      }
    >
  >,
  z.ZodObject<
    {
      stage: z.ZodEnum<{
        draft: 'draft';
        published: 'published';
        editing: 'editing';
      }>;
    },
    z.core.$strip
  >
>;

export {
  ASCIIDOC_POST_STAGE,
  type AsciidocBaseSchema,
  type AsciidocConfigObject,
  type AsciidocPostStage,
  type DocumentAttributes,
  asciidocBaseSchema,
  asciidocDraftSchema,
  asciidocLoader,
  normalizeAsciiDocAttributes,
};
