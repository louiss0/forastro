import type {
  Tree,
  GeneratorCallback,
} from '@nx/devkit';
import { toPascalCase } from '../../internal/strings/case.js';
import { parseProps, emitAstroPropsInterface } from '../../internal/generate/props.js';
import { ensureTreeDirs } from '../../internal/fs/tree-io.js';
import { safeWriteFile } from '../../internal/fs/tree-ops.js';
import { componentAstroTemplate } from '../../internal/templates/index.js';
import {
  runGeneratorWorkflow,
  type BaseGeneratorOptions,
  type GeneratorWorkflowConfig,
  type NormalizedBaseOptions,
  toKebabCase,
} from '../../internal/generate/workflow.js';

export interface ComponentGeneratorSchema extends BaseGeneratorOptions {
  props?: string;
  ext?: 'astro' | 'mdx';
  style?: 'none' | 'scoped' | 'global';
  language?: 'ts' | 'js';
}

export default async function (tree: Tree, options: ComponentGeneratorSchema): Promise<GeneratorCallback> {
  const config: GeneratorWorkflowConfig<ComponentGeneratorSchema> = {
    validation: {
      enumFields: [
        { field: 'ext', allowedValues: ['astro', 'mdx'] },
        { field: 'style', allowedValues: ['none', 'scoped', 'global'] },
        { field: 'language', allowedValues: ['ts', 'js'] },
      ],
    },
    pathResolution: {
      targetType: 'components',
      extension: options.ext === 'mdx' ? '.mdx' : '.astro',
      useKebabCase: true,
    },
    generate: generateComponent,
  };

  return runGeneratorWorkflow(tree, options, config);
}

function generateComponent(
  tree: Tree, 
  options: ComponentGeneratorSchema & NormalizedBaseOptions, 
  targetPath: string
): void {
  // Format names - PascalCase for filename and class name
  const pascalName = toPascalCase(options.name);
  const kebabName = toKebabCase(options.name);
  
  // Parse props if provided
  const propsDefinitions = options.props ? parseProps(options.props) : [];
  const hasProps = propsDefinitions.length > 0;
  
  // Generate props interface and extraction code
  const propsData = emitAstroPropsInterface(propsDefinitions);
  
  // Generate component content using in-memory template
  const templateOptions = {
    title: pascalName,
    className: kebabName,
    hasProps,
    propsInterface: propsData.interface,
    propsExtraction: propsData.propsExtraction,
    style: options.style || 'none',
    language: options.language || 'ts'
  };
  
  const componentContent = componentAstroTemplate(templateOptions);
  
  // Extract target directory from path
  const pathSegments = targetPath.split('/');
  const targetDir = pathSegments.slice(0, -1).join('/');
  
  // Ensure target directory exists using helper
  ensureTreeDirs(tree, targetDir);
  
  // Write the component file
  safeWriteFile(tree, targetPath, componentContent);
}



