import * as astro_loaders from 'astro/loaders';
import { z } from 'astro/zod';
import { BundledTheme } from 'shiki';

declare const asciidocConfigObjectSchema: z.ZodObject<{
    attributes: z.ZodDefault<z.ZodOptional<z.ZodIntersection<z.ZodUnion<[z.ZodObject<{
        sourceHighlighter: z.ZodOptional<z.ZodLiteral<"prism">>;
        prismLanguages: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["markup", "css", "clike", "javascript", "abap", "actionscript", "ada", "apacheconf", "apl", "applescript", "arduino", "arff", "asciidoc", "asm6502", "aspnet", "autohotkey", "autoit", "bash", "basic", "batch", "bison", "brainfuck", "bro", "c", "csharp", "cpp", "coffeescript", "clojure", "crystal", "csp", "css-extras", "d", "dart", "diff", "django", "docker", "eiffel", "elixir", "elm", "erb", "erlang", "fsharp", "flow", "fortran", "gedcom", "gherkin", "git", "glsl", "gml", "go", "graphql", "groovy", "haml", "handlebars", "haskell", "haxe", "http", "hpkp", "hsts", "ichigojam", "icon", "inform7", "ini", "io", "j", "java", "jolie", "json", "julia", "keyman", "kotlin", "latex", "less", "liquid", "lisp", "livescript", "lolcode", "lua", "makefile", "markdown", "markup-templating", "matlab", "mel", "mizar", "monkey", "n4js", "nasm", "nginx", "nim", "nix", "nsis", "objectivec", "ocaml", "opencl", "oz", "parigp", "parser", "pascal", "perl", "php", "php-extras", "plsql", "plaintext", "powershell", "processing", "prolog", "properties", "protobuf", "pug", "puppet", "pure", "python", "q", "qore", "r", "jsx", "tsx", "renpy", "reason", "rest", "rip", "roboconf", "ruby", "rust", "sas", "sass", "scss", "scala", "scheme", "smalltalk", "smarty", "sql", "soy", "stylus", "swift", "tap", "tcl", "textile", "tt2", "twig", "typescript", "vbnet", "velocity", "verilog", "vhdl", "vim", "visual-basic", "wasm", "wiki", "xeora", "xojo", "xquery", "yaml"]>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        prismLanguages: ("rest" | "markup" | "css" | "clike" | "javascript" | "abap" | "actionscript" | "ada" | "apacheconf" | "apl" | "applescript" | "arduino" | "arff" | "asciidoc" | "asm6502" | "aspnet" | "autohotkey" | "autoit" | "bash" | "basic" | "batch" | "bison" | "brainfuck" | "bro" | "c" | "csharp" | "cpp" | "coffeescript" | "clojure" | "crystal" | "csp" | "css-extras" | "d" | "dart" | "diff" | "django" | "docker" | "eiffel" | "elixir" | "elm" | "erb" | "erlang" | "fsharp" | "flow" | "fortran" | "gedcom" | "gherkin" | "git" | "glsl" | "gml" | "go" | "graphql" | "groovy" | "haml" | "handlebars" | "haskell" | "haxe" | "http" | "hpkp" | "hsts" | "ichigojam" | "icon" | "inform7" | "ini" | "io" | "j" | "java" | "jolie" | "json" | "julia" | "keyman" | "kotlin" | "latex" | "less" | "liquid" | "lisp" | "livescript" | "lolcode" | "lua" | "makefile" | "markdown" | "markup-templating" | "matlab" | "mel" | "mizar" | "monkey" | "n4js" | "nasm" | "nginx" | "nim" | "nix" | "nsis" | "objectivec" | "ocaml" | "opencl" | "oz" | "parigp" | "parser" | "pascal" | "perl" | "php" | "php-extras" | "plsql" | "plaintext" | "powershell" | "processing" | "prolog" | "properties" | "protobuf" | "pug" | "puppet" | "pure" | "python" | "q" | "qore" | "r" | "jsx" | "tsx" | "renpy" | "reason" | "rip" | "roboconf" | "ruby" | "rust" | "sas" | "sass" | "scss" | "scala" | "scheme" | "smalltalk" | "smarty" | "sql" | "soy" | "stylus" | "swift" | "tap" | "tcl" | "textile" | "tt2" | "twig" | "typescript" | "vbnet" | "velocity" | "verilog" | "vhdl" | "vim" | "visual-basic" | "wasm" | "wiki" | "xeora" | "xojo" | "xquery" | "yaml")[];
        sourceHighlighter?: "prism" | undefined;
    }, {
        sourceHighlighter?: "prism" | undefined;
        prismLanguages?: ("rest" | "markup" | "css" | "clike" | "javascript" | "abap" | "actionscript" | "ada" | "apacheconf" | "apl" | "applescript" | "arduino" | "arff" | "asciidoc" | "asm6502" | "aspnet" | "autohotkey" | "autoit" | "bash" | "basic" | "batch" | "bison" | "brainfuck" | "bro" | "c" | "csharp" | "cpp" | "coffeescript" | "clojure" | "crystal" | "csp" | "css-extras" | "d" | "dart" | "diff" | "django" | "docker" | "eiffel" | "elixir" | "elm" | "erb" | "erlang" | "fsharp" | "flow" | "fortran" | "gedcom" | "gherkin" | "git" | "glsl" | "gml" | "go" | "graphql" | "groovy" | "haml" | "handlebars" | "haskell" | "haxe" | "http" | "hpkp" | "hsts" | "ichigojam" | "icon" | "inform7" | "ini" | "io" | "j" | "java" | "jolie" | "json" | "julia" | "keyman" | "kotlin" | "latex" | "less" | "liquid" | "lisp" | "livescript" | "lolcode" | "lua" | "makefile" | "markdown" | "markup-templating" | "matlab" | "mel" | "mizar" | "monkey" | "n4js" | "nasm" | "nginx" | "nim" | "nix" | "nsis" | "objectivec" | "ocaml" | "opencl" | "oz" | "parigp" | "parser" | "pascal" | "perl" | "php" | "php-extras" | "plsql" | "plaintext" | "powershell" | "processing" | "prolog" | "properties" | "protobuf" | "pug" | "puppet" | "pure" | "python" | "q" | "qore" | "r" | "jsx" | "tsx" | "renpy" | "reason" | "rip" | "roboconf" | "ruby" | "rust" | "sas" | "sass" | "scss" | "scala" | "scheme" | "smalltalk" | "smarty" | "sql" | "soy" | "stylus" | "swift" | "tap" | "tcl" | "textile" | "tt2" | "twig" | "typescript" | "vbnet" | "velocity" | "verilog" | "vhdl" | "vim" | "visual-basic" | "wasm" | "wiki" | "xeora" | "xojo" | "xquery" | "yaml")[] | undefined;
    }>, z.ZodObject<{
        sourceHighlighter: z.ZodOptional<z.ZodLiteral<"shiki">>;
        shikiTheme: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodObject<{
            light: z.ZodEnum<[BundledTheme, ...BundledTheme[]]>;
            dark: z.ZodEnum<[BundledTheme, ...BundledTheme[]]>;
            dim: z.ZodOptional<z.ZodEnum<[BundledTheme, ...BundledTheme[]]>>;
        }, "strip", z.ZodTypeAny, {
            light: BundledTheme;
            dark: BundledTheme;
            dim?: BundledTheme | undefined;
        }, {
            light: BundledTheme;
            dark: BundledTheme;
            dim?: BundledTheme | undefined;
        }>, {
            light: BundledTheme;
            dark: BundledTheme;
            dim?: BundledTheme | undefined;
        }, {
            light: BundledTheme;
            dark: BundledTheme;
            dim?: BundledTheme | undefined;
        }>, {
            light: BundledTheme;
            dark: BundledTheme;
            dim?: BundledTheme | undefined;
        }, {
            light: BundledTheme;
            dark: BundledTheme;
            dim?: BundledTheme | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        sourceHighlighter?: "shiki" | undefined;
        shikiTheme?: {
            light: BundledTheme;
            dark: BundledTheme;
            dim?: BundledTheme | undefined;
        } | undefined;
    }, {
        sourceHighlighter?: "shiki" | undefined;
        shikiTheme?: {
            light: BundledTheme;
            dark: BundledTheme;
            dim?: BundledTheme | undefined;
        } | undefined;
    }>]>, z.ZodObject<{
        author: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        email: z.ZodOptional<z.ZodString>;
        backend: z.ZodOptional<z.ZodString>;
        filetype: z.ZodOptional<z.ZodBoolean>;
        localdir: z.ZodOptional<z.ZodString>;
        localdate: z.ZodOptional<z.ZodString>;
        localdatetime: z.ZodOptional<z.ZodString>;
        localtime: z.ZodOptional<z.ZodString>;
        localyear: z.ZodOptional<z.ZodNumber>;
        attributeMissing: z.ZodOptional<z.ZodEnum<["drop", "drop-line", "skip", "warn"]>>;
        attributeUndefined: z.ZodOptional<z.ZodEnum<["drop", "drop-line"]>>;
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
        leveloffset: z.ZodOptional<z.ZodEffects<z.ZodEnum<["0", "1", "2", "3", "4", "5"]>, number, "0" | "1" | "2" | "3" | "4" | "5">>;
        partnums: z.ZodOptional<z.ZodBoolean>;
        setanchors: z.ZodOptional<z.ZodBoolean>;
        sectids: z.ZodOptional<z.ZodBoolean>;
        sectlinks: z.ZodOptional<z.ZodBoolean>;
        sectnums: z.ZodOptional<z.ZodBoolean>;
        sectnumlevels: z.ZodOptional<z.ZodEffects<z.ZodEnum<["0", "1", "2", "3", "4", "5"]>, number, "0" | "1" | "2" | "3" | "4" | "5">>;
        titleSeparator: z.ZodOptional<z.ZodString>;
        toc: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["auto", "left", "right", "macro", "preamble"]>, z.ZodLiteral<true>]>>;
        toclevels: z.ZodOptional<z.ZodEffects<z.ZodEnum<["1", "2", "3", "4", "5"]>, number, "1" | "2" | "3" | "4" | "5">>;
        fragment: z.ZodOptional<z.ZodBoolean>;
        stylesheet: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        localdate?: string | undefined;
        author?: string | undefined;
        backend?: string | undefined;
        filetype?: boolean | undefined;
        localdir?: string | undefined;
        localdatetime?: string | undefined;
        localtime?: string | undefined;
        localyear?: number | undefined;
        attributeMissing?: "drop" | "drop-line" | "skip" | "warn" | undefined;
        attributeUndefined?: "drop" | "drop-line" | undefined;
        experimental?: boolean | undefined;
        appendixCaption?: string | undefined;
        appendixNumber?: string | undefined;
        appendixRefsig?: string | undefined;
        cautionCaption?: string | undefined;
        cautionNumber?: string | undefined;
        cautionRefsig?: string | undefined;
        cautionSignifier?: string | undefined;
        exampleCaption?: string | undefined;
        exampleNumber?: string | undefined;
        figureCaption?: string | undefined;
        figureNumber?: number | undefined;
        footnoteNumber?: number | undefined;
        importantCaption?: string | undefined;
        lastUpdateLabel?: string | undefined;
        listingCaption?: string | undefined;
        listingNumber?: number | undefined;
        noteCaption?: string | undefined;
        partRefsig?: string | undefined;
        partSignifier?: string | undefined;
        prefaceTitle?: string | undefined;
        tableCaption?: string | undefined;
        tableNumber?: string | undefined;
        tipCaption?: string | undefined;
        tocTitle?: string | undefined;
        untitledLabel?: string | undefined;
        warningCaption?: string | undefined;
        appName?: string | undefined;
        idprefix?: string | undefined;
        idseparator?: string | undefined;
        leveloffset?: number | undefined;
        partnums?: boolean | undefined;
        setanchors?: boolean | undefined;
        sectids?: boolean | undefined;
        sectlinks?: boolean | undefined;
        sectnums?: boolean | undefined;
        sectnumlevels?: number | undefined;
        titleSeparator?: string | undefined;
        toc?: true | "auto" | "left" | "right" | "macro" | "preamble" | undefined;
        toclevels?: number | undefined;
        fragment?: boolean | undefined;
        stylesheet?: string | undefined;
    }, {
        email?: string | undefined;
        localdate?: string | undefined;
        author?: string | undefined;
        backend?: string | undefined;
        filetype?: boolean | undefined;
        localdir?: string | undefined;
        localdatetime?: string | undefined;
        localtime?: string | undefined;
        localyear?: number | undefined;
        attributeMissing?: "drop" | "drop-line" | "skip" | "warn" | undefined;
        attributeUndefined?: "drop" | "drop-line" | undefined;
        experimental?: boolean | undefined;
        appendixCaption?: string | undefined;
        appendixNumber?: string | undefined;
        appendixRefsig?: string | undefined;
        cautionCaption?: string | undefined;
        cautionNumber?: string | undefined;
        cautionRefsig?: string | undefined;
        cautionSignifier?: string | undefined;
        exampleCaption?: string | undefined;
        exampleNumber?: string | undefined;
        figureCaption?: string | undefined;
        figureNumber?: number | undefined;
        footnoteNumber?: number | undefined;
        importantCaption?: string | undefined;
        lastUpdateLabel?: string | undefined;
        listingCaption?: string | undefined;
        listingNumber?: number | undefined;
        noteCaption?: string | undefined;
        partRefsig?: string | undefined;
        partSignifier?: string | undefined;
        prefaceTitle?: string | undefined;
        tableCaption?: string | undefined;
        tableNumber?: string | undefined;
        tipCaption?: string | undefined;
        tocTitle?: string | undefined;
        untitledLabel?: string | undefined;
        warningCaption?: string | undefined;
        appName?: string | undefined;
        idprefix?: string | undefined;
        idseparator?: string | undefined;
        leveloffset?: "0" | "1" | "2" | "3" | "4" | "5" | undefined;
        partnums?: boolean | undefined;
        setanchors?: boolean | undefined;
        sectids?: boolean | undefined;
        sectlinks?: boolean | undefined;
        sectnums?: boolean | undefined;
        sectnumlevels?: "0" | "1" | "2" | "3" | "4" | "5" | undefined;
        titleSeparator?: string | undefined;
        toc?: true | "auto" | "left" | "right" | "macro" | "preamble" | undefined;
        toclevels?: "1" | "2" | "3" | "4" | "5" | undefined;
        fragment?: boolean | undefined;
        stylesheet?: string | undefined;
    }>>>>;
    blocks: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        context: z.ZodEnum<["example", "listing", "literal", "pass", "quote", "sidebar"]>;
        render: z.ZodFunction<z.ZodTuple<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>], null>, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        context: "example" | "listing" | "literal" | "pass" | "quote" | "sidebar";
        render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
    }, {
        context: "example" | "listing" | "literal" | "pass" | "quote" | "sidebar";
        render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
    }>>>;
    macros: z.ZodOptional<z.ZodObject<{
        inline: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            context: z.ZodEnum<["quoted", "anchor"]>;
            render: z.ZodFunction<z.ZodTuple<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>], null>, z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            context: "quoted" | "anchor";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }, {
            context: "quoted" | "anchor";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }>>>;
        block: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            context: z.ZodEnum<["example", "listing", "literal", "pass", "quote", "sidebar"]>;
            render: z.ZodFunction<z.ZodTuple<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>], null>, z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            context: "example" | "listing" | "literal" | "pass" | "quote" | "sidebar";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }, {
            context: "example" | "listing" | "literal" | "pass" | "quote" | "sidebar";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        inline?: Record<string, {
            context: "quoted" | "anchor";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }> | undefined;
        block?: Record<string, {
            context: "example" | "listing" | "literal" | "pass" | "quote" | "sidebar";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }> | undefined;
    }, {
        inline?: Record<string, {
            context: "quoted" | "anchor";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }> | undefined;
        block?: Record<string, {
            context: "example" | "listing" | "literal" | "pass" | "quote" | "sidebar";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }> | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    attributes: ({
        prismLanguages: ("rest" | "markup" | "css" | "clike" | "javascript" | "abap" | "actionscript" | "ada" | "apacheconf" | "apl" | "applescript" | "arduino" | "arff" | "asciidoc" | "asm6502" | "aspnet" | "autohotkey" | "autoit" | "bash" | "basic" | "batch" | "bison" | "brainfuck" | "bro" | "c" | "csharp" | "cpp" | "coffeescript" | "clojure" | "crystal" | "csp" | "css-extras" | "d" | "dart" | "diff" | "django" | "docker" | "eiffel" | "elixir" | "elm" | "erb" | "erlang" | "fsharp" | "flow" | "fortran" | "gedcom" | "gherkin" | "git" | "glsl" | "gml" | "go" | "graphql" | "groovy" | "haml" | "handlebars" | "haskell" | "haxe" | "http" | "hpkp" | "hsts" | "ichigojam" | "icon" | "inform7" | "ini" | "io" | "j" | "java" | "jolie" | "json" | "julia" | "keyman" | "kotlin" | "latex" | "less" | "liquid" | "lisp" | "livescript" | "lolcode" | "lua" | "makefile" | "markdown" | "markup-templating" | "matlab" | "mel" | "mizar" | "monkey" | "n4js" | "nasm" | "nginx" | "nim" | "nix" | "nsis" | "objectivec" | "ocaml" | "opencl" | "oz" | "parigp" | "parser" | "pascal" | "perl" | "php" | "php-extras" | "plsql" | "plaintext" | "powershell" | "processing" | "prolog" | "properties" | "protobuf" | "pug" | "puppet" | "pure" | "python" | "q" | "qore" | "r" | "jsx" | "tsx" | "renpy" | "reason" | "rip" | "roboconf" | "ruby" | "rust" | "sas" | "sass" | "scss" | "scala" | "scheme" | "smalltalk" | "smarty" | "sql" | "soy" | "stylus" | "swift" | "tap" | "tcl" | "textile" | "tt2" | "twig" | "typescript" | "vbnet" | "velocity" | "verilog" | "vhdl" | "vim" | "visual-basic" | "wasm" | "wiki" | "xeora" | "xojo" | "xquery" | "yaml")[];
        sourceHighlighter?: "prism" | undefined;
    } | {
        sourceHighlighter?: "shiki" | undefined;
        shikiTheme?: {
            light: BundledTheme;
            dark: BundledTheme;
            dim?: BundledTheme | undefined;
        } | undefined;
    }) & {
        email?: string | undefined;
        localdate?: string | undefined;
        author?: string | undefined;
        backend?: string | undefined;
        filetype?: boolean | undefined;
        localdir?: string | undefined;
        localdatetime?: string | undefined;
        localtime?: string | undefined;
        localyear?: number | undefined;
        attributeMissing?: "drop" | "drop-line" | "skip" | "warn" | undefined;
        attributeUndefined?: "drop" | "drop-line" | undefined;
        experimental?: boolean | undefined;
        appendixCaption?: string | undefined;
        appendixNumber?: string | undefined;
        appendixRefsig?: string | undefined;
        cautionCaption?: string | undefined;
        cautionNumber?: string | undefined;
        cautionRefsig?: string | undefined;
        cautionSignifier?: string | undefined;
        exampleCaption?: string | undefined;
        exampleNumber?: string | undefined;
        figureCaption?: string | undefined;
        figureNumber?: number | undefined;
        footnoteNumber?: number | undefined;
        importantCaption?: string | undefined;
        lastUpdateLabel?: string | undefined;
        listingCaption?: string | undefined;
        listingNumber?: number | undefined;
        noteCaption?: string | undefined;
        partRefsig?: string | undefined;
        partSignifier?: string | undefined;
        prefaceTitle?: string | undefined;
        tableCaption?: string | undefined;
        tableNumber?: string | undefined;
        tipCaption?: string | undefined;
        tocTitle?: string | undefined;
        untitledLabel?: string | undefined;
        warningCaption?: string | undefined;
        appName?: string | undefined;
        idprefix?: string | undefined;
        idseparator?: string | undefined;
        leveloffset?: number | undefined;
        partnums?: boolean | undefined;
        setanchors?: boolean | undefined;
        sectids?: boolean | undefined;
        sectlinks?: boolean | undefined;
        sectnums?: boolean | undefined;
        sectnumlevels?: number | undefined;
        titleSeparator?: string | undefined;
        toc?: true | "auto" | "left" | "right" | "macro" | "preamble" | undefined;
        toclevels?: number | undefined;
        fragment?: boolean | undefined;
        stylesheet?: string | undefined;
    };
    blocks?: Record<string, {
        context: "example" | "listing" | "literal" | "pass" | "quote" | "sidebar";
        render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
    }> | undefined;
    macros?: {
        inline?: Record<string, {
            context: "quoted" | "anchor";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }> | undefined;
        block?: Record<string, {
            context: "example" | "listing" | "literal" | "pass" | "quote" | "sidebar";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }> | undefined;
    } | undefined;
}, {
    attributes?: (({
        sourceHighlighter?: "prism" | undefined;
        prismLanguages?: ("rest" | "markup" | "css" | "clike" | "javascript" | "abap" | "actionscript" | "ada" | "apacheconf" | "apl" | "applescript" | "arduino" | "arff" | "asciidoc" | "asm6502" | "aspnet" | "autohotkey" | "autoit" | "bash" | "basic" | "batch" | "bison" | "brainfuck" | "bro" | "c" | "csharp" | "cpp" | "coffeescript" | "clojure" | "crystal" | "csp" | "css-extras" | "d" | "dart" | "diff" | "django" | "docker" | "eiffel" | "elixir" | "elm" | "erb" | "erlang" | "fsharp" | "flow" | "fortran" | "gedcom" | "gherkin" | "git" | "glsl" | "gml" | "go" | "graphql" | "groovy" | "haml" | "handlebars" | "haskell" | "haxe" | "http" | "hpkp" | "hsts" | "ichigojam" | "icon" | "inform7" | "ini" | "io" | "j" | "java" | "jolie" | "json" | "julia" | "keyman" | "kotlin" | "latex" | "less" | "liquid" | "lisp" | "livescript" | "lolcode" | "lua" | "makefile" | "markdown" | "markup-templating" | "matlab" | "mel" | "mizar" | "monkey" | "n4js" | "nasm" | "nginx" | "nim" | "nix" | "nsis" | "objectivec" | "ocaml" | "opencl" | "oz" | "parigp" | "parser" | "pascal" | "perl" | "php" | "php-extras" | "plsql" | "plaintext" | "powershell" | "processing" | "prolog" | "properties" | "protobuf" | "pug" | "puppet" | "pure" | "python" | "q" | "qore" | "r" | "jsx" | "tsx" | "renpy" | "reason" | "rip" | "roboconf" | "ruby" | "rust" | "sas" | "sass" | "scss" | "scala" | "scheme" | "smalltalk" | "smarty" | "sql" | "soy" | "stylus" | "swift" | "tap" | "tcl" | "textile" | "tt2" | "twig" | "typescript" | "vbnet" | "velocity" | "verilog" | "vhdl" | "vim" | "visual-basic" | "wasm" | "wiki" | "xeora" | "xojo" | "xquery" | "yaml")[] | undefined;
    } | {
        sourceHighlighter?: "shiki" | undefined;
        shikiTheme?: {
            light: BundledTheme;
            dark: BundledTheme;
            dim?: BundledTheme | undefined;
        } | undefined;
    }) & {
        email?: string | undefined;
        localdate?: string | undefined;
        author?: string | undefined;
        backend?: string | undefined;
        filetype?: boolean | undefined;
        localdir?: string | undefined;
        localdatetime?: string | undefined;
        localtime?: string | undefined;
        localyear?: number | undefined;
        attributeMissing?: "drop" | "drop-line" | "skip" | "warn" | undefined;
        attributeUndefined?: "drop" | "drop-line" | undefined;
        experimental?: boolean | undefined;
        appendixCaption?: string | undefined;
        appendixNumber?: string | undefined;
        appendixRefsig?: string | undefined;
        cautionCaption?: string | undefined;
        cautionNumber?: string | undefined;
        cautionRefsig?: string | undefined;
        cautionSignifier?: string | undefined;
        exampleCaption?: string | undefined;
        exampleNumber?: string | undefined;
        figureCaption?: string | undefined;
        figureNumber?: number | undefined;
        footnoteNumber?: number | undefined;
        importantCaption?: string | undefined;
        lastUpdateLabel?: string | undefined;
        listingCaption?: string | undefined;
        listingNumber?: number | undefined;
        noteCaption?: string | undefined;
        partRefsig?: string | undefined;
        partSignifier?: string | undefined;
        prefaceTitle?: string | undefined;
        tableCaption?: string | undefined;
        tableNumber?: string | undefined;
        tipCaption?: string | undefined;
        tocTitle?: string | undefined;
        untitledLabel?: string | undefined;
        warningCaption?: string | undefined;
        appName?: string | undefined;
        idprefix?: string | undefined;
        idseparator?: string | undefined;
        leveloffset?: "0" | "1" | "2" | "3" | "4" | "5" | undefined;
        partnums?: boolean | undefined;
        setanchors?: boolean | undefined;
        sectids?: boolean | undefined;
        sectlinks?: boolean | undefined;
        sectnums?: boolean | undefined;
        sectnumlevels?: "0" | "1" | "2" | "3" | "4" | "5" | undefined;
        titleSeparator?: string | undefined;
        toc?: true | "auto" | "left" | "right" | "macro" | "preamble" | undefined;
        toclevels?: "1" | "2" | "3" | "4" | "5" | undefined;
        fragment?: boolean | undefined;
        stylesheet?: string | undefined;
    }) | undefined;
    blocks?: Record<string, {
        context: "example" | "listing" | "literal" | "pass" | "quote" | "sidebar";
        render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
    }> | undefined;
    macros?: {
        inline?: Record<string, {
            context: "quoted" | "anchor";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }> | undefined;
        block?: Record<string, {
            context: "example" | "listing" | "literal" | "pass" | "quote" | "sidebar";
            render: (args_0: string, args_1: Record<string, string | number | boolean>) => string;
        }> | undefined;
    } | undefined;
}>;

type AsciidocConfigObject = z.infer<typeof asciidocConfigObjectSchema>;
declare function asciidocLoader(contentFolderName: string): {
    name: string;
    load(context: astro_loaders.LoaderContext): Promise<void>;
};

declare const asciidocBaseSchema: z.ZodEffects<z.ZodObject<{
    doctitle: z.ZodString;
    docdate: z.ZodString;
    email: z.ZodString;
    localdate: z.ZodString;
    author: z.ZodString;
    authors: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    createdAt: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    doctitle: string;
    docdate: string;
    email: string;
    localdate: string;
    author: string;
    authors: string | string[];
    createdAt: string;
    description: string;
}, {
    doctitle: string;
    docdate: string;
    email: string;
    localdate: string;
    author: string;
    authors: string | string[];
    createdAt: string;
    description: string;
}>, {
    email: string;
    localdate: string;
    author: string;
    authors: string | string[];
    createdAt: string;
    description: string;
    title: string;
    updatedAt: string;
}, {
    doctitle: string;
    docdate: string;
    email: string;
    localdate: string;
    author: string;
    authors: string | string[];
    createdAt: string;
    description: string;
}>;
type AsciidocBaseSchema = z.infer<typeof asciidocBaseSchema>;
declare const ASCIIDOC_POST_STAGE: z.ZodEnum<["draft", "published", "editing"]>;
type AsciidocPostStage = z.infer<typeof ASCIIDOC_POST_STAGE>;
declare const asciidocDraftSchema: z.ZodIntersection<z.ZodEffects<z.ZodObject<{
    doctitle: z.ZodString;
    docdate: z.ZodString;
    email: z.ZodString;
    localdate: z.ZodString;
    author: z.ZodString;
    authors: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    createdAt: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    doctitle: string;
    docdate: string;
    email: string;
    localdate: string;
    author: string;
    authors: string | string[];
    createdAt: string;
    description: string;
}, {
    doctitle: string;
    docdate: string;
    email: string;
    localdate: string;
    author: string;
    authors: string | string[];
    createdAt: string;
    description: string;
}>, {
    email: string;
    localdate: string;
    author: string;
    authors: string | string[];
    createdAt: string;
    description: string;
    title: string;
    updatedAt: string;
}, {
    doctitle: string;
    docdate: string;
    email: string;
    localdate: string;
    author: string;
    authors: string | string[];
    createdAt: string;
    description: string;
}>, z.ZodObject<{
    stage: z.ZodEnum<["draft", "published", "editing"]>;
}, "strip", z.ZodTypeAny, {
    stage: "draft" | "published" | "editing";
}, {
    stage: "draft" | "published" | "editing";
}>>;

export { ASCIIDOC_POST_STAGE, type AsciidocBaseSchema, type AsciidocConfigObject, type AsciidocPostStage, asciidocBaseSchema, asciidocDraftSchema, asciidocLoader };
