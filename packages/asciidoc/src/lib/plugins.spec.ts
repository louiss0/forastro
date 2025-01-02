import { getCSSWithSelectorName } from "./plugins";

describe("Testing Unocss Plugin functions", () => {


	describe("Testing getCSSWithSelectorName", () => {


		test("it works", () => {

			const getCSS = getCSSWithSelectorName(".prose")

			const result = getCSS()

			expect(result).toContain(".prose")

			expect(result).toContain("@property")

		})


		test("css output has doesn't have :where() with @property in it", () => {

			const getCSS = getCSSWithSelectorName(".prose")

			const result = getCSS()

			expect(result).not.toContain(":is(@property)")


		})

		test("css output has the :is() selector on", () => {

			const getCSS = getCSSWithSelectorName("prose")

			const result = getCSS()

			const selectorNames = result
				.split(/\s+/)

			expect(selectorNames.some(string => string.match(/:where\(.+\),?/))).toBeTruthy()

		})

		test("css output is what is expected", () => {

			const getCSS = getCSSWithSelectorName("prose")

			const result = getCSS()


			expect(result).toMatchInlineSnapshot(`
              "@property --faa-prose-color-950 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#020617;
              }

              @property --faa-prose-color-900 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#0f172a;
              }

              @property --faa-prose-color-800 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#1e293b;
              }

              @property --faa-prose-color-700 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#334155;
              }

              @property --faa-prose-color-600 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#475569;
              }

              @property --faa-prose-color-500 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#64748b;
              }

              @property --faa-prose-color-400 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#94a3b8;
              }

              @property --faa-prose-color-300 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#cbd5e1;
              }

              @property --faa-prose-color-200 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#e2e8f0;
              }

              @property --faa-prose-color-100 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#f1f5f9;
              }

              @property --faa-prose-color-50 {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#f8fafc;
              }

              @property --faa-prose-tip-color {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#10b981;
              }

              @property --faa-prose-warning-color {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#eab308;
              }

              @property --faa-prose-caution-color {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#ef4444;
              }

              @property --faa-prose-note-color {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#06b6d4;
              }

              @property --faa-prose-important-color {
              	syntax:'<color>';
              	inherits:false;
              	initial-value:#71717a;
              }

              .prose :where(a):not(:where(.not-prose,.not-prose *)) {
              	color:var(--faa-prose-color-500);
              	text-decoration:underline;
              	line-height:inherit;
              }

              .prose :where(a:hover, a:focus, a:active):not(:where(.not-prose,.not-prose *)) {
              	color:var(--faa-prose-color-600);
              	outline:0;
              }

              .prose :where(h1):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-5);
              }

              .prose :where(h2):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-4);
              }

              .prose :where(h3):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-3);
              }

              .prose :where(h4):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-2);
              }

              .prose :where(h5):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-1);
              }

              .prose :where(abbr):not(:where(.not-prose,.not-prose *)) {
              	cursor:help;
              	padding-inline:var(--faa-prose-space-neg-1);
              	font-size:var(--faa-prose-step-neg-1);
              }

              .prose :where(details):not(:where(.not-prose,.not-prose *)) {
              	padding:var(--faa-prose-space-5) var(--faa-prose-space-6);
              	background:var(--faa-prose-color-100);
              }

              .prose :where(ul):not(:where(.not-prose,.not-prose *)) {
              	list-style-type:circle;
              }

              .prose :where(ul ul):not(:where(.not-prose,.not-prose *)) {
              	list-style-type:disc;
              }

              .prose :where(ol):not(:where(.not-prose,.not-prose *)) {
              	list-style-type:decimal;
              }

              .prose :where(p:has(.keyseq)):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	gap:var(--faa-prose-space-4);
              }

              .prose :where(h1 > small, h2 > small, h3 > small, h4 > small, h5 > small):not(:where(.not-prose,.not-prose *)) {
              	font-size:60%;
              	padding:var(--faa-prose-space-2) var(--faa-prose-space-4);
              }

              .prose :where(code, kbd, pre, samp):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-neg-1);
              }

              .prose :where(pre):not(:where(.not-prose,.not-prose *)) {
              	white-space:pre-wrap;
              	line-height:1.45;
              	text-rendering:optimizeSpeed;
              }

              .prose :where(small):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-neg-2);
              }

              .prose :where(mark):not(:where(.not-prose,.not-prose *)) {
              	padding:var(--faa-prose-space-2);
              	background-color:var(--faa-prose-color-200);
              }

              .prose :where(ul, ol, dl):not(:where(.not-prose,.not-prose *)) {
              	line-height:1.6;
              	display:flex;
              	flex-direction:column;
              	gap:var(--faa-prose-space-6);
              	padding-inline:var(--faa-prose-space-3);
              }

              .prose :where(ul li ul, ul li ol, ol li ul, ol li ol):not(:where(.not-prose,.not-prose *)) {
              	padding-inline:var(--faa-prose-space-9);
              	gap:var(--faa-prose-space-5);
              }

              .prose :where(#content):not(:where(.not-prose,.not-prose *)) {
              	margin:var(--faa-prose-space-8) 0 var(--faa-prose-space-4);
              }

              .prose :where(#footer):not(:where(.not-prose,.not-prose *)) {
              	max-width:none;
              	padding:var(--faa-prose-space-8);
              }

              .prose :where(#footer-text):not(:where(.not-prose,.not-prose *)) {
              	line-height:1.5;
              }

              .prose :where(#header, #content, #footnotes, #footer):not(:where(.not-prose,.not-prose *)) {
              	width:100%;
              	max-width:62.5rem;
              	position:relative;
              	padding:var(--faa-prose-space-2) var(--faa-prose-space-6);
              }

              .prose :where(#header::before, #content::before, #footnotes::before, #footer::before, #header::after, #content::after, #footnotes::after, #footer::after):not(:where(.not-prose,.not-prose *)) {
              	content:" ";
              	display:table;
              	clear:both;
              }

              .prose :where(table.tableblock):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-neg-1);
              	color:var(--faa-prose-color-700);
              	border-bottom:3px solid var(--faa-prose-color-600);
              }

              .prose :where(.tableblock tr):nth-child(2n):not(:where(.not-prose,.not-prose *)) {
              	background-color:var(--faa-prose-color-200);
              	color:var(--faa-prose-color-600);
              	border-bottom:2px solid var(--faa-prose-color-600);
              }

              .prose :where(.tableblock th):not(:where(.not-prose,.not-prose *)) {
              	background-color:var(--faa-prose-color-300);
              	border-bottom:1px solid var(--faa-prose-color-500);
              }

              .prose :where(.qlist ol):not(:where(.not-prose,.not-prose *)) {
              	list-style-type:none;
              	display:flex;
              	flex-direction:column;
              	row-gap:var(--faa-prose-space-2);
              }

              .prose :where(.qlist li)::before:not(:where(.not-prose,.not-prose *)) {
              	content:'\\0051';
              	color:var(--faa-prose-color-400);
              	font-size:var(--faa-prose-step-neg-1);
              	padding-inline:var(--faa-prose-space-2);
              }

              .prose :where(.paragraph):not(:where(.not-prose,.not-prose *)) {
              	line-height:1.6;
              	max-width:65ch;
              	text-rendering:optimizeLegibility;
              }

              .prose :where(.toc):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	flex-direction:column;
              	gap:var(--faa-prose-space-4);
              	padding-inline:var(--faa-prose-space-15);
              	padding-block:var(--faa-prose-space-5);
              }

              .prose :where(.toc #toctitle):not(:where(.not-prose,.not-prose *)) {
              	font-weight:500;
              	padding-block:var(--faa-prose-space-2);
              }

              .prose :where(.toc ul):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-neg-1);
              }

              .prose :where(.toc ul li):has(ul):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	flex-direction:column;
              	column-gap:var(--faa-prose-space-2);
              }

              .prose :where(.sectionbody):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	flex-direction:column;
              	row-gap:var(--faa-prose-space-12);
              }

              .prose :where(.sect1):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	flex-direction:column;
              	row-gap:var(--faa-prose-space-9);
              }

              .prose :where(.admonitionblock > table:not(:has(td.content .paragraph)) tr):not(:where(.not-prose,.not-prose *)) {
              	border-inline:1px solid currentColor;
              }

              .prose :where(.admonitionblock > table:not(:has(td.content .paragraph)) td.icon):not(:where(.not-prose,.not-prose *)) {
              	padding-inline:var(--faa-prose-space-3);
              }

              .prose :where(.admonitionblock > table:not(:has(td.content .paragraph)) td.content):not(:where(.not-prose,.not-prose *)) {
              	border-left:1px solid currentColor;
              }

              .prose :where(.admonitionblock > table:has(td.content .paragraph) tr):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	flex-direction:column;
              	border-inline:4px solid currentColor;
              	background:#fff;
              }

              .prose :where(.admonitionblock > table:has(td.content .paragraph) td):not(:where(.not-prose,.not-prose *)) {
              	padding-inline:1.5em;
              }

              .prose :where(.admonitionblock > table:has(td.content .paragraph) td.content):not(:where(.not-prose,.not-prose *)) {
              	padding-inline:0.75em;
              	word-wrap:anywhere;
              	display:flex;
              	flex-direction:column;
              	gap:var(--faa-prose-space-3);
              }

              .prose :where(.admonitionblock > table:has(td.content .paragraph) td.content .title):not(:where(.not-prose,.not-prose *)) {
              	font-size:1.25rem;
              }

              .prose :where(.admonitionblock > table:has(td.content .paragraph) td.content .paragraph):not(:where(.not-prose,.not-prose *)) {
              	padding-inline:var(--faa-prose-space-3);
              	font-size:var(--faa-prose-step-neg-1);
              }

              .prose :where(.admonitionblock.tip):not(:where(.not-prose,.not-prose *)) {
              	color:var(--faa-prose-tip-color);
              }

              .prose :where(.admonitionblock.note):not(:where(.not-prose,.not-prose *)) {
              	color:var(--faa-prose-note-color);
              }

              .prose :where(.admonitionblock.important):not(:where(.not-prose,.not-prose *)) {
              	color:var(--faa-prose-important-color);
              }

              .prose :where(.admonitionblock.warning):not(:where(.not-prose,.not-prose *)) {
              	color:var(--faa-prose-warning-color);
              }

              .prose :where(.admonitionblock.caution):not(:where(.not-prose,.not-prose *)) {
              	color:var(--faa-prose-caution-color);
              }

              .prose :where(.button):not(:where(.not-prose,.not-prose *)) {
              	padding-inline:var(--faa-prose-space-2);
              	padding-block:var(--faa-prose-space-1);
              	color:var(--faa-prose-color-700);
              	display:flex inline;
              	column-gap:var(--faa-prose-space-2);
              }

              .prose :where(.button::before):not(:where(.not-prose,.not-prose *)) {
              	content:'[';
              }

              .prose :where(.button::after):not(:where(.not-prose,.not-prose *)) {
              	content:']';
              }

              .prose :where(.menuseq):not(:where(.not-prose,.not-prose *)) {
              	color:var(--faa-prose-color-700);
              }

              .prose :where(.menuseq .caret):not(:where(.not-prose,.not-prose *)) {
              	color:var(--faa-prose-color-400);
              }

              .prose :where(.menuseq .menuitem):not(:where(.not-prose,.not-prose *)) {
              	color:var(--faa-prose-color-500);
              }

              .prose :where(.sidebarblock):not(:where(.not-prose,.not-prose *)) {
              	border:1px solid currentColor;
              	padding:var(--faa-prose-space-7);
              	border-radius:4px;
              	background-color:var(--faa-prose-color-100);
              	font-size:var(--faa-prose-step-neg-1);
              }

              .prose :where(.sidebarblock .content):not(:where(.not-prose,.not-prose *)) {
              	flex-direction:column;
              	display:flex;
              	row-gap:var(--faa-prose-space-7);
              }

              .prose :where(.sidebarblock .content > .title):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-1);
              	text-align:center;
              	font-weight:700;
              	color:var(--faa-prose-color-700);
              }

              .prose :where(.listingblock):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	flex-direction:column;
              	row-gap:var(--faa-prose-space-3);
              	background-color:var(--faa-prose-color-100);
              	padding-inline:var(--faa-prose-space-9);
              	padding-block:var(--faa-prose-space-6);
              	border-radius:var(--faa-prose-space-3);
              	color:var(--faa-prose-color-700);
              	font-size:var(--faa-prose-step-neg-1);
              }

              .prose :where(.literalblock):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	flex-direction:column;
              	row-gap:var(--faa-prose-space-3);
              	background-color:var(--faa-prose-color-200);
              	padding-inline:var(--faa-prose-space-9);
              	padding-block:var(--faa-prose-space-6);
              	border-radius:var(--faa-prose-space-3);
              	color:var(--faa-prose-color-700);
              	font-size:var(--faa-prose-step-neg-1);
              }

              .prose :where(.exampleblock):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	flex-direction:column;
              	row-gap:var(--faa-prose-space-9);
              	border:3px solid currentColor;
              	border-radius:1rem;
              	font-size:var(--faa-prose-step-neg-1);
              	padding-inline:var(--faa-prose-space-6);
              	padding-block:var(--faa-prose-step-3);
              }

              .prose :where(.exampleblock .title):not(:where(.not-prose,.not-prose *)) {
              	padding-inline:var(--faa-prose-step-1);
              	font-size:var(--faa-prose-step-1);
              	font-weight:600;
              }

              .prose :where(.quoteblock):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	flex-direction:column;
              	gap:var(--faa-prose-space-4);
              }

              .prose :where(.quoteblock blockquote):not(:where(.not-prose,.not-prose *)) {
              	gap:var(--faa-prose-space-2);
              }

              .prose :where(.quoteblock .attribution):not(:where(.not-prose,.not-prose *)) {
              	font-size:var(--faa-prose-step-neg-1);
              }

              .prose :where(.dlist dl):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	flex-direction:column;
              	gap:var(--faa-prose-space-4);
              }

              .prose :where(.dlist dl dt):not(:where(.not-prose,.not-prose *)) {
              	font-weight:bold;
              }

              .prose :where(.dlist dl dd):not(:where(.not-prose,.not-prose *)) {
              	padding-inline:var(--faa-prose-space-5);
              	max-width:50ch;
              }

              .prose :where(blockquote):not(:where(.not-prose,.not-prose *)) {
              	padding-top:var(--faa-prose-space-4);
              	padding-inline:var(--faa-prose-space-8);
              	padding-bottom:var(--faa-prose-space-7);
              	border-left:1px solid currentColor;
              }

              .prose :where(blockquote, quote p):not(:where(.not-prose,.not-prose *)) {
              	line-height:1.6;
              }

              .prose :where(table):not(:where(.not-prose,.not-prose *)) {
              	border-collapse:collapse;
              	border-spacing:0;
              	word-wrap:normal;
              }

              .prose :where(thead th, thead td, tfoot th, tfoot td):not(:where(.not-prose,.not-prose *)) {
              	padding:var(--faa-prose-space-3) var(--faa-prose-space-4);
              	font-size:inherit;
              	text-align:left;
              }

              .prose :where(th, td):not(:where(.not-prose,.not-prose *)) {
              	padding:var(--faa-prose-space-3) var(--faa-prose-space-5);
              	font-size:inherit;
              }

              .prose :where(kbd):not(:where(.not-prose,.not-prose *)) {
              	padding-block:var(--faa-prose-space-3);
              	border:1px solid currentColor;
              	border-radius:var(--faa-prose-space-3);
              	padding-inline:var(--faa-prose-space-5);
              	background-color:var(--faa-prose-color-200);
              }

              .prose :where(.keyseq):not(:where(.not-prose,.not-prose *)) {
              	display:flex;
              	gap:var(--faa-prose-space-2);
              	align-items:center;
              }

              .prose :where(.hide):not(:where(.not-prose,.not-prose *)) {
              	display:none;
              }

              .prose :where(.text-left):not(:where(.not-prose,.not-prose *)) {
              	text-align:left;
              }

              .prose :where(.text-center):not(:where(.not-prose,.not-prose *)) {
              	text-align:center;
              }

              .prose :where(.text-right):not(:where(.not-prose,.not-prose *)) {
              	text-align:right;
              }

              .prose :where(.text-justify):not(:where(.not-prose,.not-prose *)) {
              	text-align:justify;
              }

              .prose :where(.underline):not(:where(.not-prose,.not-prose *)) {
              	text-decoration:underline;
              	text-underline-offset:var(--faa-prose-space-2);
              }

              .prose :where(.line-through):not(:where(.not-prose,.not-prose *)) {
              	text-decoration:line-through;
              }

              .prose :where(.overline):not(:where(.not-prose,.not-prose *)) {
              	text-decoration:overline;
              }

              .prose :where(pre.nobreak, :not(pre).nobreak):not(:where(.not-prose,.not-prose *)) {
              	word-wrap:normal;
              }

              .prose :where(pre.nowrap, :not(pre).nowrap):not(:where(.not-prose,.not-prose *)) {
              	white-space:nowrap;
              }

              .prose :where(pre.pre-wrap, :not(pre).pre-wrap):not(:where(.not-prose,.not-prose *)) {
              	white-space:pre-wrap;
              }

              .prose :where(div.unbreakable):not(:where(.not-prose,.not-prose *)) {
              	page-break-inside:avoid;
              }

              .prose :where(.stretch):not(:where(.not-prose,.not-prose *)) {
              	width:100%;
              }
              "
            `)

		})

	})

})