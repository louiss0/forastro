import { toPascalCase, toKebabCase } from '../strings/case.js';

export interface GeneratorProps {
  name: string;
  className: string;
  fileName: string;
  directory: string;
  projectName: string;
  projectRoot: string;
  offsetFromRoot: string;
}

export interface ComponentProps extends GeneratorProps {
  tagName: string;
  propsInterface?: string;
  hasProps: boolean;
  isClientComponent: boolean;
  framework?: 'react' | 'vue' | 'svelte' | 'preact' | 'solid';
}

export interface PageProps extends GeneratorProps {
  title: string;
  description?: string;
  layout?: string;
  isMarkdown: boolean;
  contentType: 'astro' | 'md' | 'mdx' | 'markdoc' | 'adoc';
}

export interface ContentProps extends GeneratorProps {
  collection: string;
  schema?: string;
  frontmatterFields: Record<string, unknown>;
  contentFormat: 'md' | 'mdx' | 'markdoc' | 'adoc';
}

export function generateComponentProps(options: {
  name: string;
  directory: string;
  projectName: string;
  projectRoot: string;
  framework?: string;
  hasProps?: boolean;
  isClientComponent?: boolean;
}): ComponentProps {
  const { name, directory, projectName, projectRoot, framework, hasProps = false, isClientComponent = false } = options;
  
  const className = toPascalCase(name);
  const fileName = toKebabCase(name);
  const tagName = toKebabCase(name);
  
  // Calculate offset from root (for imports)
  const offsetFromRoot = calculateOffsetFromRoot(directory, projectRoot);
  
  let propsInterface: string | undefined;
  if (hasProps) {
    propsInterface = `${className}Props`;
  }
  
  return {
    name,
    className,
    fileName,
    directory,
    projectName,
    projectRoot,
    offsetFromRoot,
    tagName,
    propsInterface,
    hasProps,
    isClientComponent,
    framework: framework as ComponentProps['framework'],
  };
}

export function generatePageProps(options: {
  name: string;
  directory: string;
  projectName: string;
  projectRoot: string;
  title?: string;
  description?: string;
  layout?: string;
  contentType?: 'astro' | 'md' | 'mdx' | 'markdoc' | 'adoc';
}): PageProps {
  const { name, directory, projectName, projectRoot, title, description, layout, contentType = 'astro' } = options;
  
  const className = toPascalCase(name);
  const fileName = toKebabCase(name);
  const offsetFromRoot = calculateOffsetFromRoot(directory, projectRoot);
  const isMarkdown = contentType !== 'astro';
  
  return {
    name,
    className,
    fileName,
    directory,
    projectName,
    projectRoot,
    offsetFromRoot,
    title: title || className,
    description,
    layout,
    isMarkdown,
    contentType,
  };
}

export function generateContentProps(options: {
  name: string;
  directory: string;
  projectName: string;
  projectRoot: string;
  collection: string;
  schema?: string;
  frontmatterFields?: Record<string, unknown>;
  contentFormat?: 'md' | 'mdx' | 'markdoc' | 'adoc';
}): ContentProps {
  const { 
    name, 
    directory, 
    projectName, 
    projectRoot, 
    collection, 
    schema, 
    frontmatterFields = {}, 
    contentFormat = 'md' 
  } = options;
  
  const className = toPascalCase(name);
  const fileName = toKebabCase(name);
  const offsetFromRoot = calculateOffsetFromRoot(directory, projectRoot);
  
  return {
    name,
    className,
    fileName,
    directory,
    projectName,
    projectRoot,
    offsetFromRoot,
    collection,
    schema,
    frontmatterFields,
    contentFormat,
  };
}

export function generateGenericProps(options: {
  name: string;
  directory: string;
  projectName: string;
  projectRoot: string;
}): GeneratorProps {
  const { name, directory, projectName, projectRoot } = options;
  
  const className = toPascalCase(name);
  const fileName = toKebabCase(name);
  const offsetFromRoot = calculateOffsetFromRoot(directory, projectRoot);
  
  return {
    name,
    className,
    fileName,
    directory,
    projectName,
    projectRoot,
    offsetFromRoot,
  };
}

function calculateOffsetFromRoot(directory: string, projectRoot: string): string {
  const relativePath = directory.replace(projectRoot, '').replace(/^\//, '');
  const depth = relativePath.split('/').filter(Boolean).length;
  
  if (depth === 0) {
    return './';
  }
  
  return '../'.repeat(depth);
}

export function createFrontmatterObject(fields: Record<string, unknown>): string {
  const entries = Object.entries(fields).map(([key, value]) => {
    if (typeof value === 'string') {
      return `${key}: '${value}'`;
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      return `${key}: ${value}`;
    } else if (Array.isArray(value)) {
      const arrayValues = value.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ');
      return `${key}: [${arrayValues}]`;
    } else if (value && typeof value === 'object') {
      return `${key}: ${JSON.stringify(value)}`;
    }
    return `${key}: ${value}`;
  });
  
  return entries.join('\\n');
}

export function generateComponentImport(componentName: string, fromPath: string): string {
  const className = toPascalCase(componentName);
  return `import ${className} from '${fromPath}';`;
}

export function generateLayoutImport(layoutName: string, fromPath: string): string {
  const className = toPascalCase(layoutName);
  return `import ${className} from '${fromPath}';`;
}

/**
 * Represents a prop definition with name, type, and optional flag
 */
export interface PropDefinition {
  name: string;
  type: string;
  optional?: boolean;
}

/**
 * Parse a prop specification string into an array of prop definitions
 * Supports optional markers (?), union types, array types, and complex nested types
 * @param spec - String containing prop definitions in format "name:type,name?:type,variant:'a'|'b'"
 * @returns Array of prop definitions with name, type, and optional flag
 * 
 * @example
 * parsePropsString("title:string,description?:string,variant:'a'|'b'")
 * // Returns: [
 * //   { name: "title", type: "string", optional: false },
 * //   { name: "description", type: "string", optional: true },
 * //   { name: "variant", type: "'a'|'b'", optional: false }
 * // ]
 */
export function parsePropsString(spec: string): PropDefinition[] {
  if (!spec || spec.trim() === '') {
    return [];
  }
  
  // More sophisticated splitting that handles complex types with commas, quotes, and nested objects
  const props: string[] = [];
  let current = '';
  let depth = 0;
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < spec.length; i++) {
    const char = spec[i];
    const prevChar = i > 0 ? spec[i - 1] : '';
    
    // Handle string literals with quotes
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      }
      current += char;
    }
    // Handle nesting depth for objects, arrays, and generics
    else if (!inQuotes && (char === '{' || char === '[' || char === '(' || char === '<')) {
      depth++;
      current += char;
    }
    else if (!inQuotes && (char === '}' || char === ']' || char === ')' || char === '>')) {
      depth--;
      current += char;
    }
    // Split on commas only at depth 0 and not in quotes
    else if (!inQuotes && depth === 0 && char === ',') {
      if (current.trim()) {
        props.push(current.trim());
      }
      current = '';
    }
    else {
      current += char;
    }
  }
  
  // Add the last prop if there is one
  if (current.trim()) {
    props.push(current.trim());
  }
  
  return props
    .filter(prop => prop.length > 0)
    .map(prop => {
      // Check for optional marker - can be either after name (name?) or after type (type?)
      let name = '';
      let type = '';
      let optional = false;
      
      const colonIndex = prop.indexOf(':');
      if (colonIndex === -1) {
        throw new Error(`Invalid prop specification: "${prop}". Expected format: "name:type" or "name?:type"`);
      }
      
      name = prop.substring(0, colonIndex).trim();
      type = prop.substring(colonIndex + 1).trim();
      
      // Check for optional marker after name (name?)
      if (name.endsWith('?')) {
        optional = true;
        name = name.slice(0, -1).trim();
      }
      // Check for optional marker after type (type?)
      else if (type.endsWith('?')) {
        optional = true;
        type = type.slice(0, -1).trim();
      }
      
      if (!name || !type) {
        throw new Error(`Invalid prop specification: "${prop}". Expected format: "name:type" or "name?:type"`);
      }
      
      return { name, type, optional };
    });
}

/**
 * Legacy function for backward compatibility - delegates to parsePropsString
 * @deprecated Use parsePropsString instead
 */
export function parseProps(spec: string): PropDefinition[] {
  return parsePropsString(spec);
}

/**
 * Generate TypeScript interface and Astro.props extraction code for given props
 * Handles optional properties with proper TypeScript syntax
 * @param props - Array of prop definitions
 * @returns Object containing TypeScript interface and props extraction code
 * 
 * @example
 * emitAstroPropsInterface([{ name: "title", type: "string" }, { name: "count", type: "number", optional: true }])
 * // Returns: {
 * //   interface: "interface Props {\n  title: string;\n  count?: number;\n}",
 * //   propsExtraction: "const { title, count } = Astro.props;"
 * // }
 */
export function emitAstroPropsInterface(props: PropDefinition[]): {
  interface: string;
  propsExtraction: string;
} {
  if (props.length === 0) {
    return {
      interface: '',
      propsExtraction: ''
    };
  }
  
  // Generate TypeScript interface with proper optional syntax
  const interfaceLines = [
    'interface Props {',
    ...props.map(prop => {
      const optionalMarker = prop.optional ? '?' : '';
      return `  ${prop.name}${optionalMarker}: ${prop.type};`;
    }),
    '}'
  ];
  const interface_ = interfaceLines.join('\n');
  
  // Generate Astro.props extraction
  const propNames = props.map(prop => prop.name).join(', ');
  const propsExtraction = `const { ${propNames} } = Astro.props;`;
  
  return {
    interface: interface_,
    propsExtraction
  };
}

/**
 * Generate TypeScript interface string for props with custom interface name
 * @param name - The interface name (defaults to "Props")
 * @param props - Array of prop definitions
 * @returns TypeScript interface string
 * 
 * @example
 * generatePropsInterface("ButtonProps", [{ name: "label", type: "string" }])
 * // Returns: "export interface ButtonProps {\n  label: string;\n}"
 */
export function generatePropsInterface(name: string = 'Props', props: PropDefinition[]): string {
  if (props.length === 0) {
    return '';
  }
  
  const interfaceLines = [
    `export interface ${name} {`,
    ...props.map(prop => {
      const optionalMarker = prop.optional ? '?' : '';
      return `  ${prop.name}${optionalMarker}: ${prop.type};`;
    }),
    '}'
  ];
  
  return interfaceLines.join('\n');
}

/**
 * Format props interface string with consistent indentation and style
 * @param interfaceString - Raw TypeScript interface string
 * @returns Formatted interface string
 */
export function formatPropsInterface(interfaceString: string): string {
  if (!interfaceString.trim()) {
    return '';
  }
  
  // Extract interface name and body
  const interfaceMatch = interfaceString.match(/^((?:export\s+)?interface\s+\w+)\s*\{(.*)\}$/s);
  if (!interfaceMatch) {
    return interfaceString; // Return as-is if not a valid interface
  }
  
  const [, header, body] = interfaceMatch;
  
  // Split properties by semicolons, handling complex types
  const properties: string[] = [];
  let current = '';
  let depth = 0;
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    const prevChar = i > 0 ? body[i - 1] : '';
    
    // Handle quotes
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      }
      current += char;
    }
    // Handle nesting
    else if (!inQuotes && (char === '{' || char === '[' || char === '(' || char === '<')) {
      depth++;
      current += char;
    }
    else if (!inQuotes && (char === '}' || char === ']' || char === ')' || char === '>')) {
      depth--;
      current += char;
    }
    // Split on semicolons at depth 0
    else if (!inQuotes && depth === 0 && char === ';') {
      if (current.trim()) {
        properties.push(current.trim());
      }
      current = '';
    }
    else {
      current += char;
    }
  }
  
  // Add remaining property if any
  if (current.trim()) {
    properties.push(current.trim());
  }
  
  // Format the interface
  const formattedProps = properties
    .filter(prop => prop.length > 0)
    .map(prop => `  ${prop};`);
  
  return [
    header + ' {',
    ...formattedProps,
    '}'
  ].join('\n');
}

/**
 * Extract prop definitions from a TypeScript interface string
 * @param interfaceString - TypeScript interface string
 * @returns Array of prop definitions
 * 
 * @example
 * extractPropsFromInterface("interface Props { title: string; count?: number; }")
 * // Returns: [{ name: "title", type: "string", optional: false }, { name: "count", type: "number", optional: true }]
 */
export function extractPropsFromInterface(interfaceString: string): PropDefinition[] {
  const props: PropDefinition[] = [];
  
  if (!interfaceString.trim()) {
    return props;
  }
  
  // Extract the content between braces
  const braceStart = interfaceString.indexOf('{');
  const braceEnd = interfaceString.lastIndexOf('}');
  
  if (braceStart === -1 || braceEnd === -1 || braceEnd <= braceStart) {
    return props;
  }
  
  const content = interfaceString.substring(braceStart + 1, braceEnd);
  
  // Split properties by semicolons, handling complex types
  const properties: string[] = [];
  let current = '';
  let depth = 0;
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';
    
    // Handle quotes
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      }
      current += char;
    }
    // Handle nesting
    else if (!inQuotes && (char === '{' || char === '[' || char === '(' || char === '<')) {
      depth++;
      current += char;
    }
    else if (!inQuotes && (char === '}' || char === ']' || char === ')' || char === '>')) {
      depth--;
      current += char;
    }
    // Split on semicolons at depth 0
    else if (!inQuotes && depth === 0 && char === ';') {
      if (current.trim()) {
        properties.push(current.trim());
      }
      current = '';
    }
    else {
      current += char;
    }
  }
  
  // Add remaining property if any
  if (current.trim()) {
    properties.push(current.trim());
  }
  
  // Parse each property
  for (const prop of properties.filter(p => p.length > 0)) {
    // Find the first colon that's not inside nested structures
    let colonIndex = -1;
    let propDepth = 0;
    let propInQuotes = false;
    let propQuoteChar = '';
    
    for (let i = 0; i < prop.length; i++) {
      const char = prop[i];
      const prevChar = i > 0 ? prop[i - 1] : '';
      
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!propInQuotes) {
          propInQuotes = true;
          propQuoteChar = char;
        } else if (char === propQuoteChar) {
          propInQuotes = false;
          propQuoteChar = '';
        }
      }
      else if (!propInQuotes && (char === '{' || char === '[' || char === '(' || char === '<')) {
        propDepth++;
      }
      else if (!propInQuotes && (char === '}' || char === ']' || char === ')' || char === '>')) {
        propDepth--;
      }
      else if (!propInQuotes && propDepth === 0 && char === ':') {
        colonIndex = i;
        break;
      }
    }
    
    if (colonIndex !== -1) {
      let name = prop.substring(0, colonIndex).trim();
      let type = prop.substring(colonIndex + 1).trim();
      
      // Remove trailing semicolon from type
      if (type.endsWith(';')) {
        type = type.slice(0, -1).trim();
      }
      
      // Check for optional marker
      let optional = false;
      if (name.endsWith('?')) {
        optional = true;
        name = name.slice(0, -1).trim();
      }
      
      if (name && type) {
        props.push({
          name,
          type,
          optional
        });
      }
    }
  }
  
  return props;
}
