import { toPascalCase, toKebabCase } from './pathing.js';

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
 * Represents a prop definition with name and type
 */
export interface PropDefinition {
  name: string;
  type: string;
}

/**
 * Parse a prop specification string into an array of prop definitions
 * @param spec - String containing prop definitions in format "name:type,name:type"
 * @returns Array of prop definitions
 * 
 * @example
 * parseProps("title:string,count:number,isVisible:boolean")
 * // Returns: [{ name: "title", type: "string" }, { name: "count", type: "number" }, { name: "isVisible", type: "boolean" }]
 */
export function parseProps(spec: string): PropDefinition[] {
  if (!spec || spec.trim() === '') {
    return [];
  }
  
  return spec
    .split(',')
    .map(prop => prop.trim())
    .filter(prop => prop.length > 0)
    .map(prop => {
      const [name, type] = prop.split(':').map(part => part.trim());
      
      if (!name || !type) {
        throw new Error(`Invalid prop specification: "${prop}". Expected format: "name:type"`);
      }
      
      return { name, type };
    });
}

/**
 * Generate TypeScript interface and Astro.props extraction code for given props
 * @param props - Array of prop definitions
 * @returns Object containing TypeScript interface and props extraction code
 * 
 * @example
 * emitAstroPropsInterface([{ name: "title", type: "string" }, { name: "count", type: "number" }])
 * // Returns: {
 * //   interface: "interface Props {\n  title: string;\n  count: number;\n}",
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
  
  // Generate TypeScript interface
  const interfaceLines = [
    'interface Props {',
    ...props.map(prop => `  ${prop.name}: ${prop.type};`),
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
